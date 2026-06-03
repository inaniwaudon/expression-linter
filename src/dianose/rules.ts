import * as vscode from "vscode";
import { makeDiag } from "../utils";

export interface Rule {
  pattern: RegExp;
  message: string;
  severity: vscode.DiagnosticSeverity;
  suggestion?: string;
}

// 正規表現で検知可能なルール
export const rules: Rule[] = [
  {
    pattern: /内臓/g,
    message: "「内臓」は誤字の可能性があります．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "「内蔵」",
  },
  {
    pattern: /例えば/g,
    message: "「例えば」は口語的です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "「例として」",
  },
  {
    pattern: /伴って/g,
    message: "「伴って」は冗長な表現です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "「伴い」",
  },
  {
    pattern: /するのに伴い/g,
    message: "「するのに伴い」は不正確な表現です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "「することに伴い」",
  },
  {
    pattern: /利用法/g,
    message: "「利用法」は略語です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "「利用方法」（略さない）",
  },
  {
    pattern: /可能なものであったが/g,
    message: "冗長な表現です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "「可能だが」",
  },
  {
    pattern: /調べると/g,
    message: "「調べると」は口語的です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "「調査した結果」「調査の結果」",
  },
  {
    pattern: /されてきている/g,
    message: "「〜されてきている」は冗長な表現です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "簡潔な表現に書き換えてください．",
  },
  {
    pattern: /してきている/g,
    message: "「〜してきている」は冗長な表現です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "簡潔な表現に書き換えてください．",
  },
  {
    pattern: /が接続されている/g,
    message: "「〜が接続されている」は主語と接続先が不明確です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion:
      "「〜が〇〇に接続されている」（何が何に接続されているかを明記）",
  },
  {
    pattern: /直感的/g,
    message: "「直感的」は曖昧な表現です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "具体的な説明を添えてください．",
  },
  {
    pattern: /自然[なに]/g,
    message: "「自然な」は曖昧な表現です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "具体的な説明を添えてください．",
  },
  {
    pattern: /提案する/g,
    message: "「提案する」は実装済みの場合には不適切です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion:
      "「開発した」「設計した」「実装した」「示す」等を検討してください．",
  },
  {
    pattern: /提案手法/g,
    message: "「提案手法」は実装済みの場合には不適切です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion:
      "「開発した」「考案した」「設計した」「実装した」「示す」等を検討してください．",
  },
  {
    pattern: /設定/g,
    message: "「設定」は意味が広すぎる可能性があります．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "具体的な用語を検討してください．",
  },
  {
    // 長い単位を先に並べて部分マッチを防ぐ
    pattern:
      /\d+(?:\.\d+)?(mm|cm|km|ms|μs|kHz|MHz|GHz|mg|μg|kg|dB|Hz|rad|px|pt|em|m|g|s)(?![a-zA-Z])/g,
    message: "数値と単位の間にスペースが必要です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion:
      "数値と単位の間にスペースを入れてください．LaTeX では siunitx を導入して \\SI{値}{単位} を推奨します．",
  },
  {
    // 引用番号 [1] の直前にスペースなし
    pattern: /[a-zA-Z぀-鿿]\[\d+\]/g,
    message: "引用番号の前にスペースが必要です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "Tanaka [1]",
  },
  {
    // \cite の直前にスペースなし
    pattern: /[a-zA-Z぀-鿿]\\cite/g,
    message: "\\cite の前にスペースが必要です．",
    severity: vscode.DiagnosticSeverity.Warning,
    suggestion: "Tanaka~\\cite{ref}",
  },
];

// rules を全件走査して，マッチ箇所を診断として返す
export const diagnoseRegex = (
  document: vscode.TextDocument,
): vscode.Diagnostic[] => {
  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null = rule.pattern.exec(text);

    while (match !== null) {
      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + match[0].length),
      );
      const message = rule.suggestion
        ? `${rule.message}\n→ ${rule.suggestion}`
        : rule.message;
      diagnostics.push(makeDiag(range, message, rule.severity));
      match = rule.pattern.exec(text);
    }
  }

  return diagnostics;
};
