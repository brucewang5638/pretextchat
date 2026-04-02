/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />

// CSS Modules 类型声明
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 普通 CSS 文件
declare module '*.css' {
  const content: string;
  export default content;
}

// SVG 文件
declare module '*.svg' {
  const content: string;
  export default content;
}
