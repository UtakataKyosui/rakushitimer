# Android 用 sounds アセットについて

このディレクトリは **Android 向けビルドで参照されるアセット用ディレクトリ** です。

- 音声ファイルの正本（ソース）は `src-tauri/sounds/` 配下に配置してください。
- Android 向けのビルド時に、このディレクトリの内容が `src-tauri/sounds/` からコピー／生成されることを前提としています。
  - 具体的なコピー手順やビルド処理は、プロジェクトのビルドスクリプト（例: Tauri モバイル用のビルドフローや Gradle 設定など）を参照してください。

## 音声を追加する手順（開発者向け）

1. `src-tauri/sounds/` にアンロック可能な音声ファイルを追加する。
2. `src-tauri/sounds/README.md` のガイドラインに従ってファイル名や配置を確認する。
3. 音声ファイルを追加したら `src/lib/serial-codes.ts` の `UNLOCKABLE_SOUNDS` にエントリを追加する。
4. Android 向けビルドを実行し、その過程で `src-tauri/sounds/` の内容がこのディレクトリに反映されることを確認する。

通常、開発者が直接編集すべきなのは `src-tauri/sounds/` 側であり、
この `gen/android/app/src/main/assets/sounds/` 配下はビルド成果物／生成物として扱うことを想定しています。
