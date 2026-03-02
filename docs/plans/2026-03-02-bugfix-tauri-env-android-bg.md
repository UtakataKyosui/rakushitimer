# Bugfix: Tauri環境チェック + Android水色背景修正 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> *(※本ガイドは Claude 3.5 Sonnet / Claude Code 系エージェントの自動実行を前提に記述されています)*

**Goal:** ブラウザモード（`npm run dev`）でのTypeErrorを握りつぶして分かりやすい警告に変え、Androidアプリ起動時の水色背景をきつね色テーマに合わせた温かみある色に修正する

**Architecture:** TauriのIPC（`window.__TAURI_INTERNALS__`）が存在しない環境では invoke が TypeError になるため、`App.tsx` で環境を検出してバナー表示＋フォーム非活性化で対処する。Android背景色は `colors.xml` にHexカラーを追加し `themes.xml` でウィンドウ背景・ステータスバー・ナビゲーションバーを上書きする。

**Tech Stack:** React, TypeScript, Tauri v2 Android（XML リソース）

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|---------|
| `src/App.tsx` | `isTauri` 判定＋非Tauri環境バナー |
| `src/hooks/use-alerm.ts` | 非Tauri環境でのエラーを分かりやすいメッセージに変換 |
| `src-tauri/gen/android/app/src/main/res/values/colors.xml` | きつね色テーマのHexカラー追加 |
| `src-tauri/gen/android/app/src/main/res/values/themes.xml` | ウィンドウ背景・ステータスバー設定 |
| `src-tauri/gen/android/app/src/main/res/values-night/themes.xml` | ダークモード用同設定 |

---

### Task 1: `src/App.tsx` に非Tauri環境バナーを追加

**Files:**
- Modify: `src/App.tsx`

**Step 1: 現在の `src/App.tsx` を確認**

```bash
cat src/App.tsx
```

**Step 2: `isTauri` 定数とバナーを追加**

`App.tsx` の `function App()` の中、`return` の直前に `isTauri` を定義し、JSX のトップに条件付きバナーを追加する。

変更後の `App.tsx`：

```tsx
import "./App.css";

import Navbar from "./components/common/navbar";
import AlermList from "./components/alerm/list";
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
```

**Step 3: TypeScript型エラーを解消（`window.__TAURI_INTERNALS__` の型定義）**

`window.__TAURI_INTERNALS__` は `@tauri-apps/api` が型定義を持っているが、直接参照するために `src/vite-env.d.ts` または `src/env.d.ts` に追記が必要な場合がある。

まず型エラーが出るか確認する：

```bash
cd /home/utakata/rakushitimer
npm run build 2>&1 | grep -E "error|__TAURI"
```

エラーが出た場合は `src/vite-env.d.ts` に追記する：

```ts
/// <reference types="vite/client" />

interface Window {
  __TAURI_INTERNALS__?: unknown;
}
```

エラーが出ない場合はそのまま進む。

**Step 4: ビルドチェック**

```bash
cd /home/utakata/rakushitimer
npm run build 2>&1 | tail -20
```

期待値: エラーなし

**Step 5: コミット**

```bash
git add src/App.tsx src/vite-env.d.ts
git commit -m "feat: 非Tauri環境（ブラウザ）のとき警告バナーを表示"
```

---

### Task 2: `src/hooks/use-alerm.ts` のエラーメッセージ改善

**Files:**
- Modify: `src/hooks/use-alerm.ts`（55〜58行目、89〜91行目）

**Background:** 現在は `console.error("Failed to add alarm:", error)` でTypeErrorをそのままログに流している。非Tauri環境では「Tauriが必要」という分かりやすいメッセージに変換したい。

**Step 1: `isTauriEnv` ヘルパーを追加してエラーを変換**

`use-alerm.ts` の先頭（importの後）にヘルパーを追加し、各エラーキャッチでメッセージを改善する：

```ts
// ファイル先頭（importの直後）に追加
const isTauriEnv = typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;

function toHumanError(error: unknown): Error {
  if (!isTauriEnv) {
    return new Error("このアプリはAndroid端末（Tauri環境）でのみ動作します");
  }
  return error instanceof Error ? error : new Error(String(error));
}
```

`initialize` の catch ブロック（55〜58行目）を変更：

```ts
      } catch (error) {
        // 非Tauri環境では初期化エラーは無視してデフォルト状態にする
        if (!isTauriEnv) {
          console.warn("Tauri環境が検出されませんでした。ブラウザモードで動作します。");
        } else {
          console.error("Failed to initialize alarms:", error);
        }
        setAlarms([]);
        setPermission({ canScheduleExactAlarms: false });
```

`addAlarm` の catch ブロック（89〜91行目）を変更：

```ts
    } catch (error) {
      const humanError = toHumanError(error);
      console.error("Failed to add alarm:", humanError.message);
      throw humanError;
    }
```

`removeAlarm` の catch ブロックも同様：

```ts
    } catch (error) {
      const humanError = toHumanError(error);
      console.error("Failed to remove alarm:", humanError.message);
      throw humanError;
    }
```

**Step 2: TypeScript型エラー確認（`window.__TAURI_INTERNALS__` の参照）**

Task 1 で `Window` インターフェースを追加済みなら問題ないはず。

```bash
npm run build 2>&1 | tail -20
```

期待値: エラーなし

**Step 3: コミット**

```bash
git add src/hooks/use-alerm.ts
git commit -m "fix: 非Tauri環境でのinvokeエラーを分かりやすいメッセージに変換"
```

---

### Task 3: Android `colors.xml` にきつね色Hexカラーを追加

**Files:**
- Modify: `src-tauri/gen/android/app/src/main/res/values/colors.xml`

**Background:** Android XMLリソースはoklchを扱えないため、`App.css` のoklchカラーをHexに近似変換したものを使う。

oklchからHexへの近似値：
- `oklch(0.99 0.01 55)` → `#FDFCF5`（温かみクリーム白）
- `oklch(0.65 0.17 55)` → `#C8821C`（きつね色・黄金橙）
- `oklch(0.22 0.05 42)` → `#38200E`（焦げ茶・醤油タレ色）

**Step 1: 現在の `colors.xml` を確認**

```bash
cat src-tauri/gen/android/app/src/main/res/values/colors.xml
```

現在: `purple_200`, `purple_500`, `purple_700`, `teal_200`, `teal_700`, `black`, `white` が定義されている

**Step 2: きつね色テーマのカラーを追加**

`colors.xml` の `</resources>` 直前に追記する：

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <!-- きつね色テーマ (oklch → Hex 近似変換) -->
    <color name="warm_cream">#FDFCF5</color>
    <color name="kitsune">#C8821C</color>
    <color name="kogecha">#38200E</color>
</resources>
```

**Step 3: コミット（themes.xml の変更とまとめてコミットするため、ここではステージのみ）**

```bash
git add src-tauri/gen/android/app/src/main/res/values/colors.xml
```

---

### Task 4: Android `themes.xml` でウィンドウ背景を設定

**Files:**
- Modify: `src-tauri/gen/android/app/src/main/res/values/themes.xml`
- Modify: `src-tauri/gen/android/app/src/main/res/values-night/themes.xml`

**Step 1: `values/themes.xml` を変更**

現在:
```xml
<style name="Theme.rakushitimer" parent="Theme.MaterialComponents.DayNight.NoActionBar">
    <!-- Customize your theme here. -->
</style>
```

変更後:
```xml
<style name="Theme.rakushitimer" parent="Theme.MaterialComponents.DayNight.NoActionBar">
    <!-- きつね色テーマ: WebView描画前の背景をクリーム白に -->
    <item name="android:windowBackground">@color/warm_cream</item>
    <!-- ブランドカラー -->
    <item name="colorPrimary">@color/kitsune</item>
    <item name="colorPrimaryVariant">@color/kogecha</item>
    <item name="colorOnPrimary">@color/white</item>
    <!-- ステータスバー・ナビゲーションバーを焦げ茶に -->
    <item name="android:statusBarColor">@color/kogecha</item>
    <item name="android:navigationBarColor">@color/kogecha</item>
</style>
```

**Step 2: `values-night/themes.xml` を変更**

ダークモード時もcream白ではなく、少し暗めの色にする。しかし`warm_cream`はlight用なので、ダークモードでは焦げ茶をウィンドウ背景にする（WebViewのdark背景と自然につながる）：

```xml
<style name="Theme.rakushitimer" parent="Theme.MaterialComponents.DayNight.NoActionBar">
    <!-- ダークモード: WebView描画前の背景を焦げ茶に -->
    <item name="android:windowBackground">@color/kogecha</item>
    <item name="colorPrimary">@color/kitsune</item>
    <item name="colorPrimaryVariant">@color/kogecha</item>
    <item name="colorOnPrimary">@color/white</item>
    <item name="android:statusBarColor">@color/kogecha</item>
    <item name="android:navigationBarColor">@color/kogecha</item>
</style>
```

**Step 3: コミット**

```bash
git add src-tauri/gen/android/app/src/main/res/values/themes.xml
git add src-tauri/gen/android/app/src/main/res/values-night/themes.xml
git commit -m "fix: Androidのウィンドウ背景をきつね色テーマに合わせる（水色解消）"
```

---

## 最終確認

**ブラウザモードでの確認（Bug Fix 1）：**

```bash
cd /home/utakata/rakushitimer
npm run dev
```

ブラウザで `http://localhost:1420` を開いて確認：
- [ ] ページ上部に「⚠️ このアプリはAndroid端末でご利用ください」バナーが表示されること
- [ ] アラーム追加を試みると「このアプリはAndroid端末（Tauri環境）でのみ動作します」というメッセージが出ること（TypeErrorではなく）

**Androidビルドでの確認（Bug Fix 2）：**

```bash
npm run tauri android dev
```

端末またはエミュレータで確認：
- [ ] アプリ起動時に水色（teal）が見えないこと
- [ ] ステータスバーが焦げ茶（#38200E）になっていること
- [ ] WebView読み込み中の背景がクリーム白（#FDFCF5）になっていること
