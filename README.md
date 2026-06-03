# expression-linter

論文やレポートの執筆時に注意すべき論文表現をチェックする Visual Studio Code 用拡張機能です．

https://marketplace.visualstudio.com/items?itemName=inaniwaudon.expression-linter

## 使い方

[expression-linter - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=inaniwaudon.expression-linter) から拡張機能をインストールします．
または，[Releases](https://github.com/inaniwaudon/expression-linter/releases) からビルド済みの VSIX ファイルをダウンロードして，インストールします．

`.tex`，`.md`，`.txt` のいずれかのファイルを開くと拡張機能が有効になります．ファイルを編集するたびにリンタが走ります．

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
yarn run package  # パッケージを作成
yarn run publish  # 公開
```

- VScode 上でディレクトリを開いて，[F5] を押すとテストできます．
- 拡張機能の公開時には [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) を参考にしてください．
