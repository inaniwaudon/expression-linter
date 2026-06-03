import type * as vscode from "vscode";
import { makeDiagAt } from "./utils";

const JA_RE = /[、。]/g;
const EN_RE = /[，．]/g;

/**
 * 句読点，コンマ・ピリオドの揺れを調査する．混在していた場合は，より多数の方に統一するように指示する．
 */
export const diagnosePunctuation = (
  document: vscode.TextDocument,
): vscode.Diagnostic[] => {
  const text = document.getText();

  const jaMatches = [...text.matchAll(JA_RE)];
  const enMatches = [...text.matchAll(EN_RE)];

  // どちらか一方しかなければ揺れなし
  if (jaMatches.length === 0 || enMatches.length === 0) {
    return [];
  }

  // 少数派を flag する（同数なら両方）
  const flagJa = jaMatches.length <= enMatches.length;
  const flagEn = enMatches.length <= jaMatches.length;
  const suggest =
    jaMatches.length < enMatches.length
      ? "「，．」"
      : enMatches.length < jaMatches.length
        ? "「、。」"
        : "どちらか一方のスタイル";

  const minorities = [
    ...(flagJa ? jaMatches : []),
    ...(flagEn ? enMatches : []),
  ];

  return minorities.map((m) =>
    makeDiagAt(
      document,
      m.index,
      1,
      `句読点の揺れ：「${m[0]}」が混在しています．\n→ 文書内で${suggest}に統一してください．`,
    ),
  );
};
