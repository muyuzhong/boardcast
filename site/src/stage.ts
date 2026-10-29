// 舞台：一块 SVG，把写好的墨迹一笔一笔「写」上去。
// 和桌面版同一个办法：填充轮廓 + 骨架线做遮罩，遮罩的虚线偏移从满动画到 0。

import type { Written } from './write.ts'

const NS = 'http://www.w3.org/2000/svg'
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
let uid = 0

export type Tone = 'ink' | 'red' | 'blue' | 'hl' | 'mute'

export interface PlaceOpts {
  x: number
  y: number
  tone?: Tone
  opacity?: number
  /** 不播放动画，直接显示 */
  still?: boolean
  /** 这一块最多写多少毫秒，写不完就整体加速 */
  maxMs?: number
  /** 每毫秒走多少个单位 */
  speed?: number
  /** 起笔前先等一会儿（毫秒） */
  delay?: number
  scale?: number
}

export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const e = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v))
  return e
}

/** 把一块墨迹放进 parent，返回写完所需的毫秒数和写完的 Promise */
export function place(parent: SVGElement, w: Written, o: PlaceOpts) {
  const g = el('g', { class: `ink tone-${o.tone ?? 'ink'}`, transform: `translate(${o.x} ${o.y})${o.scale ? ` scale(${o.scale})` : ''}` })
  if (o.opacity != null) g.style.opacity = String(o.opacity)
  parent.append(g)

  const total = w.strokes.reduce((a, s) => a + s.length, 0) || 1
  const still = o.still || reduced()
  const natural = total / (o.speed ?? 0.55)
  const k = Math.min(1, (o.maxMs ?? 2400) / natural)
  const dur = still ? 0 : natural * k
  let at = o.delay ?? 0
  for (const s of w.strokes) {
    const id = `m${++uid}`
    const len = s.length + 1
    const center = el('path', {
      d: s.center,
      fill: 'none',
      stroke: '#fff',
      'stroke-width': w.pen * 3.4,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-dasharray': len,
    })
    const mask = el('mask', { id, maskUnits: 'userSpaceOnUse' })
    mask.append(center)
    const fill = el('path', { d: s.d, mask: `url(#${id})` })
    g.append(mask, fill)
    if (still) {
      center.style.strokeDashoffset = '0'
    } else {
      const d = Math.max(30, (s.length / total) * dur)
      center.style.strokeDashoffset = String(len)
      center.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: d, delay: at, easing: 'linear', fill: 'both' })
      at += d
    }
  }
  const done = still ? Promise.resolve() : new Promise<void>((r) => setTimeout(r, at + 20))
  return { g, ms: at, done }
}

/** 把写好的一块直接做成一个独立的 SVG（标题、品牌字用） */
export function inkSvg(parts: { w: Written; x: number; y: number; tone?: Tone }[], width: number, height: number, play: boolean) {
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-hidden': 'true', preserveAspectRatio: 'xMinYMid meet' })
  let t = 0
  const done: Promise<void>[] = []
  for (const p of parts) {
    const r = place(svg, p.w, { x: p.x, y: p.y, tone: p.tone, still: !play, delay: t, maxMs: 1800 })
    t += r.ms
    done.push(r.done)
  }
  return { svg, ms: t, done: Promise.all(done).then(() => undefined) }
}
