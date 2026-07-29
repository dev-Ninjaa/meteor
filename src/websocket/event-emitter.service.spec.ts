import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitterService } from './event-emitter.service';

describe('EventEmitterService', () => {
  let service: EventEmitterService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitterService],
    }).compile();

    service = module.get<EventEmitterService>(EventEmitterService);
  });

  beforeEach(() => {
    service.removeAllListeners();
  });

  describe('emit and on', () => {
    it('should emit and receive events', (done) => {
      service.on('test.event', (payload) => {
        expect(payload.event).toBe('test.event');
        expect(payload.data).toEqual({ key: 'value' });
        done();
      });

      service.emit('test.event', { key: 'value' });
    });

    it('should not receive events after removing listeners', () => {
      const listener = jest.fn();
      service.on('test.event', listener);
      service.removeAllListeners('test.event');

      service.emit('test.event', { key: 'value' });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners on same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      service.on('test.event', listener1);
      service.on('test.event', listener2);

      service.emit('test.event', { key: 'value' });

      expect(listener1).toHaveBeenCalledWith({ event: 'test.event', data: { key: 'value' } });
      expect(listener2).toHaveBeenCalledWith({ event: 'test.event', data: { key: 'value' } });
    });
  });

  describe('onModuleDestroy', () => {
    it('should remove all listeners', () => {
      const listener = jest.fn();
      service.on('test.event', listener);
      service.onModuleDestroy();

      service.emit('test.event', { key: 'value' });

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
