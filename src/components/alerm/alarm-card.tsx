import { BellIcon, TrashIcon, RepeatIcon, Volume2Icon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { AlarmInfo } from "@/hooks/use-alerm";

interface AlarmCardProps {
  alarm: AlarmInfo;
  onCancel: (id: number) => Promise<void>;
  isDeleting?: boolean;
}

export function AlarmCard({
  alarm,
  onCancel,
  isDeleting = false,
}: AlarmCardProps) {
  const triggerDate = new Date(alarm.triggerAtMs);
  const now = new Date();

  const handleDelete = async () => {
    try {
      await onCancel(alarm.id);
      toast.success("アラームを削除しました");
    } catch (error) {
      console.error("Failed to delete alarm:", error);
      toast.error("アラームの削除に失敗しました");
    }
  };

  return (
    <Item className="bg-[oklch(0.97_0.01_55)] border-[oklch(0.90_0.03_55)]">
      <ItemMedia variant="icon">
        <BellIcon className="w-5 h-5" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{alarm.title}</ItemTitle>
        <ItemDescription>
          <div className="space-y-1">
            <p className="text-sm">
              {triggerDate > now
                ? `${formatDistanceToNow(triggerDate, {
                    locale: ja,
                    addSuffix: true,
                  })}`
                : `${format(triggerDate, "yyyy年MM月dd日 HH:mm", { locale: ja })}`}
            </p>
            {alarm.message && (
              <p className="text-xs text-gray-600">{alarm.message}</p>
            )}
            {alarm.repeatIntervalMs && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <RepeatIcon className="w-3 h-3" />
                <span>繰り返し</span>
              </div>
            )}
            {alarm.soundUri && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Volume2Icon className="w-3 h-3" />
                <span>{alarm.soundUri}</span>
              </div>
            )}
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:bg-red-50"
          aria-label="アラームを削除"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </ItemActions>
    </Item>
  );
}
