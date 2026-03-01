# いなりといっしょ！ (RakushiTimer)

Vライバー「楽下いなり」の声でアラームを鳴らす Android アプリ。
Tauri v2 + React + TypeScript で構築。

## 開発環境

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- Node.js + pnpm
- Rust (Android ターゲット含む)

```bash
pnpm install
pnpm tauri android dev
```

## テスト

```bash
pnpm test --run       # フロントエンドテスト
cargo test            # Rustテスト（src-tauri/ 内で実行）
```

---

## シリアルコードで音声をアンロックする仕組み

ユーザーがシリアルコードを入力すると、アプリにバンドルされた専用音声がアンロックされ、アラーム音として選択できるようになる機能。

### 設計概要

| 項目 | 内容 |
|------|------|
| 検証方式 | クライアントサイドのみ（SHA-256ハッシュ比較） |
| 音声配置 | アプリにバンドル（`src-tauri/sounds/`） |
| 状態保存 | `tauri-plugin-store`（アンロック済みIDをローカルに永続化） |
| 対応 | 1シリアルコード = 1音声 |

### 新しい音声を追加する手順

#### 1. 音声ファイルを配置

```
src-tauri/sounds/your-sound.mp3
```

#### 2. シリアルコードの SHA-256 ハッシュを計算

```bash
# Linux / macOS
echo -n "YOUR-SERIAL-CODE" | tr '[:lower:]' '[:upper:]' | sha256sum
# → 64文字の16進数ハッシュが出力される

# Node.js で計算する場合
node -e "
const crypto = require('crypto');
const code = 'YOUR-SERIAL-CODE'.trim().toUpperCase();
console.log(crypto.createHash('sha256').update(code).digest('hex'));
"
```

> **ポイント**: コードは `trim().toUpperCase()` で正規化される。
> 大文字小文字・前後の空白は区別しない。

#### 3. `UNLOCKABLE_SOUNDS` にエントリを追加

`src/lib/serial-codes.ts`:

```typescript
export const UNLOCKABLE_SOUNDS: UnlockableSound[] = [
  {
    id: "inari-morning-call",          // ユニークID（ストア保存キーになる）
    label: "おはよういなり",             // UIに表示される名前
    soundUri: "sounds/morning.mp3",    // バンドルされた音声ファイルのパス
    codeHash: "abc123...（64文字）",    // 手順2で計算したハッシュ
  },
];
```

#### 4. 動作確認

- アプリの「設定」タブでシリアルコードを入力
- 「解放済み音声」リストに追加されることを確認
- アラーム追加ダイアログの音声ドロップダウンに表示されることを確認
- アプリ再起動後もアンロック状態が維持されることを確認

### 別ライバーのアプリを作る場合

このシステムはそのまま流用できる。変更が必要な箇所のみ：

1. **`UNLOCKABLE_SOUNDS`** (`src/lib/serial-codes.ts`) — ライバー専用音声とコードを定義
2. **`src-tauri/sounds/`** — 音声ファイルを配置
3. **アプリ名・識別子** (`src-tauri/tauri.conf.json`) — `productName` と `identifier` を変更

フック・ロジック・UIは変更不要。

### 関連ファイル

```
src/
  lib/
    serial-codes.ts              # UnlockableSound型・UNLOCKABLE_SOUNDS・ハッシュ関数
    __tests__/
      serial-codes.test.ts       # ハッシュ関数のユニットテスト
  hooks/
    use-unlocked-sounds.ts       # アンロック状態管理フック
    __mocks__/
      tauri-plugin-store.ts      # テスト用storeモック
    __tests__/
      use-unlocked-sounds.test.ts
  components/
    settings/
      settings-tab.tsx           # シリアルコード入力UI
    alerm/
      form.tsx                   # 音声選択ドロップダウン
src-tauri/
  sounds/                        # バンドルする音声ファイルを配置
  Cargo.toml                     # tauri-plugin-store = "2"
  capabilities/
    android.json                 # store:allow-* 権限
    default.json                 # store:allow-* 権限
  tauri.conf.json                # bundle.resources に sounds/* を設定
```
