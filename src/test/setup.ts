import "@testing-library/jest-dom";

// ── Full Storage mock for Zustand persist middleware ────────────────────────
// jsdom's native localStorage can have issues with setItem in some Node
// configurations. This gives Zustand a working Storage API.
const createStorageMock = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
  writable: true,
  configurable: true,
});
Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
  writable: true,
  configurable: true,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null as ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => false,
  }),
});

