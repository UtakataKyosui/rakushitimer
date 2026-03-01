import { describe, it, expect } from "vitest";
import { alermFormSchema } from "../form";

describe("alermFormSchema", () => {
  it("バリデーション: 有効なフォームデータを受け入れる", () => {
    const validData = {
      title: "朝のアラーム",
      message: "おはようございます",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
      repeatIntervalMs: 0,
    };

    const result = alermFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("バリデーション: title が空の場合は失敗", () => {
    const invalidData = {
      title: "",
      message: "テスト",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
    };

    const result = alermFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("バリデーション: title が 50 文字を超える場合は失敗", () => {
    const invalidData = {
      title: "a".repeat(51),
      message: "テスト",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
    };

    const result = alermFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("バリデーション: date が必須", () => {
    const invalidData = {
      title: "テスト",
      message: "テスト",
      time: "07:00",
      exact: true,
    };

    const result = alermFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("バリデーション: time が HH:MM フォーマットでない場合は失敗", () => {
    const invalidData = {
      title: "テスト",
      message: "テスト",
      date: new Date("2026-03-02"),
      time: "25:00",
      exact: true,
    };

    const result = alermFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("バリデーション: repeatIntervalMs が 0 の場合は undefined に変換", () => {
    const validData = {
      title: "テスト",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
      repeatIntervalMs: 0,
    };

    const result = alermFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.repeatIntervalMs).toBeUndefined();
    }
  });

  it("バリデーション: repeatIntervalMs が 0 でない場合は保持", () => {
    const validData = {
      title: "テスト",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
      repeatIntervalMs: 86400000,
    };

    const result = alermFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.repeatIntervalMs).toBe(86400000);
    }
  });

  it("バリデーション: soundUri が指定されている場合に保持", () => {
    const validData = {
      title: "テスト",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
      soundUri: "sounds/alarm.mp3",
    };

    const result = alermFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.soundUri).toBe("sounds/alarm.mp3");
    }
  });

  it("バリデーション: soundUri が未指定の場合は undefined", () => {
    const validData = {
      title: "テスト",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
    };

    const result = alermFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.soundUri).toBeUndefined();
    }
  });
});
