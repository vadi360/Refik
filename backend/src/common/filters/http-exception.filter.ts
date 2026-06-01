// ============================================================================
// HTTP Exception Filter (http-exception.filter.ts)
// Açıklama: Global hata yakalama filtresi
// 
// Bu filter:
// 1. Tüm HTTP exception'larını yakalar
// 2. Hataları standart bir formatta döndürür
// 3. Üretim ortamında detaylı hata mesajlarını gizler
// 4. Hataları loglar
// ============================================================================
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Hata yanıtı arayüzü
 */
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // Logger instance'ı
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Exception'ı yakala ve işle
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HTTP status code belirle
    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      // NestJS HttpException
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      }
    } else if (exception instanceof Error) {
      // Genel JavaScript hatası
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = exception.name;
    } else {
      // Bilinmeyen hata
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Bilinmeyen bir hata oluştu';
      error = 'InternalServerError';
    }

    // Hata bilgisini logla
    this.logError(status, request, message, exception);

    // Üretim ortamında ise detaylı mesajları gizle
    const isProduction = process.env.NODE_ENV === 'production';
    const responseBody: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: isProduction && status >= 500 ? 'Sunucu hatası oluştu' : message,
      ...(isProduction ? {} : { error }),
    };

    response.status(status).json(responseBody);
  }

  /**
   * Hatayı logla
   */
  private logError(status: number, request: Request, message: string | string[], exception: unknown) {
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';

    // 5xx hatalarını error olarak logla
    if (status >= 500) {
      this.logger.error(
        `${method} ${url} ${status} - ${JSON.stringify(message)} - IP: ${ip} - User-Agent: ${userAgent}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      // 4xx hatalarını warning olarak logla
      this.logger.warn(
        `${method} ${url} ${status} - ${JSON.stringify(message)} - IP: ${ip}`,
      );
    }
  }
}