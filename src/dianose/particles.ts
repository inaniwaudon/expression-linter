import type * as vscode from "vscode";
import { makeDiag, makeRange, tokenizer } from "../utils";

// 避けるべき助詞を検出する．
export const diagnoseParticles = (
  document: vscode.TextDocument,
): vscode.Diagnostic[] => {
  if (!tokenizer) {
    return [];
  }

  const diagnostics: vscode.Diagnostic[] = [];

  for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
    const line = document.lineAt(lineNum).text;
    if (!line.trim()) {
      continue;
    }

    const tokens = tokenizer.tokenize(line);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // 「等」は助詞に分類されないため先に処理する
      if (token.surface_form === "等") {
        const startCol = token.word_position - 1;
        const endCol = startCol + token.surface_form.length;
        diagnostics.push(
          makeDiag(
            makeRange(document, lineNum, startCol, endCol),
            "「等」は例を複数挙げた場合のみ使用できます．\n→ 他に例を挙げない場合は言い切ることが望ましいです．",
          ),
        );
        continue;
      }

      const prev = i > 0 ? tokens[i - 1] : null;
      const next = i < tokens.length - 1 ? tokens[i + 1] : null;

      // 形容動詞語幹 + で（接続助詞 or 助動詞「だ」の連用形）
      // kuromoji の品詞分類によらず surface_form と前トークンで判定する
      // IPAdic では「滑らか」等は pos="名詞", pos_detail_1="形容動詞語幹" に分類される
      const isPrevNaAdj =
        prev?.pos === "形容動詞" ||
        (prev?.pos === "名詞" && prev?.pos_detail_1 === "形容動詞語幹");
      if (
        token.surface_form === "で" &&
        isPrevNaAdj &&
        next?.surface_form !== "は"
      ) {
        const startCol = token.word_position - 1;
        const endCol = startCol + token.surface_form.length;
        diagnostics.push(
          makeDiag(
            makeRange(document, lineNum, startCol, endCol),
            "「で」は多義語です．\n→「〜かつ」等",
          ),
        );
        continue;
      }

      if (token.pos !== "助詞") {
        continue;
      }

      let message: string | null = null;

      switch (token.surface_form) {
        case "で":
          if (token.pos_detail_1 === "格助詞" && next?.surface_form !== "は") {
            message =
              "「で」は多義語です．\n→ 「〜により」「〜を用いて」「〜にて」等";
          }
          break;
        case "や":
          message = "「や」は曖昧な表現です．\n→「および」「ならびに」";
          break;
        case "と":
          // 並立用法（名詞+と+名詞）は並立助詞に分類される
          // 「A と B との」パターンは除外する
          if (
            token.pos_detail_1 === "並立助詞" &&
            prev?.pos === "名詞" &&
            next?.pos === "名詞" &&
            tokens[i + 2]?.surface_form !== "と"
          ) {
            message = "「と」は曖昧な表現です．\n→「および」「ならびに」";
          }
          break;
        case "か":
          if (
            token.pos_detail_1 !== "終助詞" &&
            next?.surface_form !== "も" &&
            next?.surface_form !== "どう" &&
            next?.surface_form !== "を" &&
            next?.pos === "名詞"
          ) {
            message = "「か」は曖昧な表現です．\n→「または」「もしくは」";
          }
          break;
        case "など":
          message =
            "「など」は例を複数挙げた場合のみ使用できます．\n→ 他に例を挙げない場合は言い切ることが望ましいです．";
          break;
      }

      if (message !== null) {
        const startCol = token.word_position - 1;
        const endCol = startCol + token.surface_form.length;
        diagnostics.push(
          makeDiag(makeRange(document, lineNum, startCol, endCol), message),
        );
      }
    }
  }

  return diagnostics;
};
