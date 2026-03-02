import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckPermissionResult } from "@/hooks/use-alarm";

interface PermissionBannerProps {
  permission: CheckPermissionResult | null;
  onOpenSettings: () => Promise<void>;
}

export function PermissionBanner({
  permission,
  onOpenSettings,
}: PermissionBannerProps) {
  // 権限がない場合のみ表示
  if (permission === null || permission.canScheduleExactAlarms) {
    return null;
  }

  const handleOpenSettings = async () => {
    try {
      await onOpenSettings();
    } catch (error) {
      console.error("Failed to open settings:", error);
      toast.error("設定画面を開けませんでした");
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-orange-900">
          正確なアラーム設定が必要です
        </h3>
        <p className="text-sm text-orange-700 mt-1">
          Android 12以上で正確なアラーム機能を使用するには、アプリに対する権限が必要です。
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenSettings}
          className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          設定を開く
        </Button>
      </div>
    </div>
  );
}
