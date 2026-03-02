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
    isRemoving,
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
          <div className="text-5xl mx-auto mb-3">🍱</div>
          <p className="text-muted-foreground font-medium">まだアラームないで〜</p>
          <p className="text-sm text-muted-foreground mt-1">
            下のフォームから追加してみてな！
          </p>
        </div>
      ) : (
        <ItemGroup>
          {alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onCancel={removeAlarm}
              isDeleting={isRemoving}
            />
          ))}
        </ItemGroup>
      )}
    </div>
  );
}