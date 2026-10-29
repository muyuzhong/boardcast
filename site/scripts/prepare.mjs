// 官网的静态素材（dev 和 build 前自动跑）：
// - 汉字笔画：扫描站点源码里出现过的汉字，只复制这些字的骨架线到 site/public/hanzi/，
//   访客自己输入的生僻字运行时回退到 CDN；
// - 截图：从 docs/ 复制到 site/public/img/，不在仓库里放两份。

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const site = fileURLToPath(new URL('..', import.meta.url))
const repo = join(site, '..')

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

const text = [...walk(join(site, 'src')), join(site, 'index.html')].map((f) => readFileSync(f, 'utf8')).join('')
const chars = [...new Set(text.match(/[㐀-鿿]/g) ?? [])]

const src = dirname(require.resolve('hanzi-writer-data/package.json'))
const out = join(site, 'public/hanzi')
mkdirSync(out, { recursive: true })
let n = 0
for (const ch of chars) {
  const to = join(out, `${ch}.json`)
  if (existsSync(to)) continue
  const from = join(src, `${ch}.json`)
  if (!existsSync(from)) continue
  writeFileSync(to, JSON.stringify(JSON.parse(readFileSync(from, 'utf8')).medians))
  n++
}
copyFileSync(join(src, 'ARPHICPL.TXT'), join(out, 'ARPHICPL.TXT'))
if (n) console.log(`site: ${n} 个汉字 → site/public/hanzi/`)

const img = join(site, 'public/img')
mkdirSync(img, { recursive: true })
for (const f of ['screenshot-ink.png', 'screenshot-chalk.png', 'screenshot-board.png', 'screenshot-groups.png', 'screenshot-models.png', 'screenshot-messy.png']) {
  copyFileSync(join(repo, 'docs', f), join(img, f))
}
copyFileSync(join(repo, 'public/favicon.png'), join(site, 'public/favicon.png'))
