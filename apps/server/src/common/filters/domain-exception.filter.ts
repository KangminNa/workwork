import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { DomainException } from '../exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.status ?? HttpStatus.BAD_REQUEST;
    const error = HttpStatus[status] || 'Bad Request';

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error,
    });
  }
}
