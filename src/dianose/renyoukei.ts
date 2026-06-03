import type * as vscode from "vscode";
import { makeDiag, makeRange, tokenizer } from "../utils";

const COMMAS = new Set(["，", "、", ","]);
// IPAdic での連用形: 動詞は '連用形'，形容詞のく形は '連用テ接続'
const RENYOKEI_FORMS = new Set(["連用形", "連用テ接続"]);

// 連用形 + 読点のパターンを検出する．
export const diagnoseRenyokei = (
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

    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      const next = tokens[i + 1];

      if (
        RENYOKEI_FORMS.has(token.conjugated_form) &&
        COMMAS.has(next.surface_form)
      ) {
        const startCol = token.word_position - 1;
        const endCol =
          startCol + token.surface_form.length + next.surface_form.length;
        diagnostics.push(
          makeDiag(
            makeRange(document, lineNum, startCol, endCol),
            "連用形 + 読点：論理関係が曖昧になる可能性があります．\n→ 論理関係を明示してください（例：「〜により」「〜のため」）．",
          ),
        );
      }
    }
  }

  return diagnostics;
};
