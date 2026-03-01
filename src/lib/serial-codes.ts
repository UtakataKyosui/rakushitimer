export interface UnlockableSound {
  id: string;
  label: string;
  soundUri: string;
  codeHash: string;
}

// 音声ファイル確定後にここにハッシュを追加する
export const UNLOCKABLE_SOUNDS: UnlockableSound[] = [];

export async function hashSerialCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function findSoundByCode(
  code: string
): Promise<UnlockableSound | null> {
  const hash = await hashSerialCode(code);
  return UNLOCKABLE_SOUNDS.find((s) => s.codeHash === hash) ?? null;
}
