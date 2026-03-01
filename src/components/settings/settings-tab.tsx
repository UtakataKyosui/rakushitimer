import { useState, useRef } from "react";
import { KeyRoundIcon, Volume2Icon, CheckCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUnlockedSounds } from "@/hooks/use-unlocked-sounds";

export default function SettingsTab() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { unlockedSounds, unlockByCode } = useUnlockedSounds();

  const handleUnlock = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <KeyRoundIcon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">シリアルコードで音声を解放</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          シリアルコードを入力すると、特別な音声をアンロックできるで
        </p>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="シリアルコードを入力"
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleUnlock} disabled={isLoading || !code.trim()}>
            {isLoading ? "確認中..." : "解放する"}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Volume2Icon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">解放済み音声</h2>
        </div>
        {unlockedSounds.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            まだ音声が解放されていません
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
