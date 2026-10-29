# boardcast 官网

独立的静态站（Vite + 原生 TypeScript，没有框架），中英双语，直接复用桌面版的笔（`src/ink`）。

```sh
pnpm site:dev     # http://localhost:1430
pnpm site:build   # 输出到 dist-site/，相对路径，可放在任何静态托管的任意子路径下
```

- 文案都在 `src/i18n.ts`，页面用 `data-i18n`（普通文字）和 `data-ink`（手写标题）取。
- `scripts/prepare.mjs` 在 dev / build 前跑：只复制站点里出现过的汉字笔画，并把 `docs/` 里的截图复制过来，生成物不进 git。
- 首屏的演示在 `src/demo.ts`：预设的会议是 `SCENE`；访客打字走规则快车道（网页没有模型，界面上会明说）。
