declare module "tauri-plugin-alerm-api" {
  export interface SetAlarmOptions {
    id?: number;
    title: string;
    message?: string;
    triggerAtMs: number;
    exact?: boolean;
    repeatIntervalMs?: number;
  }

  export interface CheckPermissionResult {
    canScheduleExactAlarms: boolean;
  }

  export interface AlarmInfo {
    id: number;
    title: string;
    message?: string;
    triggerAtMs: number;
    exact: boolean;
    repeatIntervalMs?: number;
  }

  export function setAlarm(options: SetAlarmOptions): Promise<void>;
  export function cancelAlarm(id: number): Promise<void>;
  export function listAlarms(): Promise<AlarmInfo[]>;
  export function checkExactAlarmPermission(): Promise<CheckPermissionResult>;
  export function openExactAlarmSettings(): Promise<void>;
}
