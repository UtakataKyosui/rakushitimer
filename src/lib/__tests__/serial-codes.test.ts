import { describe, it, expect } from "vitest";
import {
  hashSerialCode,
  findSoundByCode,
  UNLOCKABLE_SOUNDS,
  type UnlockableSound,
} from "../serial-codes";

describe("hashSerialCode", () => {
  it("同じ入力は同じSHA-256ハッシュを返す", async () => {
    const hash1 = await hashSerialCode("TEST-CODE-1234");
    const hash2 = await hashSerialCode("TEST-CODE-1234");
    expect(hash1).toBe(hash2);
  });

  it("大文字小文字を区別しない（toUpperCase正規化）", async () => {
    const hashUpper = await hashSerialCode("TEST-CODE-1234");
    const hashLower = await hashSerialCode("test-code-1234");
    expect(hashUpper).toBe(hashLower);
  });

  it("前後の空白を無視する", async () => {
    const hashTrimmed = await hashSerialCode("TEST-CODE-1234");
    const hashWithSpaces = await hashSerialCode("  TEST-CODE-1234  ");
    expect(hashTrimmed).toBe(hashWithSpaces);
  });

  it("異なる入力は異なるハッシュを返す", async () => {
    const hash1 = await hashSerialCode("TEST-CODE-1234");
    const hash2 = await hashSerialCode("TEST-CODE-5678");
    expect(hash1).not.toBe(hash2);
  });

  it("ハッシュは64文字の16進数文字列", async () => {
    const hash = await hashSerialCode("TEST-CODE-1234");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("findSoundByCode", () => {
  it("UNLOCKABLE_SOUNDSが空の場合、無効なコードはnullを返す", async () => {
    const result = await findSoundByCode("INVALID-CODE-9999");
    expect(result).toBeNull();
  });

  it("UNLOCKABLE_SOUNDSにコードがある場合、マッチする音声を返す", async () => {
    const testCode = "TEST-CODE-MATCH-FIND";
    const codeHash = await hashSerialCode(testCode);
    const testSound: UnlockableSound = {
      id: "test-find-id",
      label: "マッチテスト音声",
      soundUri: "sounds/test-find.mp3",
      codeHash,
    };

    UNLOCKABLE_SOUNDS.push(testSound);
    try {
      const result = await findSoundByCode(testCode);
      expect(result).toEqual(testSound);
    } finally {
      const idx = UNLOCKABLE_SOUNDS.indexOf(testSound);
      if (idx !== -1) UNLOCKABLE_SOUNDS.splice(idx, 1);
    }
  });

  it("大文字小文字を区別しないコード検索", async () => {
    const resultUpper = await findSoundByCode("TEST-UPPER");
    const resultLower = await findSoundByCode("test-upper");
    // 両方とも同じ結果になる（現時点ではどちらもnull）
    expect(resultUpper).toBe(resultLower);
  });

  it("前後に空白があっても同じ結果を返す", async () => {
    const resultNormal = await findSoundByCode("TEST-CODE");
    const resultSpaced = await findSoundByCode("  TEST-CODE  ");
    expect(resultNormal).toBe(resultSpaced);
  });
});

describe("UNLOCKABLE_SOUNDS", () => {
  it("配列として定義されている", () => {
    expect(Array.isArray(UNLOCKABLE_SOUNDS)).toBe(true);
  });

  it("各要素は正しい構造を持つ", () => {
    UNLOCKABLE_SOUNDS.forEach((sound: UnlockableSound) => {
      expect(sound).toHaveProperty("id");
      expect(sound).toHaveProperty("label");
      expect(sound).toHaveProperty("soundUri");
      expect(sound).toHaveProperty("codeHash");
      expect(typeof sound.id).toBe("string");
      expect(typeof sound.label).toBe("string");
      expect(typeof sound.soundUri).toBe("string");
      expect(typeof sound.codeHash).toBe("string");
      // codeHashは64文字の16進数
      expect(sound.codeHash).toHaveLength(64);
      expect(sound.codeHash).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
