# きつね色の台所テーマ Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 「いなりといっしょ！」のUIテーマを「きつね色の台所」（黄金橙＋焦げ茶）に刷新し、いなり寿司・オカン感を演出する

**Architecture:** CSSカラートークンを軸に全コンポーネントへ伝播させる設計。Navbar にCSSグラデーション＋菱形パターンを追加。テキストをオカン口調・いなり寿司色に変更。

**Tech Stack:** React, Tailwind CSS v4（oklch カラー）, shadcn/ui, lucide-react

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|---------|
| `src/App.css` | カラートークン刷新（brand/background/primary/accent） |
| `src/components/common/navbar.tsx` | グラデーション背景＋菱形パターン（CSS inline style） |
| `src/components/alerm/list.tsx` | 空状態テキスト変更＋🍱 |
| `src/components/settings/settings-tab.tsx` | 見出し・説明・ボタンテキスト変更 |
| `src/components/alerm/alarm-card.tsx` | カード背景色を温かみある色に変更 |

---

### Task 1: `src/App.css` カラートークン刷新

**Files:**
- Modify: `src/App.css`（46〜86行目）

**Step 1: 現状確認**

`@theme inline` ブロック内に `--color-brand` と `--color-brand-dark` がすでにあることを確認（前回のPRで追加済み）。

**Step 2: `:root` の `--brand` と `--brand-dark` を変更**

現在:
```css
--brand: oklch(0.52 0.21 24);
--brand-dark: oklch(0.13 0.03 25);
--primary: oklch(0.52 0.21 24);
--accent: oklch(0.96 0.02 25);
--accent-foreground: oklch(0.52 0.21 24);
```

変更後:
```css
/* きつね色（油揚げ色） */
--brand: oklch(0.65 0.17 55);
--brand-dark: oklch(0.22 0.05 42);
/* primary = brand */
--primary: oklch(0.65 0.17 55);
--primary-foreground: oklch(0.985 0 0);
/* accent = 薄い油揚げ色 */
--accent: oklch(0.95 0.03 55);
--accent-foreground: oklch(0.65 0.17 55);
/* 背景 = 温かみクリーム白 */
--background: oklch(0.99 0.01 55);
```

**Step 3: `.dark` ブロックの `--brand` / `--brand-dark` / `--primary` を変更**

```css
--brand: oklch(0.72 0.16 55);
--brand-dark: oklch(0.18 0.04 42);
--primary: oklch(0.72 0.16 55);
--primary-foreground: oklch(0.985 0 0);
```

**Step 4: TypeScript ビルドチェック**

```bash
# リポジトリルートで実行
npm run build 2>&1 | tail -20
```

期待値: エラーなし（CSS変更のみなのでTypeScriptエラーは出ない）

**Step 5: コミット**

```bash
git add src/App.css
git commit -m "feat: きつね色カラートークンに刷新（黄金橙＋焦げ茶）"
```

---

### Task 2: `src/components/common/navbar.tsx` グラデーション＋菱形パターン

**Files:**
- Modify: `src/components/common/navbar.tsx`

**Step 1: 現在の `nav` 要素のクラスを確認**

現在: `className="flex justify-between bg-brand-dark py-3 px-6 border-b border-brand/40 shrink-0"`

**Step 2: グラデーション＋菱形パターンをインラインスタイルで追加**

```tsx
export default function Navbar() {
    return (
    <nav
      className="flex justify-between py-3 px-6 border-b border-brand/30 shrink-0 relative overflow-hidden"
      style={{
        backgroundImage: [
          "linear-gradient(135deg, oklch(0.22 0.05 42) 0%, oklch(0.26 0.06 45) 100%)",
          "repeating-linear-gradient(45deg, transparent, transparent 8px, oklch(0.65 0.17 55 / 0.06) 8px, oklch(0.65 0.17 55 / 0.06) 9px)",
          "repeating-linear-gradient(-45deg, transparent, transparent 8px, oklch(0.65 0.17 55 / 0.06) 8px, oklch(0.65 0.17 55 / 0.06) 9px)",
        ].join(", "),
      }}
    >
        <div />
        <h3 className="text-xl font-bold text-white relative z-10">いなりといっしょ！</h3>
        <Dialog>
          <DialogTrigger asChild>
            <InfoIcon className="text-white/70 hover:text-white cursor-pointer transition-colors relative z-10" />
          </DialogTrigger>
          ...（DialogContent は変更なし）...
        </Dialog>
      </nav>
    )
}
```

`bg-brand-dark` クラスを削除し、インラインスタイルに移行する。`relative z-10` で菱形パターンの上にテキストが乗るようにする。

**Step 3: TypeScript ビルドチェック**

```bash
npm run build 2>&1 | tail -20
```

期待値: エラーなし

**Step 4: コミット**

```bash
git add src/components/common/navbar.tsx
git commit -m "feat: Navbarにグラデーション＋菱形パターンを追加"
```

---

### Task 3: `src/components/alerm/list.tsx` 空状態テキスト変更

**Files:**
- Modify: `src/components/alerm/list.tsx`（42〜50行目付近）

**Step 1: 現在の空状態JSXを確認**

```tsx
<div className="text-center py-12">
  <BellOffIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
  <p className="text-gray-600">アラームがまだ登録されていません</p>
  <p className="text-sm text-gray-500">
    上のボタンから新しいアラームを追加してください
  </p>
</div>
```

**Step 2: いなり寿司＋オカン感テキストに変更**

```tsx
<div className="text-center py-12">
  <div className="text-5xl mx-auto mb-3">🍱</div>
  <p className="text-muted-foreground font-medium">まだアラームないで〜</p>
  <p className="text-sm text-muted-foreground mt-1">
    下のフォームから追加してみてな！
  </p>
</div>
```

- `BellOffIcon` の import も削除して OK（他で使っていなければ）
- 使用されていない import を消す

**Step 3: `BellOffIcon` の import が残っているか確認してから削除**

```tsx
// 変更前
import { BellOffIcon } from "lucide-react";

// BellOffIcon を使わなくなったら削除
```

**Step 4: TypeScript ビルドチェック**

```bash
npm run build 2>&1 | tail -20
```

期待値: エラーなし

**Step 5: コミット**

```bash
git add src/components/alerm/list.tsx
git commit -m "feat: アラーム空状態をいなり寿司＋オカン口調に変更"
```

---

### Task 4: `src/components/settings/settings-tab.tsx` テキスト変更

**Files:**
- Modify: `src/components/settings/settings-tab.tsx`

**Step 1: 変更対象テキストを確認**

- `h2`: 「シリアルコードで音声を解放」（63行目）
- `p`: 「シリアルコードを入力すると、特別な音声をアンロックできるで」（65行目）
- `h2`: 「解放済み音声」（86行目）
- `button`: 「解放する」（79行目）
- 空状態 `p`: 「まだ音声が解放されていません」（90行目）

**Step 2: テキストをオカン口調に変更**

```tsx
{/* section 1 h2 */}
<h2 className="text-base font-semibold">おかんからの特別ボイスを解放する</h2>

{/* section 1 説明文 */}
<p className="text-sm text-muted-foreground">
  シリアルコードを入力したら、おかんのボイスをもらえるで！
</p>

{/* section 1 ボタン */}
<Button onClick={handleUnlock} disabled={isDisabled || !code.trim()}>
  {isSubmitting ? "確認中..." : "もらう！"}
</Button>

{/* section 2 h2 */}
<h2 className="text-base font-semibold">もらったボイス一覧</h2>

{/* section 2 空状態 */}
<p className="text-sm text-muted-foreground py-4 text-center">
  まだもらったボイスないで
</p>
```

**Step 3: TypeScript ビルドチェック**

```bash
npm run build 2>&1 | tail -20
```

期待値: エラーなし

**Step 4: コミット**

```bash
git add src/components/settings/settings-tab.tsx
git commit -m "feat: 設定タブのテキストをオカン口調に変更"
```

---

### Task 5: `src/components/alerm/alarm-card.tsx` カード背景色変更

**Files:**
- Modify: `src/components/alerm/alarm-card.tsx`（41行目付近）

**Step 1: `Item` コンポーネントに温かみカラーを追加**

`Item` は `src/components/ui/item.tsx` のコンポーネント。`className` prop を渡して背景色を上書きする。

```tsx
<Item className="bg-[oklch(0.97_0.01_55)] border-[oklch(0.90_0.03_55)]">
```

**Step 2: `Item` コンポーネントが `className` を受け取るか確認**

```bash
grep -n "className" src/components/ui/item.tsx | head -10
```

`className` を受け取っていない場合は、直接ラッパー `div` を使う：

```tsx
<div className="rounded-lg border border-[oklch(0.90_0.03_55)] bg-[oklch(0.97_0.01_55)] p-3 flex items-center gap-3">
  {/* ItemMedia / ItemContent / ItemActions の中身を展開 */}
</div>
```

もしくは `Item` コンポーネントに `className` 追加（最小変更なら前者推奨）。

**Step 3: TypeScript ビルドチェック**

```bash
npm run build 2>&1 | tail -20
```

期待値: エラーなし

**Step 4: コミット**

```bash
git add src/components/alerm/alarm-card.tsx
git commit -m "feat: アラームカード背景に温かみある和紙色を適用"
```

---

## 最終確認

```bash
npm run tauri dev
```

目視チェックリスト:
- [ ] 背景色がほんのりクリーム白になっていること
- [ ] Navbarが焦げ茶グラデーション＋薄い菱形パターンになっていること
- [ ] アクティブタブが黄金橙（きつね色）でひかること
- [ ] アラーム空状態に🍱と「まだアラームないで〜」が表示されること
- [ ] 設定タブが「おかんからの特別ボイスを解放する」になっていること
- [ ] 解放ボタンが「もらう！」になっていること
- [ ] アラームカードの背景が温かみある色になっていること
