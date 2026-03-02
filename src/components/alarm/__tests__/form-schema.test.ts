import { describe, it, expect } from "vitest";
import { alarmFormSchema } from "../form";

describe("alarmFormSchema", () => {
  it("バリデーション: 有効なフォームデータを受け入れる", () => {
    const validData = {
      title: "朝のアラーム",
      message: "おはようございます",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
      repeatIntervalMs: 0,
    };

    const result = alarmFormSchema.safeParse(validData);
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

    const result = alarmFormSchema.safeParse(invalidData);
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

    const result = alarmFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("バリデーション: date が必須", () => {
    const invalidData = {
      title: "テスト",
      message: "テスト",
      time: "07:00",
      exact: true,
    };

    const result = alarmFormSchema.safeParse(invalidData);
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

    const result = alarmFormSchema.safeParse(invalidData);
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

    const result = alarmFormSchema.safeParse(validData);
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

    const result = alarmFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.repeatIntervalMs).toBe(86400000);
    }
  });

  it("バリデーション: snoozeEnabled と repeatDaysOfWeek と snoozeDurationMs のデフォルト値", () => {
    const validData = {
      title: "朝のアラーム",
      date: new Date("2026-03-02"),
      time: "07:00",
      exact: true,
    };

    const result = alarmFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.snoozeEnabled).toBe(false);
      expect(result.data.snoozeDurationMs).toBe(300000);
      expect(result.data.repeatDaysOfWeek).toEqual([]);
    }
  });

  it("バリデーション: スヌーズ時間が短すぎる場合はエラー", () => {
    const invalidData = {
      title: "朝のアラーム",
      date: new Date("2026-03-02"),
      time: "07:00",
      snoozeDurationMs: 30000, // 60,000 未満
    };

    const result = alarmFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
