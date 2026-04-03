// ============================================================
// webview.d.ts — JSX 的 <webview> 类型补充
// ============================================================
// React 自带类型并不知道 Electron 的 <webview> 标签，
// 所以这里显式补齐常用属性，保证 TSX 中能获得类型检查。

import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement> & {
        src?: string;
        partition?: string;
        allowpopups?: boolean;
        useragent?: string;
        webpreferences?: string;
      };
    }
  }
}

export {};
