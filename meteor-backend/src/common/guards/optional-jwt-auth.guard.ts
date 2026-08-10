import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard: validates the token when present, but allows anonymous
 * requests through (user stays undefined) instead of throwing 401.
 * Used by public read endpoints that still want per-user context (e.g. mySubmission).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: Error | null, user: TUser | false): TUser | undefined {
    if (err || !user) {
      return undefined;
    }
    return user;
  }
}
