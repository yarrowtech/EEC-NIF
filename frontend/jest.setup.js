import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (required by react-router-dom)
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.scrollTo (not implemented in JSDOM)
window.scrollTo = jest.fn();

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  window.scrollTo.mockClear();
  window.dispatchEvent.mockClear();
});
