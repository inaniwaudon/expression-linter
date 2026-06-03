import type * as vscode from "vscode";
import { makeDiag, makeRange, tokenizer } from "../utils";

const CLAUSE_END = new Set(["。", "．"]);
// IPAdic での連用形：動詞は `連用形`，形容詞のく形は `連用テ接続`
const NITSUITE = "について";

// 「について + 動詞」の冗長パターンを検出する．
export const diagnoseNitsuite = (
  document: vscode.TextDocument,
): vscode.Diagnostic[] => {
  if (!tokenizer) {
    return [];
  }

  const diagnostics: vscode.Diagnostic[] = [];

  for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
    const line = document.lineAt(lineNum).text;

    let searchFrom = 0;
    while (true) {
      const pos = line.indexOf(NITSUITE, searchFrom);
      if (pos === -1) {
        break;
      }
      searchFrom = pos + 1;

      const afterPos = pos + NITSUITE.length;
      const rest = line.slice(afterPos);
      if (!rest.trim()) {
        continue;
      }

      const tokens = tokenizer.tokenize(rest);
      let hasObjectMarker = false;
      let verbEnd: number | null = null;

      for (const t of tokens) {
        if (CLAUSE_END.has(t.surface_form)) {
          break;
        }

        if (t.pos === "助詞" && t.surface_form === "を") {
          hasObjectMarker = true;
        }

        if (t.pos === "動詞") {
          verbEnd = afterPos + (t.word_position - 1) + t.surface_form.length;
          break;
        }
      }

      if (verbEnd !== null && !hasObjectMarker) {
        diagnostics.push(
          makeDiag(
            makeRange(document, lineNum, pos, verbEnd),
            "「について + 動詞」は冗長な表現です．\n→ 「を + 動詞」．目的語がある場合は「について〇〇を（動詞）」とします．",
          ),
        );
      }
    }
  }

  return diagnostics;
};
