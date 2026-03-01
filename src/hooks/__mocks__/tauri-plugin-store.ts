import { vi } from "vitest";

export interface MockStore {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
}

let mockStoreData: Record<string, unknown> = {};

const createMockStore = (): MockStore => ({
  get: vi.fn((key: string) => Promise.resolve(mockStoreData[key] ?? null)),
  set: vi.fn((key: string, value: unknown) => {
    mockStoreData[key] = value;
    return Promise.resolve();
  }),
  save: vi.fn(() => Promise.resolve()),
});

let currentMockStore: MockStore = createMockStore();

export const load = vi.fn(() => Promise.resolve(currentMockStore));

export function resetMockStore(initialData: Record<string, unknown> = {}) {
  mockStoreData = { ...initialData };
  currentMockStore = createMockStore();
  load.mockImplementation(() => Promise.resolve(currentMockStore));
}

export function getMockStore(): MockStore {
  return currentMockStore;
}
