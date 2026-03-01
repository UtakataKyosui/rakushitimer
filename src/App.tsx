import "./App.css";

import Navbar from "./components/common/navbar";
import AlermList from "./components/alerm/list";
import SettingsTab from "./components/settings/settings-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUnlockedSounds } from "@/hooks/use-unlocked-sounds";
import { BellIcon, Settings2Icon } from "lucide-react";

function App() {
  const { unlockedSounds, isLoading, unlockByCode } = useUnlockedSounds();

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <Tabs defaultValue="alarm" className="flex-1 overflow-hidden">
        <TabsContent value="alarm" className="overflow-auto">
          <div className="px-6 py-4">
            <AlermList unlockedSounds={unlockedSounds} />
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
