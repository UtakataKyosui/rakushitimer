import { useState, useEffect, useRef } from "react";
import { load, type Store } from "@tauri-apps/plugin-store";
import {
  findSoundByCode,
  UNLOCKABLE_SOUNDS,
  type UnlockableSound,
} from "../lib/serial-codes";

const STORE_KEY = "unlocked_sounds";

export type UnlockResult =
  | { success: true; sound: UnlockableSound; alreadyUnlocked: boolean }
  | { success: false; reason: "invalid_code" };

export function useUnlockedSounds(): {
  unlockedSounds: UnlockableSound[];
  isLoading: boolean;
  unlockByCode: (code: string) => Promise<UnlockResult>;
} {
  const [unlockedSounds, setUnlockedSounds] = useState<UnlockableSound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const storeRef = useRef<Store | null>(null);
  // stale closureを避けるために最新の状態をrefでも保持する
  const unlockedRef = useRef<UnlockableSound[]>([]);

  function syncUnlocked(value: UnlockableSound[]) {
    unlockedRef.current = value;
    setUnlockedSounds(value);
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const store = await load("unlocked-sounds.json");
        if (cancelled) return;
        storeRef.current = store;

        const savedIds = (await store.get<string[]>(STORE_KEY)) ?? [];
        if (cancelled) return;

        const restored = savedIds
          .map((id) => UNLOCKABLE_SOUNDS.find((s) => s.id === id))
          .filter((s): s is UnlockableSound => s !== undefined);

        syncUnlocked(restored);
      } catch (error) {
        console.error("Failed to initialize unlocked sounds from store:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function unlockByCode(code: string): Promise<UnlockResult> {
    const sound = await findSoundByCode(code);
    if (!sound) {
      return { success: false, reason: "invalid_code" };
    }

    const current = unlockedRef.current;
    const alreadyUnlocked = current.some((s) => s.id === sound.id);
    if (alreadyUnlocked) {
      return { success: true, sound, alreadyUnlocked: true };
    }

    const newUnlocked = [...current, sound];
    syncUnlocked(newUnlocked);

    if (storeRef.current) {
      try {
        await storeRef.current.set(
          STORE_KEY,
          newUnlocked.map((s) => s.id)
        );
        await storeRef.current.save();
      } catch (e) {
        // 永続化失敗時はUIをロールバックしてエラーを再スロー
        syncUnlocked(current);
        throw e;
      }
    }

    return { success: true, sound, alreadyUnlocked: false };
  }

  return { unlockedSounds, isLoading, unlockByCode };
}
