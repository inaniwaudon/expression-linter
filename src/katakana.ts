import * as vscode from "vscode";
import { SOURCE } from "./utils";

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
