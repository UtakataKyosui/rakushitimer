import { useEffect, useState, useCallback, useRef } from "react";
import {
  setAlarm,
  cancelAlarm,
  listAlarms,
  checkExactAlarmPermission,
  openExactAlarmSettings,
} from "tauri-plugin-alerm-api";

const isTauriEnv =
  typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;

function toHumanError(error: unknown): Error {
  if (!isTauriEnv) {
    return new Error("このアプリはAndroid端末（Tauri環境）でのみ動作します");
  }
  return error instanceof Error ? error : new Error(String(error));
}

export interface AlarmInfo {
  id: number;
  title: string;
  message?: string;
  triggerAtMs: number;
  exact: boolean;
  repeatIntervalMs?: number;
  soundUri?: string;
}

export interface CheckPermissionResult {
  canScheduleExactAlarms: boolean;
}

export interface SetAlarmOptions {
  title: string;
  message?: string;
  triggerAtMs: number;
  exact?: boolean;
  repeatIntervalMs?: number;
  soundUri?: string;
}

export function useAlerm() {
  const [alarms, setAlarms] = useState<AlarmInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permission, setPermission] = useState<CheckPermissionResult | null>(null);
  const nextId = useRef(1);

  // 初期化時にアラーム一覧と権限を取得
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const [loadedAlarms, permissionResult] = await Promise.all([
          listAlarms(),
          checkExactAlarmPermission(),
        ]);
        const alarmsData = loadedAlarms || [];
        setAlarms(alarmsData);
        if (alarmsData.length > 0) {
          nextId.current = Math.max(...alarmsData.map((a) => a.id)) + 1;
        }
        setPermission(permissionResult);
      } catch (error) {
        if (!isTauriEnv) {
          console.warn("Tauri環境が検出されませんでした。ブラウザモードで動作します。");
        } else {
          console.error("Failed to initialize alarms:", error);
        }
        setAlarms([]);
        setPermission({ canScheduleExactAlarms: false });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // アラーム追加
  const addAlarm = useCallback(async (options: SetAlarmOptions) => {
    try {
      setIsSubmitting(true);
      const id = nextId.current++;
      const newAlarm: AlarmInfo = {
        id,
        title: options.title,
        message: options.message,
        triggerAtMs: options.triggerAtMs,
        exact: options.exact ?? true,
        repeatIntervalMs: options.repeatIntervalMs,
        soundUri: options.soundUri,
      };

      await setAlarm({
        id,
        ...options,
        exact: options.exact ?? true,
      });

      setAlarms((prev) => [...prev, newAlarm]);
    } catch (error) {
      const humanError = toHumanError(error);
      console.error("Failed to add alarm:", humanError.message);
      throw humanError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // アラーム削除
  const removeAlarm = useCallback(async (id: number) => {
    try {
      setIsSubmitting(true);
      await cancelAlarm(id);
      setAlarms((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      const humanError = toHumanError(error);
      console.error("Failed to remove alarm:", humanError.message);
      throw humanError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // 権限設定を開く
  const openPermissionSettings = useCallback(async () => {
    try {
      await openExactAlarmSettings();
    } catch (error) {
      console.error("Failed to open permission settings:", error);
      throw error;
    }
  }, []);

  return {
    alarms,
    isLoading,
    isSubmitting,
    permission,
    addAlarm,
    removeAlarm,
    openPermissionSettings,
  };
}
