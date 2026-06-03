import type * as vscode from "vscode";
import { makeDiagAt } from "../utils";

// 文中で単独使用されている「たり」を検出する
export const diagnoseTari = (
  document: vscode.TextDocument,
): vscode.Diagnostic[] => {
  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  // 文節単位（。．改行で区切る）で「たり」の個数を検査する
  const sentenceRe = /[^。．\n]+/g;
  let sm = sentenceRe.exec(text);

  while (sm !== null) {
    const sentence = sm[0];
    const sentenceStart = sm.index;
    const tariRe = /たり/g;
    const offsets: number[] = [];
    let tm = tariRe.exec(sentence);

    while (tm !== null) {
      offsets.push(sentenceStart + tm.index);
      tm = tariRe.exec(sentence);
    }

    if (offsets.length === 1) {
      for (const offset of offsets) {
        diagnostics.push(
          makeDiagAt(
            document,
            offset,
            2,
            "「たり」の単独使用：「たり」は「〜たり〜たり（する）」の形で対にして使用してください．",
          ),
        );
      }
    }
    sm = sentenceRe.exec(text);
  }

  return diagnostics;
};
