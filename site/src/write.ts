// 官网用的书写器：和桌面版同一支笔（src/ink），只是不经过排版引擎，
// 文字、下划线、圈、箭头都直接从这里出墨迹。坐标以左上角为原点，位置交给调用方。

import { type Pt, type Stroke, glyph } from '../../src/ink/glyphs.ts'
import { type Inked, arrow, box, ink, line, loop, placeGlyph, rng, strike } from '../../src/ink/pen.ts'

export interface Written {
  strokes: Inked[]
  width: number
  height: number
  /** 笔宽，遮罩要比它粗 */
  pen: number
}

/** 潦草度超过这个值，英文小写换成连写体 */
export const SCRIPT_AT = 0.45
const penFor = (size: number) => Math.max(1.8, size * 0.1)
const isLower = (ch: string) => /[a-z]/.test(ch)
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1])

export interface WriteOpts {
  seed: string
  messy?: number
  /** 英文小写强制用连写体（品牌字用） */
  script?: boolean
  /** 笔画粗细倍率，大标题用细一点的笔 */
  weight?: number
}

export async function writeText(text: string, size: number, { seed, messy = 0.18, script, weight = 1 }: WriteOpts): Promise<Written> {
  const r = rng(seed)
  const pen = penFor(size) * weight
  const cursive = script ?? messy >= SCRIPT_AT
  const marks: Stroke[] = []
  let cx = pen
  let prev: { ch: string; end: Pt } | undefined
  for (const ch of text) {
    const latin = cursive && isLower(ch) ? 'script' : 'print'
    const g = await glyph(ch, latin)
    if (!g) {
      cx += size * 0.6
      prev = undefined
      continue
    }
    const placed = placeGlyph(g.strokes, cx, pen, size, r, messy)
    if (latin === 'script' && prev && isLower(prev.ch) && placed[0]?.length && dist(prev.end, placed[0][0]) < size * 0.7) {
      marks.push([prev.end, placed[0][0]])
    }
    marks.push(...placed)
    const last = placed[placed.length - 1]
    prev = last?.length ? { ch, end: last[last.length - 1] } : undefined
    cx += g.advance * size * (0.96 - 0.1 * messy + r() * (0.08 + 0.22 * messy)) + size * 0.04
  }
  return { strokes: marks.map((m) => ink(m, pen, r, { messy })), width: cx + pen, height: size * 1.3 + pen * 2, pen }
}

/** 多行文字，行距 1.35 */
export async function writeLines(text: string, size: number, o: WriteOpts) {
  const lines = text.split('\n')
  const parts = await Promise.all(lines.map((l, i) => writeText(l, size, { ...o, seed: `${o.seed}#${i}` })))
  return { lines: parts, step: size * 1.35 }
}

function shape(strokes: Stroke[], size: number, seed: string, messy = 0.18): Written {
  const r = rng(seed)
  const pen = penFor(size)
  let w = 0
  let h = 0
  for (const s of strokes) for (const [x, y] of s) ((w = Math.max(w, x)), (h = Math.max(h, y)))
  return { strokes: strokes.map((s) => ink(s, pen, r, { messy })), width: w + pen * 2, height: h + pen * 2, pen }
}

/** 下划线（略斜，像随手拉的） */
export const underline = (w: number, size: number, seed: string) =>
  shape([line([2, 6], [w, 3], rng(seed), 0.03)], size, seed)

/** 波浪下划线，强调用 */
export function squiggle(w: number, size: number, seed: string) {
  const r = rng(seed)
  const pts: Pt[] = []
  const n = Math.max(6, Math.round(w / (size * 0.6)))
  for (let i = 0; i <= n; i++) pts.push([(w * i) / n, 8 + (i % 2 ? -1 : 1) * size * 0.1 + (r() - 0.5) * 2])
  return shape([pts], size, seed)
}

/** 划掉：一道略斜的线 */
export const strikeThrough = (w: number, size: number, seed: string) => shape(strike(0, size * 0.6, w, rng(seed)), size, seed)

/** 圈出 */
export const circled = (w: number, h: number, size: number, seed: string) =>
  shape([loop(w / 2 + 14, h / 2 + 10, w / 2 + 12, h / 2 + 8, rng(seed))], size, seed)

/** 圆角框（四笔） */
export const boxed = (w: number, h: number, size: number, seed: string) => shape(box(2, 2, w, h, rng(seed)), size, seed)

/** 带箭头的线：两点，或一串点 */
export const arrowed = (pts: Pt[], size: number, seed: string) => shape(arrow(pts, rng(seed)), size, seed)

/** 星标 */
export const star = (size: number, seed: string) => writeText('★', size, { seed })

/** 手画的云：隐私一节用来被划掉。扇形的椭圆，底边压平 */
export function cloud(size: number, seed: string) {
  const rx = size * 0.5
  const ry = size * 0.3
  const pts: Pt[] = []
  const n = 120
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const k = 1 + 0.15 * Math.abs(Math.sin(2.5 * a))
    pts.push([rx + Math.cos(a) * rx * k * 0.93, Math.min(ry + Math.sin(a) * ry * k, ry * 1.6)])
  }
  return shape([pts], Math.max(14, size * 0.14), seed)
}
