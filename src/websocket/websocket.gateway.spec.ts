import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WebSocketGateway } from './websocket.gateway';
import { EventEmitterService } from './event-emitter.service';
import { databaseConfig } from '../config';

interface MockSocket {
  id: string;
  userId?: string;
  handshake: {
    auth: Record<string, unknown>;
    headers: Record<string, string | string[] | undefined>;
  };
  join: jest.Mock;
  leave: jest.Mock;
  emit: jest.Mock;
  disconnect: jest.Mock;
}

function createMockSocket(overrides: Partial<MockSocket> = {}): MockSocket {
  return {
    id: 'socket-id',
    handshake: { auth: {}, headers: {} },
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    ...overrides,
  };
}

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let jwtService: JwtService;
  let eventEmitter: EventEmitterService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      providers: [
        WebSocketGateway,
        EventEmitterService,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-id' }),
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
      ],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
    jwtService = module.get<JwtService>(JwtService);
    eventEmitter = module.get<EventEmitterService>(EventEmitterService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    const mockServer = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      emit: jest.fn(),
    } as unknown as Server;
    gateway.server = mockServer;
  });

  describe('afterInit', () => {
    it('should initialize and set up event listeners', () => {
      const emitSpy = jest.spyOn(eventEmitter, 'on');
      gateway.afterInit();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('handleConnection', () => {
    it('should authenticate with token from auth handshake', async () => {
      const client = createMockSocket({
        id: 'socket-1',
        handshake: { auth: { token: 'valid-token' }, headers: {} },
      });

      await gateway.handleConnection(client as unknown as Socket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(client.join).toHaveBeenCalledWith('user:user-id');
    });

    it('should authenticate with token from authorization header', async () => {
      const client = createMockSocket({
        id: 'socket-2',
        handshake: {
          auth: {},
          headers: { authorization: 'Bearer header-token' },
        },
      });

      await gateway.handleConnection(client as unknown as Socket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('header-token');
    });

    it('should reject connection when no token provided', async () => {
      const client = createMockSocket({ id: 'socket-3' });

      await gateway.handleConnection(client as unknown as Socket);

      expect(client.emit).toHaveBeenCalledWith('error', { message: 'Authentication required' });
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should reject connection with invalid token', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error('Invalid token'));

      const client = createMockSocket({
        id: 'socket-4',
        handshake: { auth: { token: 'bad-token' }, headers: {} },
      });

      await gateway.handleConnection(client as unknown as Socket);

      expect(client.emit).toHaveBeenCalledWith('error', { message: 'Invalid or expired token' });
      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnection', () => {
      const client = createMockSocket({ id: 'socket-1', userId: 'user-id' });
      expect(() => gateway.handleDisconnect(client as unknown as Socket)).not.toThrow();
    });
  });

  describe('subscribe:user', () => {
    it('should join user room when userId matches', () => {
      const client = createMockSocket({ userId: 'user-id' });

      gateway.handleSubscribeUser(client as unknown as Socket, 'user-id');

      expect(client.join).toHaveBeenCalledWith('user:user-id');
    });

    it('should reject subscribing to another user', () => {
      const client = createMockSocket({ userId: 'user-id' });

      gateway.handleSubscribeUser(client as unknown as Socket, 'other-user');

      expect(client.emit).toHaveBeenCalledWith('error', {
        message: "Cannot subscribe to another user's events",
      });
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe:user', () => {
    it('should leave user room when userId matches', () => {
      const client = createMockSocket({ userId: 'user-id' });

      gateway.handleUnsubscribeUser(client as unknown as Socket, 'user-id');

      expect(client.leave).toHaveBeenCalledWith('user:user-id');
    });

    it('should reject unsubscribing from another user', () => {
      const client = createMockSocket({ userId: 'user-id' });

      gateway.handleUnsubscribeUser(client as unknown as Socket, 'other-user');

      expect(client.emit).toHaveBeenCalledWith('error', {
        message: "Cannot unsubscribe from another user's events",
      });
      expect(client.leave).not.toHaveBeenCalled();
    });
  });

  describe('subscribe:task', () => {
    it('should join task room', () => {
      const client = createMockSocket();

      gateway.handleSubscribeTask(client as unknown as Socket, 'task-id');

      expect(client.join).toHaveBeenCalledWith('task:task-id');
    });
  });

  describe('unsubscribe:task', () => {
    it('should leave task room', () => {
      const client = createMockSocket();

      gateway.handleUnsubscribeTask(client as unknown as Socket, 'task-id');

      expect(client.leave).toHaveBeenCalledWith('task:task-id');
    });
  });

  describe('event broadcasting', () => {
    it('should broadcast task events to task room', () => {
      const emitSpy = jest.fn();
      const toSpy = jest.fn().mockReturnValue({ emit: emitSpy });
      gateway.server.to = toSpy;

      const data = { taskId: 'task-1', title: 'test' };
      gateway.broadcastToTask('task-1', 'task.created', data);

      expect(toSpy).toHaveBeenCalledWith('task:task-1');
      expect(emitSpy).toHaveBeenCalledWith('task.created', data);
    });

    it('should broadcast user events to user room', () => {
      const emitSpy = jest.fn();
      const toSpy = jest.fn().mockReturnValue({ emit: emitSpy });
      gateway.server.to = toSpy;

      const data = { userId: 'user-1', notification: {} };
      gateway.broadcastToUser('user-1', 'notification.created', data);

      expect(toSpy).toHaveBeenCalledWith('user:user-1');
      expect(emitSpy).toHaveBeenCalledWith('notification.created', data);
    });
  });
});
