import { BellOffIcon } from "lucide-react";
import { useAlarm } from "@/hooks/use-alarm";
import { Spinner } from "@/components/ui/spinner";
import { ItemGroup } from "@/components/ui/item";
import { PermissionBanner } from "./permission-banner";
import { AlarmForm } from "./form";
import { AlarmCard } from "./alarm-card";

export default function AlarmList() {
  const {
    alarms,
    isLoading,
    isSubmitting,
    permission,
    addAlarm,
    removeAlarm,
    openPermissionSettings,
  } = useAlarm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PermissionBanner
        permission={permission}
        onOpenSettings={openPermissionSettings}
      />

      <AlarmForm onSubmit={addAlarm} />

      {alarms.length === 0 ? (
        <div className="text-center py-12">
          <BellOffIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">アラームがまだ登録されていません</p>
          <p className="text-sm text-gray-500">
            上のボタンから新しいアラームを追加してください
          </p>
        </div>
      ) : (
        <ItemGroup>
          {alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onCancel={removeAlarm}
              isDeleting={isSubmitting}
            />
          ))}
        </ItemGroup>
      )}
    </div>
  );
}