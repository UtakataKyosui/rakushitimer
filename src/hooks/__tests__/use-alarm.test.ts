import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAlarm } from "../use-alarm";
import { setAlarm } from "tauri-plugin-alarm-api";

// Mock tauri plugin
vi.mock("tauri-plugin-alarm-api", () => ({
  setAlarm: vi.fn(),
  cancelAlarm: vi.fn(),
  listAlarms: vi.fn(() => Promise.resolve([])),
  checkExactAlarmPermission: vi.fn(() => Promise.resolve({ canScheduleExactAlarms: true })),
  openExactAlarmSettings: vi.fn(),
}));

describe("useAlarm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("フック初期化: 初期状態をチェック", async () => {
    const { result } = renderHook(() => useAlarm());

    expect(result.current.alarms).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAdding).toBe(false);
    expect(result.current.isRemoving).toBe(false);

    // 初期化完了を待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("アラーム追加: 正常にアラームを追加できる", async () => {
    const { result } = renderHook(() => useAlarm());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addAlarm({
        title: "テストアラーム",
        message: "テスト",
        triggerAtMs: 1700000000000,
        exact: true,
      });
    });

    expect(result.current.alarms.length).toBeGreaterThan(0);
  });

  it("ID生成: 衝突しない ID を生成", async () => {
    const { result } = renderHook(() => useAlarm());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 2つのアラームを追加
    await act(async () => {
      await result.current.addAlarm({
        title: "アラーム 1",
        triggerAtMs: 1700000000000,
      });
    });

    const firstId = result.current.alarms[0]?.id;

    await act(async () => {
      await result.current.addAlarm({
        title: "アラーム 2",
        triggerAtMs: 1700000001000,
      });
    });

    const secondId = result.current.alarms[1]?.id;

    expect(firstId).not.toBe(secondId);
    expect(secondId).toBe((firstId || 0) + 1);
  });

  it("アラーム削除: キャンセル処理を実行", async () => {
    const { result } = renderHook(() => useAlarm());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addAlarm({
        title: "削除テスト",
        triggerAtMs: 1700000000000,
      });
    });

    const alarmId = result.current.alarms[0]?.id;

    await act(async () => {
      await result.current.removeAlarm(alarmId!);
    });

    expect(result.current.alarms.length).toBe(0);
  });

  it("権限チェック: Android 12+ 権限状態をチェック", async () => {
    const { result } = renderHook(() => useAlarm());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.permission).not.toBeNull();
    expect(result.current.permission?.canScheduleExactAlarms).toBeDefined();
  });

  it("アラーム追加: スヌーズ時間やリピート曜日が正しく渡される", async () => {
    const { result } = renderHook(() => useAlarm());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addAlarm({
        title: "新機能テスト",
        triggerAtMs: 1700000000000,
        snoozeEnabled: true,
        snoozeDurationMs: 600000,
        repeatDaysOfWeek: [1, 3, 5],
      });
    });

    // setAlarm はモックされているため、引数を検証
    expect(setAlarm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "新機能テスト",
        snoozeEnabled: true,
        snoozeDurationMs: 600000,
        repeatDaysOfWeek: [1, 3, 5],
      })
    );
  });
});
