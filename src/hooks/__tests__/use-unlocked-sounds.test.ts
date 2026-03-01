import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUnlockedSounds } from "../use-unlocked-sounds";
import { UNLOCKABLE_SOUNDS, hashSerialCode } from "../../lib/serial-codes";
import { resetMockStore, getMockStore } from "../__mocks__/tauri-plugin-store";

// vite.config.ts の test.alias で @tauri-apps/plugin-store → モックファイルに解決済み

const TEST_CODE = "TEST-UNLOCK-CODE-9999";
let testCodeHash: string;
let testSoundEntry: { id: string; label: string; soundUri: string; codeHash: string };

beforeEach(async () => {
  vi.clearAllMocks();
  resetMockStore();

  testCodeHash = await hashSerialCode(TEST_CODE);
  testSoundEntry = {
    id: "test-sound-1",
    label: "テスト音声",
    soundUri: "sounds/test.mp3",
    codeHash: testCodeHash,
  };

  // テスト用に UNLOCKABLE_SOUNDS に追加
  UNLOCKABLE_SOUNDS.push(testSoundEntry);
});

afterEach(() => {
  // テスト後に追加したエントリを削除
  const idx = UNLOCKABLE_SOUNDS.indexOf(testSoundEntry);
  if (idx !== -1) {
    UNLOCKABLE_SOUNDS.splice(idx, 1);
  }
});

describe("useUnlockedSounds", () => {
  it("初期化: ストアが空のとき unlockedSounds は空配列", async () => {
    const { result } = renderHook(() => useUnlockedSounds());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unlockedSounds).toEqual([]);
  });

  it("初期化: ストアに保存済みIDがある場合、対応する音声が復元される", async () => {
    resetMockStore({ unlocked_sounds: ["test-sound-1"] });

    const { result } = renderHook(() => useUnlockedSounds());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unlockedSounds).toHaveLength(1);
    expect(result.current.unlockedSounds[0].id).toBe("test-sound-1");
  });

  it("unlockByCode: 無効なコードは { success: false, reason: 'invalid_code' } を返す", async () => {
    const { result } = renderHook(() => useUnlockedSounds());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let unlockResult: Awaited<ReturnType<typeof result.current.unlockByCode>>;
    await act(async () => {
      unlockResult = await result.current.unlockByCode("INVALID-CODE-XXXX");
    });

    expect(unlockResult!).toEqual({ success: false, reason: "invalid_code" });
  });

  it("unlockByCode: 有効なコードで音声がアンロックされストアに保存される", async () => {
    const { result } = renderHook(() => useUnlockedSounds());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let unlockResult: Awaited<ReturnType<typeof result.current.unlockByCode>>;
    await act(async () => {
      unlockResult = await result.current.unlockByCode(TEST_CODE);
    });

    expect(unlockResult!.success).toBe(true);
    if (unlockResult!.success) {
      expect(unlockResult!.sound.id).toBe("test-sound-1");
      expect(unlockResult!.alreadyUnlocked).toBe(false);
    }

    expect(result.current.unlockedSounds).toHaveLength(1);
    expect(result.current.unlockedSounds[0].id).toBe("test-sound-1");

    const store = getMockStore();
    expect(store.set).toHaveBeenCalledWith("unlocked_sounds", ["test-sound-1"]);
  });

  it("unlockByCode: 既解放済みのコードは alreadyUnlocked: true でストアへの再書き込みなし", async () => {
    resetMockStore({ unlocked_sounds: ["test-sound-1"] });

    const { result } = renderHook(() => useUnlockedSounds());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const store = getMockStore();
    store.set.mockClear();

    let unlockResult: Awaited<ReturnType<typeof result.current.unlockByCode>>;
    await act(async () => {
      unlockResult = await result.current.unlockByCode(TEST_CODE);
    });

    expect(unlockResult!.success).toBe(true);
    if (unlockResult!.success) {
      expect(unlockResult!.alreadyUnlocked).toBe(true);
    }

    expect(store.set).not.toHaveBeenCalled();
  });
});
