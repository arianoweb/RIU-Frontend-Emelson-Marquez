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
    data?: any,
    delayMs: number = 500
  ): void {

    const httpMethods = {
      GET: () => this.httpClient.get(url),
      POST: () => this.httpClient.post(url, data),
      PUT: () => this.httpClient.put(url, data),
      DELETE: () => this.httpClient.delete(url)
    };

    httpMethods[method]().pipe(
      delay(delayMs),
      catchError(() => of(null))
    ).subscribe(() => {
      callback();
    });
  }

  static fromPost<T>(url: string, data: any, callback: () => T, delayMs?: number): void {
    this.execute('POST', url, callback, data, delayMs);
  }

  static fromPut<T>(url: string, data: any, callback: () => T, delayMs?: number): void {
    this.execute('PUT', url, callback, data, delayMs);
  }

  static fromDelete<T>(url: string, callback: () => T, delayMs?: number): void {
    this.execute('DELETE', url, callback, undefined, delayMs);
  }

  static fromGet<T>(url: string, callback: () => T, delayMs?: number): void {
    this.execute('GET', url, callback, undefined, delayMs);
  }

  static fromHttp<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    callback: () => T,
    data?: any,
    delayMs?: number
  ): void {
    this.execute(method, url, callback, data, delayMs);
  }
}
