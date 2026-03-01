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

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const store = await load("unlocked-sounds.json");
      if (cancelled) return;
      storeRef.current = store;

      const savedIds = (await store.get<string[]>(STORE_KEY)) ?? [];
      if (cancelled) return;

      const restored = savedIds
        .map((id) => UNLOCKABLE_SOUNDS.find((s) => s.id === id))
        .filter((s): s is UnlockableSound => s !== undefined);

      setUnlockedSounds(restored);
      setIsLoading(false);
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

    const alreadyUnlocked = unlockedSounds.some((s) => s.id === sound.id);
    if (alreadyUnlocked) {
      return { success: true, sound, alreadyUnlocked: true };
    }

    const newUnlocked = [...unlockedSounds, sound];
    setUnlockedSounds(newUnlocked);

    if (storeRef.current) {
      await storeRef.current.set(
        STORE_KEY,
        newUnlocked.map((s) => s.id)
      );
    }

    return { success: true, sound, alreadyUnlocked: false };
  }

  return { unlockedSounds, isLoading, unlockByCode };
}
