import * as vscode from "vscode";

export interface Rule {
  pattern: RegExp;
  message: string;
  severity: vscode.DiagnosticSeverity;
  suggestion?: string;
}

export const rules: Rule[] = [
  // 単純な誤字・置換
  {
    pattern: /内臓/g,
    message: "「内臓」は誤字の可能性があります。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 「内蔵」を確認してください。",
  },
  {
    pattern: /例えば/g,
    message: "「例えば」は論文では口語的です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 「例として」",
  },
  {
    pattern: /伴って/g,
    message: "「伴って」は冗長な表現です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 「伴い」",
  },
  {
    pattern: /するのに伴い/g,
    message: "「するのに伴い」は不正確な表現です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 「することに伴い」",
  },
  {
    pattern: /利用法/g,
    message: "「利用法」は略語です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 「利用方法」（略さない）",
  },
  {
    pattern: /可能なものであったが/g,
    message: "冗長な表現です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 「可能だが」",
  },
  {
    pattern: /調べると/g,
    message: "「調べると」は口語的です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 「調査した結果」「調査の結果」",
  },
  // 正規表現パターン
  {
    pattern: /されてきている/g,
    message: "「〜されてきている」は冗長な表現です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 簡潔な表現に書き換えてください。",
  },
  {
    pattern: /してきている/g,
    message: "「〜してきている」は冗長な表現です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 簡潔な表現に書き換えてください。",
  },
  {
    pattern: /が接続されている/g,
    message: "「〜が接続されている」は主語と接続先が不明確です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion:
      "→ 「〜が〇〇に接続されている」（何が何に接続されているかを明記）",
  },

  // キーワード警告
  {
    pattern: /直感的/g,
    message: "「直感的」は曖昧な表現です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 具体的な説明を添えてください。",
  },
  {
    pattern: /自然[なに]/g,
    message: "「自然な」は曖昧な表現です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 具体的な説明を添えてください。",
  },
  {
    pattern: /提案する/g,
    message: "「提案する」は実装済みの場合は不適切です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion:
      "→ 「開発した」「設計した」「実装した」「示す」等を検討してください。",
  },
  {
    pattern: /提案手法/g,
    message: "「提案手法」は実装済みの場合は不適切です。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion:
      "→ 「開発した」「考案した」「設計した」「実装した」「示す」等を検討してください。",
  },
  {
    pattern: /設定/g,
    message: "「設定」は意味が広すぎる可能性があります。",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "→ 具体的な用語を検討してください。",
  },
];
