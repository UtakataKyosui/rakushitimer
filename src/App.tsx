import "./App.css";

import Navbar from "./components/common/navbar";
import AlarmList from "./components/alarm/list";
import SettingsTab from "./components/settings/settings-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUnlockedSounds } from "@/hooks/use-unlocked-sounds";
import { BellIcon, Settings2Icon } from "lucide-react";


function App() {
  const { unlockedSounds, isLoading, unlockByCode } = useUnlockedSounds();
  const isTauri =
    typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      {!isTauri && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-sm px-6 py-2 text-center shrink-0">
          ⚠️ このアプリはAndroid端末でご利用ください（Tauri環境が検出されませんでした）
        </div>
      )}
      <Navbar />
      <Tabs defaultValue="alarm" className="flex-1 overflow-hidden">
        <TabsContent value="alarm" className="overflow-auto">
          <div className="px-6 py-4">
            <AlarmList />
          </div>
        </TabsContent>
        <TabsContent value="settings" className="overflow-auto">
          <div className="px-6 py-4">
            <SettingsTab
              unlockedSounds={unlockedSounds}
              soundsLoading={isLoading}
              unlockByCode={unlockByCode}
            />
          </div>
        </TabsContent>

        <TabsList className="!flex !w-full !rounded-none !p-0 !h-16 shrink-0 border-t border-brand/30 bg-brand-dark">
          <TabsTrigger
            value="alarm"
            className="!h-full !flex-col !rounded-none !py-2 !gap-1 text-white/60 data-[state=active]:!text-brand data-[state=active]:!bg-transparent"
          >
            <BellIcon className="size-5" />
            <span className="text-xs">アラーム</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="!h-full !flex-col !rounded-none !py-2 !gap-1 text-white/60 data-[state=active]:!text-brand data-[state=active]:!bg-transparent"
          >
            <Settings2Icon className="size-5" />
            <span className="text-xs">設定</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </main>
  );
}

export default App;
