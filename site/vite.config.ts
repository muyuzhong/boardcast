import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// 官网：独立的静态站，直接复用桌面版的笔（src/ink）。
// base 用相对路径，丢到 GitHub Pages 的子路径或任何静态托管上都能跑。
const root = fileURLToPath(new URL('.', import.meta.url))
const repo = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  root,
  base: './',
  publicDir: 'public',
  server: { port: 1430, fs: { allow: [repo] } },
  build: { outDir: '../dist-site', emptyOutDir: true, target: 'es2022' },
})
