// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import 'tslib';

// Polyfill for __decorate helper
if (typeof (globalThis as any).__decorate === 'undefined') {
  (globalThis as any).__decorate = function (decorators: any[], target: any, key?: PropertyKey, desc?: PropertyDescriptor | null) {
    const c = arguments.length;
    let r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key!) : desc;
    let d;
    for (let i = decorators.length - 1; i >= 0; i--) {
      if ((d = decorators[i])) {
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      }
    }
    return c > 3 && r && Object.defineProperty(target, key!, r), r;
  };
}

// Polyfill for __metadata helper
if (typeof (globalThis as any).__metadata === 'undefined') {
  (globalThis as any).__metadata = function (metadataKey: any, metadataValue: any) {
    if (typeof Reflect === 'object' && typeof (Reflect as any).metadata === 'function') {
      return (Reflect as any).metadata(metadataKey, metadataValue);
    }
    return function () {};
  };
}
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true
  }
);
