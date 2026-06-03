import type * as vscode from "vscode";
import { makeDiagAt } from "./utils";

// 拗音・拗長音（直前の仮名と合わせて 1 拍）
const SMALL_KANA = new Set([..."ァィゥェォャュョヮヵヶ"]);

// 仮名列の拍数を数える（小書き仮名は直前の仮名と合わせて 1 拍）
const countMora = (str: string): number => {
  let count = 0;
  for (const ch of str) {
    if (!SMALL_KANA.has(ch)) {
      count++;
    }
  }
  return count;
};

// 処理しきれない特例を列挙
const SPECIFIC_TERMS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /インターフェース/g, replacement: "インタフェース" },
];

// 連続するカタカナ列（ーを含む）
const KATAKANA_RE = /[ァ-ヶー]{2,}/g;

// カタカナ語末尾の長音符ルールを検証し、違反箇所を診断として返す
export const diagnoseKatakana = (
  document: vscode.TextDocument,
): vscode.Diagnostic[] => {
  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  // 個別置換
  for (const { pattern, replacement } of SPECIFIC_TERMS) {
    pattern.lastIndex = 0;
    let m = pattern.exec(text);
    while (m !== null) {
      diagnostics.push(
        makeDiagAt(
          document,
          m.index,
          m[0].length,
          `長音記号：3 音以上のカタカナ語の末尾の長音符は省略してください．\n→ 「${replacement}」`,
        ),
      );
      m = pattern.exec(text);
    }
  }

  // 一般ルール: 語末の長音符，3 拍以上の語では省略する
  KATAKANA_RE.lastIndex = 0;
  let m = KATAKANA_RE.exec(text);
  while (m !== null) {
    const word = m[0];
    if (word.endsWith("ー")) {
      const body = word.slice(0, -1);
      const mora = countMora(body);
      if (mora >= 3) {
        diagnostics.push(
          makeDiagAt(
            document,
            m.index,
            word.length,
            `超音記号：3 音以上のカタカナ語の末尾の長音符は省略してください．\n→ 「${body}」`,
          ),
        );
      }
    }
    m = KATAKANA_RE.exec(text);
  }

  return diagnostics;
};
