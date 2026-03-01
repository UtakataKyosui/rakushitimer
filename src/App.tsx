import "./App.css";

import Navbar from "./components/common/navbar";
import AlermList from "./components/alerm/list";
import SettingsTab from "./components/settings/settings-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function App() {
  return (
    <main className="container mx-auto py-8 h-screen">
      <Navbar />
      <Tabs defaultValue="alarm" className="mt-4">
        <TabsList>
          <TabsTrigger value="alarm">アラーム</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>
        <TabsContent value="alarm">
          <AlermList />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default App;
