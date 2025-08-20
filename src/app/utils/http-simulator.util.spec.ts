import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { HttpRequest } from './http-simulator.util';

describe('HttpRequest', () => {
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    
    HttpRequest.configure(httpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should configure HttpClient', () => {
    const testHttpClient = TestBed.inject(HttpClient);
    
    HttpRequest.configure(testHttpClient);
    
    expect(HttpRequest).toBeTruthy();
  });

  it('should execute POST request with callback', (done) => {
    const testUrl = '/api/test';
    const testData = { name: 'Test Data' };
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromPost(testUrl, testData, callback, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testData);
    
    req.flush({ success: true });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should execute PUT request with callback', (done) => {
    const testUrl = '/api/test/1';
    const testData = { id: 1, name: 'Updated Data' };
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromPut(testUrl, testData, callback, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(testData);
    
    req.flush({ success: true });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should execute DELETE request with callback', (done) => {
    const testUrl = '/api/test/1';
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromDelete(testUrl, callback, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeNull();
    
    req.flush({ success: true });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should execute GET request with callback', (done) => {
    const testUrl = '/api/test';
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromGet(testUrl, callback, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeNull();
    
    req.flush({ data: 'test' });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should execute fromHttp with POST method', (done) => {
    const testUrl = '/api/generic';
    const testData = { value: 'test' };
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromHttp('POST', testUrl, callback, testData, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testData);
    
    req.flush({ success: true });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should execute fromHttp with GET method', (done) => {
    const testUrl = '/api/generic';
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromHttp('GET', testUrl, callback, undefined, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeNull();
    
    req.flush({ data: 'test' });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should execute fromHttp with PUT method', (done) => {
    const testUrl = '/api/generic/1';
    const testData = { id: 1, updated: true };
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromHttp('PUT', testUrl, callback, testData, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(testData);
    
    req.flush({ success: true });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should execute fromHttp with DELETE method', (done) => {
    const testUrl = '/api/generic/1';
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromHttp('DELETE', testUrl, callback, undefined, 100);

    const req = httpTestingController.expectOne(testUrl);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeNull();
    
    req.flush({ success: true });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should handle HTTP errors and still execute callback', (done) => {
    const testUrl = '/api/error';
    const testData = { name: 'Test Data' };
    let callbackExecuted = false;
    
    const callback = () => {
      callbackExecuted = true;
      return 'callback result';
    };

    HttpRequest.fromPost(testUrl, testData, callback, 100);

    const req = httpTestingController.expectOne(testUrl);
    req.error(new ProgressEvent('error'));

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 150);
  });

  it('should use default delay when not specified', (done) => {
    const testUrl = '/api/default-delay';
    let callbackExecuted = false;
    let startTime = Date.now();
    
    const callback = () => {
      callbackExecuted = true;
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(450);
      return 'callback result';
    };

    HttpRequest.fromGet(testUrl, callback);

    const req = httpTestingController.expectOne(testUrl);
    req.flush({ data: 'test' });

    setTimeout(() => {
      expect(callbackExecuted).toBeTruthy();
      done();
    }, 600);
  });

  it('should handle callback with return value', (done) => {
    const testUrl = '/api/return-value';
    const expectedReturn = { result: 'success', id: 123 };
    let actualReturn: any;
    
    const callback = () => {
      actualReturn = expectedReturn;
      return expectedReturn;
    };

    HttpRequest.fromPost(testUrl, {}, callback, 100);

    const req = httpTestingController.expectOne(testUrl);
    req.flush({ success: true });

    setTimeout(() => {
      expect(actualReturn).toEqual(expectedReturn);
      done();
    }, 150);
  });

  it('should execute multiple requests independently', (done) => {
    const testUrl1 = '/api/test1';
    const testUrl2 = '/api/test2';
    let callback1Executed = false;
    let callback2Executed = false;
    
    const callback1 = () => {
      callback1Executed = true;
      return 'callback1 result';
    };
    
    const callback2 = () => {
      callback2Executed = true;
      return 'callback2 result';
    };

    HttpRequest.fromGet(testUrl1, callback1, 100);
    HttpRequest.fromPost(testUrl2, { data: 'test' }, callback2, 100);

    const req1 = httpTestingController.expectOne(testUrl1);
    const req2 = httpTestingController.expectOne(testUrl2);
    
    req1.flush({ data1: 'test1' });
    req2.flush({ data2: 'test2' });

    setTimeout(() => {
      expect(callback1Executed).toBeTruthy();
      expect(callback2Executed).toBeTruthy();
      done();
    }, 150);
  });
});
