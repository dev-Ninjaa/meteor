import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message || exception.message,
      error:
        typeof exceptionResponse === 'string'
          ? undefined
          : (exceptionResponse as Record<string, unknown>).error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(`HTTP Exception: ${JSON.stringify(errorResponse)}`);

    response.status(status).json(errorResponse);
  }
}
