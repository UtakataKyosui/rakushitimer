import "./App.css";

import Navbar from "./components/common/navbar";
import AlarmList from "./components/alarm/list";
import SettingsTab from "./components/settings/settings-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUnlockedSounds } from "@/hooks/use-unlocked-sounds";


function App() {
  const { unlockedSounds, isLoading, unlockByCode } = useUnlockedSounds();

  return (
    <main className="container mx-auto py-8 h-screen">
      <Navbar />
      <Tabs defaultValue="alarm" className="mt-4">
        <TabsList>
          <TabsTrigger value="alarm">アラーム</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>
        <TabsContent value="alarm">
          <AlarmList />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab
            unlockedSounds={unlockedSounds}
            soundsLoading={isLoading}
            unlockByCode={unlockByCode}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default App;
