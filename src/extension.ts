import * as vscode from "vscode";
import { diagnoseNitsuite } from "./dianose/nitsuite";
import { diagnoseParticles } from "./dianose/particles";
import { diagnoseRenyokei } from "./dianose/renyoukei";
import { diagnoseRegex } from "./dianose/rules";
import { diagnoseTari } from "./dianose/tari";
import { diagnoseKatakana } from "./katakana";
import { diagnosePunctuation } from "./punctuation";
import { initTokenizer, SOURCE } from "./utils";

const SUPPORTED_LANGUAGES = new Set(["tex", "latex", "markdown", "plaintext"]);

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

// 全診断ソースを集約してコレクションを更新する．非対応言語は即座にスキップ
const runDiagnostics = (
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
) => {
  if (!SUPPORTED_LANGUAGES.has(document.languageId)) {
    return;
  }

  collection.set(document.uri, [
    ...diagnoseRegex(document),
    ...diagnoseRenyokei(document),
    ...diagnoseNitsuite(document),
    ...diagnoseParticles(document),
    ...diagnosePunctuation(document),
    ...diagnoseKatakana(document),
    ...diagnoseTari(document),
  ]);
};

// 300ms デバウンスで診断更新をスケジュールし，連続入力中の過剰な再解析を防ぐ
const scheduleUpdate = (
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
) => {
  const key = document.uri.toString();
  const existing = debounceTimers.get(key);
  if (existing) {
    clearTimeout(existing);
  }

  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      runDiagnostics(document, collection);
    }, 300),
  );
};

// VS Code 拡張のエントリポイント．イベントリスナーの登録と形態素解析器の非同期初期化を行う
export const activate = (context: vscode.ExtensionContext) => {
  const channel = vscode.window.createOutputChannel(SOURCE);
  channel.appendLine(`[${SOURCE}] 拡張機能が起動しました`);

  const collection = vscode.languages.createDiagnosticCollection(SOURCE);

  if (vscode.window.activeTextEditor) {
    runDiagnostics(vscode.window.activeTextEditor.document, collection);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        runDiagnostics(editor.document, collection);
      }
    }),
    vscode.workspace.onDidChangeTextDocument((event) => {
      scheduleUpdate(event.document, collection);
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      collection.delete(document.uri);
    }),
    collection,
  );

  try {
    initTokenizer(context.extensionPath).then(() => {
      channel.appendLine(`[${SOURCE}] 形態素解析器の初期化が完了しました`);
      vscode.workspace.textDocuments.forEach((doc) => {
        runDiagnostics(doc, collection);
      });
    });
  } catch (err) {
    channel.appendLine(
      `[${SOURCE}] 形態素解析器の初期化に失敗しました：${String(err)}`,
    );
    vscode.window.showErrorMessage(
      `[${SOURCE}] 形態素解析器の初期化に失敗しました：${String(err)}`,
    );
  }
};

// 拡張機能の無効化時に呼ばれる．クリーンアップは subscriptions に委ねる
export const deactivate = () => {};
