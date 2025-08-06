import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.dispatchEvent for auth error events
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true,
})

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  trace: vi.fn(),
  log: vi.fn(),
}

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    style: {
      setProperty: vi.fn(),
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(),
    },
  })),
  writable: true,
})

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
  writable: true,
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock URL methods
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
})

// Mock FileReader
Object.defineProperty(global, 'FileReader', {
  value: vi.fn(() => ({
    readAsText: vi.fn(),
    onload: null,
  })),
  writable: true,
})

// Mock alert and confirm
Object.defineProperty(global, 'alert', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(global, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
})

// Mock matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  writable: true,
})

// Set NODE_ENV for testing
process.env.NODE_ENV = 'test'