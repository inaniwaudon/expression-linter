import * as path from "node:path";
import * as kuromoji from "kuromoji";
import * as vscode from "vscode";

export const SOURCE = "expression-linter";

export let tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let initPromise: Promise<void> | null = null;

// kuromoji のトークナイザを非同期で初期化する．
// 二重初期化を防ぐため Promise をキャッシュする．
export const initTokenizer = (extensionPath: string): Promise<void> => {
  if (initPromise) {
    return initPromise;
  }

  const dicPath = path.join(extensionPath, "node_modules", "kuromoji", "dict");
  initPromise = new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, built) => {
      if (err) {
        reject(err);
        return;
      }
      tokenizer = built;
      resolve();
    });
  });

  return initPromise;
};

// 範囲，メッセージ，重大度を指定して診断オブジェクトを生成する
export const makeDiag = (
  range: vscode.Range,
  message: string,
  severity = vscode.DiagnosticSeverity.Warning,
) => {
  const diag = new vscode.Diagnostic(range, message, severity);
  diag.source = SOURCE;
  return diag;
};

// オフセットと長さからドキュメント内の位置を解決して診断オブジェクトを生成する
export const makeDiagAt = (
  document: vscode.TextDocument,
  offset: number,
  length: number,
  message: string,
  severity = vscode.DiagnosticSeverity.Warning,
) => {
  return makeDiag(
    new vscode.Range(
      document.positionAt(offset),
      document.positionAt(offset + length),
    ),
    message,
    severity,
  );
};

// 行番号・列範囲からドキュメントの Range を生成する
export const makeRange = (
  document: vscode.TextDocument,
  lineNum: number,
  startCol: number,
  endCol: number,
): vscode.Range =>
  document.validateRange(
    new vscode.Range(
      new vscode.Position(lineNum, startCol),
      new vscode.Position(lineNum, endCol),
    ),
  );
