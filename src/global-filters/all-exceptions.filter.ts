import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // This will catch all exceptions
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string | object;

    // Check if the exception is an instance of HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus(); // Get the status code
      errorMessage = exception.message; // Get the error response (could be a string or object)
      console.log(exception.message);
    } else if (exception instanceof BadRequestException) {
      status = exception.getStatus(); // Get the status code
      errorMessage = exception.message; // Get the error response (could be a string or object)
    } else {
      // If it's not an instance of HttpException, assume an internal server error
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Internal server error'; // Default error message
    }

    // Log the error response for debugging
    console.error('Exception Stack Trace:', exception);

    // Send the error response to the client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    });
  }
}
