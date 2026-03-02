import { useState, useRef, type KeyboardEvent } from "react";
import { KeyRoundIcon, Volume2Icon, CheckCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type UnlockableSound } from "@/lib/serial-codes";
import { type UnlockResult } from "@/hooks/use-unlocked-sounds";

interface SettingsTabProps {
  unlockedSounds: UnlockableSound[];
  soundsLoading: boolean;
  unlockByCode: (code: string) => Promise<UnlockResult>;
}

export default function SettingsTab({
  unlockedSounds,
  soundsLoading,
  unlockByCode,
}: SettingsTabProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUnlock = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const result = await unlockByCode(trimmed);
      if (result.success) {
        if (result.alreadyUnlocked) {
          toast.info(`「${result.sound.label}」はすでに解放済みやで`);
        } else {
          toast.success(`「${result.sound.label}」を解放したで！`);
          setCode("");
        }
      } else {
        toast.error("無効なシリアルコードやで");
      }
    } catch (error) {
      console.error("音声の解放に失敗しました:", error);
      toast.error("音声の解放に失敗しました。しばらくしてからもう一度試してな");
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  const isDisabled = isSubmitting || soundsLoading;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <KeyRoundIcon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">おかんからの特別ボイスを解放する</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          シリアルコードを入力したら、おかんのボイスをもらえるで！
        </p>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="シリアルコードを入力"
            className="flex-1"
            disabled={isDisabled}
          />
          <Button onClick={handleUnlock} disabled={isDisabled || !code.trim()}>
            {isSubmitting ? "確認中..." : "もらう！"}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Volume2Icon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">もらったボイス一覧</h2>
        </div>
        {unlockedSounds.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            まだもらったボイスないで
          </p>
        ) : (
          <ul className="space-y-2">
            {unlockedSounds.map((sound) => (
              <li
                key={sound.id}
                className="flex items-center gap-3 rounded-md border px-3 py-2"
              >
                <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                <span className="text-sm">{sound.label}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
