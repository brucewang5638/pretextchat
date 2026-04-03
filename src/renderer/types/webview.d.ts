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
