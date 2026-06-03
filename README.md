# expression-linter

論文やレポートの執筆時に注意すべき論文表現をチェックする VSCode 拡張機能です．

## 使い方

`.tex`，`.md`，`.txt` のいずれかのファイルを開くと自動的に有効になります．
ファイルを編集するたびに診断が更新されます．

## チェックされる例

```
本研究ではコンピューターを用いて高速に処理し，精度を向上させるためのインターフェースを提案する。
提案手法のインタフェースは利用負荷が低く，操作時間が短くなり，直感的に操作可能である．
今後，例えば内臓センサを利用法に応じて設定したりする。
Tanaka[1]は先行研究を提案した．
```

全パターンは [./test.md](test.md) を確認してください．

## 開発

```bash
yarn              # 依存関係のインストール
yarn run build    # ビルド
yarn run publish  # 公開
```

- VScode 上でディレクトリを開いて，[F5] を押すとテストできる．
- 拡張機能の公開時には [https://code.visualstudio.com/api/working-with-extensions/publishing-extension](Publishing Extensions) を参考にする．
