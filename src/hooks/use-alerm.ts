import { useEffect, useState, useCallback } from "react";
import {
  setAlarm,
  cancelAlarm,
  listAlarms,
  checkExactAlarmPermission,
  openExactAlarmSettings,
} from "tauri-plugin-alerm-api";

export interface AlarmInfo {
  id: number;
  title: string;
  message?: string;
  triggerAtMs: number;
  exact: boolean;
  repeatIntervalMs?: number;
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
}

export function useAlerm() {
  const [alarms, setAlarms] = useState<AlarmInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permission, setPermission] = useState<CheckPermissionResult | null>(null);

  // 既存ID の最大値を取得して、次の ID を生成
  const generateId = useCallback((): number => {
    if (alarms.length === 0) return 1;
    const maxId = alarms.reduce((max, a) => Math.max(max, a.id), 0);
    return maxId + 1;
  }, [alarms]);

  // 初期化時にアラーム一覧と権限を取得
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const [loadedAlarms, permissionResult] = await Promise.all([
          listAlarms(),
          checkExactAlarmPermission(),
        ]);
        setAlarms(loadedAlarms || []);
        setPermission(permissionResult);
      } catch (error) {
        console.error("Failed to initialize alarms:", error);
        setAlarms([]);
        setPermission({ canScheduleExactAlarms: false });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // アラーム追加
  const addAlarm = useCallback(
    async (options: SetAlarmOptions) => {
      try {
        setIsSubmitting(true);
        const id = generateId();
        const alarmData: AlarmInfo = {
          id,
          title: options.title,
          message: options.message,
          triggerAtMs: options.triggerAtMs,
          exact: options.exact ?? true,
          repeatIntervalMs: options.repeatIntervalMs,
        };

        await setAlarm({
          id,
          ...options,
          exact: options.exact ?? true,
        });

        setAlarms((prev) => [...prev, alarmData]);
      } catch (error) {
        console.error("Failed to add alarm:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [generateId]
  );

  // アラーム削除
  const removeAlarm = useCallback(async (id: number) => {
    try {
      setIsSubmitting(true);
      await cancelAlarm(id);
      setAlarms((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Failed to remove alarm:", error);
      throw error;
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
    generateId,
  };
}
