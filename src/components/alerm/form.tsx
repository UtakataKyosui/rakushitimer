import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { BellIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SetAlarmOptions } from "@/hooks/use-alerm";
import { toast } from "sonner";

export const alermFormSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(50, "50文字以内で入力してください"),
  message: z.string().max(200, "200文字以内で入力してください").optional(),
  date: z.date().refine((date) => date != null, {
    message: "日付を選択してください",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM形式で入力してください"),
  exact: z.boolean().default(true),
  repeatIntervalMs: z.coerce
    .number()
    .min(0, "0以上の値を入力してください")
    .optional()
    .transform((v) => (v === 0 ? undefined : v)),
});

export type AlermFormData = z.infer<typeof alermFormSchema>;

interface AlermFormProps {
  onSubmit: (options: SetAlarmOptions) => Promise<void>;
}

export function AlermForm({ onSubmit }: AlermFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AlermFormData>({
    resolver: zodResolver(alermFormSchema) as any,
    defaultValues: {
      title: "",
      message: "",
      date: new Date(),
      time: "08:00",
      exact: true,
      repeatIntervalMs: undefined,
    },
  });

  const handleSubmit = async (data: AlermFormData) => {
    try {
      setIsSubmitting(true);

      // date + time を結合して triggerAtMs を計算
      const [hours, minutes] = data.time.split(":").map(Number);
      const triggerDate = new Date(data.date);
      triggerDate.setHours(hours, minutes, 0, 0);
      const triggerAtMs = triggerDate.getTime();

      // 過去時刻チェック
      if (triggerAtMs < Date.now()) {
        form.setError("time", {
          type: "manual",
          message: "過去の時刻は設定できません",
        });
        return;
      }

      const options: SetAlarmOptions = {
        title: data.title,
        message: data.message,
        triggerAtMs,
        exact: data.exact,
        repeatIntervalMs: data.repeatIntervalMs,
      };

      await onSubmit(options);

      toast.success("アラームを追加しました");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to add alarm:", error);
      toast.error("アラーム追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <BellIcon className="w-4 h-4" />
          新しいアラーム
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>アラームを追加</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input placeholder="朝のアラーム" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メッセージ（オプション）</FormLabel>
                  <FormControl>
                    <Input placeholder="おはようございます" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>日付</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value
                          ? format(field.value, "yyyy年MM月dd日", {
                              locale: ja,
                            })
                          : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        locale={ja}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>時刻</FormLabel>
                  <FormControl>
                    <input
                      type="time"
                      {...field}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>正確なアラーム</FormLabel>
                    <FormDescription>
                      デバイス状態に関わらず正確に発火
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeatIntervalMs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>繰り返し間隔（ミリ秒）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    0 の場合は繰り返しなし（1日 = 86400000ms）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "追加中..." : "アラームを追加"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
