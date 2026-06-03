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
      if (token.pos !== "助詞") {
        continue;
      }

      const prev = i > 0 ? tokens[i - 1] : null;
      const next = i < tokens.length - 1 ? tokens[i + 1] : null;

      let message: string | null = null;

      switch (token.surface_form) {
        case "で":
          if (token.pos_detail_1 === "格助詞") {
            message =
              "「で」は多義語です．\n→ 「〜により」「〜を用いて」「〜にて」等";
          }
          break;
        case "や":
          message = "「や」は曖昧な表現です．\n→「および」「ならびに」";
          break;
        case "と":
          // 並立用法（名詞+と+名詞）は並立助詞に分類される
          if (
            token.pos_detail_1 === "並立助詞" &&
            prev?.pos === "名詞" &&
            next?.pos === "名詞"
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
        case "等":
          message =
            "「等」は例を複数挙げた場合のみ使用できます．\n→ 他に例を挙げない場合は言い切ることが望ましいです．";
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
