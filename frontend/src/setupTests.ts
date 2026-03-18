import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Expose jest for ESM tests that expect a global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = jest;

if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock');
}
if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = jest.fn();
}

if (!global.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  global.ResizeObserver = ResizeObserverMock as any;
}
