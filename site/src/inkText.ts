// 页面上的手写标题：data-ink="i18n 键" 或 data-ink-raw="原文"。
// 先把字写好（要等笔画数据），滚进视野或加载时再一笔一笔「写」出来。

import { onLang, t } from './i18n.ts'
import { type Tone, inkSvg } from './stage.ts'
import { type Written, squiggle, writeLines } from './write.ts'

const BASE = 100

interface Entry {
  host: HTMLElement
  shown: boolean
  mount: (play: boolean) => void
}

const entries: Entry[] = []

async function build(host: HTMLElement): Promise<Entry['mount']> {
  const raw = host.dataset.inkRaw
  const text = raw ?? t(host.dataset.ink!)
  const messy = Number(host.dataset.messy ?? 0.16)
  const seed = host.dataset.ink ?? raw ?? 'ink'
  const { lines, step } = await writeLines(text, BASE, { seed, messy, script: host.dataset.script === '1' ? true : undefined, weight: Number(host.dataset.weight ?? 1) })
  const maxW = Math.max(...lines.map((l) => l.width))
  const center = host.dataset.align === 'center'
  const parts: { w: Written; x: number; y: number; tone?: Tone }[] = lines.map((w, i) => ({ w, x: center ? (maxW - w.width) / 2 : 0, y: i * step }))
  let width = maxW
  let height = (lines.length - 1) * step + lines[0].height
  if (host.dataset.underline === 'last') {
    const last = lines[lines.length - 1]
    parts.push({ w: squiggle(last.width, BASE, `${seed}:ul`), x: center ? (maxW - last.width) / 2 : 0, y: (lines.length - 1) * step + BASE * 1.12, tone: 'red' })
    height += BASE * 0.3
    width = Math.max(width, last.width)
  }
  const sr = document.createElement('span')
  sr.className = 'sr'
  sr.textContent = text.replace(/\n/g, ' ')
  return (play) => {
    const { svg } = inkSvg(parts, width, height, play)
    svg.style.maxWidth = `calc(${(width / BASE).toFixed(3)} * 1em)`
    host.replaceChildren(sr.cloneNode(true), svg)
  }
}

export function initInk() {
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue
        const en = entries.find((x) => x.host === e.target)
        if (en && !en.shown) {
          en.shown = true
          en.mount(true)
        }
        io.unobserve(e.target)
      }
    },
    { threshold: 0.35 },
  )

  const hosts = [...document.querySelectorAll<HTMLElement>('.ink-write')]
  const setup = async () => {
    for (const host of hosts) {
      const mount = await build(host)
      const prev = entries.find((x) => x.host === host)
      if (prev) {
        prev.mount = mount
        if (prev.shown) mount(true)
        continue
      }
      const en: Entry = { host, shown: false, mount }
      entries.push(en)
      if (host.dataset.play === 'load') {
        en.shown = true
        mount(true)
      } else io.observe(host)
    }
  }
  void setup()
  onLang(() => void setup())
}
