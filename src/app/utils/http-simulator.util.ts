import { HttpClient } from '@angular/common/http';
import { catchError, of, delay } from 'rxjs';

export class HttpRequest {
  private static httpClient: HttpClient;

  static configure(http: HttpClient): void {
    this.httpClient = http;
  }

  private static execute<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    callback: () => T,
    data?: unknown
  ): void {

    const httpMethods = {
      GET: () => this.httpClient.get(url),
      POST: () => this.httpClient.post(url, data),
      PUT: () => this.httpClient.put(url, data),
      DELETE: () => this.httpClient.delete(url)
    };

    httpMethods[method]().pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      callback();
    });
  }

  static fromPost<T>(url: string, data: unknown, callback: () => T): void {
    this.execute('POST', url, callback, data);
  }

  static fromPut<T>(url: string, data: unknown, callback: () => T): void {
    this.execute('PUT', url, callback, data);
  }

  static fromDelete<T>(url: string, callback: () => T): void {
    this.execute('DELETE', url, callback);
  }

  static fromGet<T>(url: string, callback: () => T): void {
    this.execute('GET', url, callback);
  }

  static fromHttp<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    callback: () => T,
    data?: unknown
  ): void {
    this.execute(method, url, callback, data);
  }
}
