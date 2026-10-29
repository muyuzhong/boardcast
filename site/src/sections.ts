// 首屏以外的几块交互：工作原理的粘性舞台、潦草度滑杆、隐私一节的「云被划掉」、路线清单。

import { getLang, onLang, t } from './i18n.ts'
import { place } from './stage.ts'
import { cloud, strikeThrough, underline, writeText } from './write.ts'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// —— 工作原理：滚到哪一步，右边的舞台就换到哪一步 ——
function initHow() {
  const stage = document.getElementById('stage')!
  const steps = [...document.querySelectorAll<HTMLElement>('#steps li')]
  const code = document.getElementById('code')!
  const mini = document.getElementById('miniLayer') as unknown as SVGGElement
  let drawn = 0

  const fillCode = () => {
    code.replaceChildren()
    t('how.code')
      .split('\n')
      .forEach((l, i) => {
        const s = document.createElement('span')
        s.textContent = l
        s.style.setProperty('--i', String(i))
        code.append(s)
      })
  }

  async function drawMini() {
    const my = ++drawn
    mini.replaceChildren()
    const zh = getLang() === 'zh'
    const rows = zh ? ['免费版', '团队版', '按年付费'] : ['Free tier', 'Team plan', 'Annual']
    const head = await writeText(zh ? '定价' : 'Pricing', 34, { seed: 'mini:h' })
    if (my !== drawn) return
    await place(mini, head, { x: 10, y: 4, maxMs: 700, still: reduced() }).done
    await place(mini, underline(head.width + 12, 34, 'mini:u'), { x: 4, y: 48, maxMs: 300, still: reduced() }).done
    for (let i = 0; i < rows.length; i++) {
      if (my !== drawn) return
      const w = await writeText(`${i + 1}.  ${rows[i]}`, 24, { seed: `mini:${i}` })
      const g = place(mini, w, { x: 10, y: 74 + i * 38, maxMs: 700, still: reduced() })
      await g.done
      if (i === 2) {
        const s = strikeThrough(w.width, 24, 'mini:s')
        place(mini, s, { x: 10, y: 74 + i * 38, maxMs: 300, still: reduced() })
        g.g.style.opacity = '0.5'
      }
    }
  }

  const set = (i: number) => {
    if (stage.dataset.step === String(i)) return
    stage.dataset.step = String(i)
    steps.forEach((s, k) => s.classList.toggle('on', k === i))
    if (i === 3) void drawMini()
  }
  steps.forEach((s, k) => s.classList.toggle('on', k === 0))
  fillCode()
  onLang(() => {
    fillCode()
    if (stage.dataset.step === '3') void drawMini()
  })

  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) if (e.isIntersecting) set(Number((e.target as HTMLElement).dataset.step))
    },
    { rootMargin: '-42% 0px -48% 0px' },
  )
  for (const s of steps) io.observe(s)

  // 窄屏上四块面板是竖着排的，没有「当前一步」，小白板滚到眼前时直接写
  let once = false
  new IntersectionObserver(
    (es) => {
      if (es[0].isIntersecting && !once && matchMedia('(max-width: 920px)').matches) {
        once = true
        void drawMini()
      }
    },
    { threshold: 0.5 },
  ).observe(document.getElementById('miniInk')!)
}

// —— 潦草度 ——
function initPlay() {
  const layer = document.getElementById('playLayer') as unknown as SVGGElement
  const svg = document.getElementById('playSvg') as unknown as SVGSVGElement
  const slider = document.getElementById('messy') as HTMLInputElement
  const val = document.getElementById('messyVal')!
  const input = document.getElementById('playIn') as HTMLInputElement
  const chips = document.getElementById('playChips')!
  let seq = 0
  let raf = 0

  const SAMPLES = () =>
    getLang() === 'zh' ? ['下周三之前把价格定下来', '它是怎么写出来的？', 'boardcast 2026'] : ['ship it by Friday', 'how is this written?', 'boardcast 2026']

  async function render(animate: boolean) {
    const my = ++seq
    const m = Number(slider.value) / 100
    val.textContent = slider.value
    const text = input.value.trim() || SAMPLES()[0]
    const w = await writeText(text, 76, { seed: 'play', messy: m })
    if (my !== seq) return
    layer.replaceChildren()
    const vw = Math.max(900, w.width + 40)
    svg.setAttribute('viewBox', `0 0 ${vw} 140`)
    place(layer, w, { x: 20, y: 10, still: !animate || reduced(), maxMs: 1800 })
  }

  const schedule = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => void render(false))
  }
  slider.addEventListener('input', schedule)
  input.addEventListener('input', schedule)

  function chipsRender() {
    chips.replaceChildren()
    for (const s of SAMPLES()) {
      const b = document.createElement('button')
      b.type = 'button'
      b.textContent = s
      b.addEventListener('click', () => {
        input.value = s
        void render(true)
      })
      chips.append(b)
    }
  }
  chipsRender()
  onLang(() => {
    input.value = ''
    chipsRender()
    void render(false)
  })

  let first = true
  new IntersectionObserver(
    (es, o) => {
      if (es[0].isIntersecting && first) {
        first = false
        void render(true)
        o.disconnect()
      }
    },
    { threshold: 0.4 },
  ).observe(document.querySelector('.play')!)
}

// —— 隐私：云被划掉 ——
function initPrivacy() {
  const layer = document.getElementById('cloudLayer') as unknown as SVGGElement
  const host = document.getElementById('diagram')!
  let done = false
  const draw = async () => {
    layer.replaceChildren()
    const c = cloud(190, 'cloud')
    await place(layer, c, { x: 25, y: 14, tone: 'mute', maxMs: 900, still: reduced() }).done
    place(layer, strikeThrough(210, 36, 'cloud:x1'), { x: 14, y: 38, tone: 'red', maxMs: 350, still: reduced() })
    await new Promise((r) => setTimeout(r, reduced() ? 0 : 300))
    place(layer, strikeThrough(210, 36, 'cloud:x2'), { x: 18, y: 70, tone: 'red', maxMs: 350, still: reduced() })
  }
  new IntersectionObserver(
    (es, o) => {
      if (es[0].isIntersecting && !done) {
        done = true
        void draw()
        host.classList.add('cut')
        o.disconnect()
      }
    },
    { threshold: 0.5 },
  ).observe(host)
}

// —— 路线、导出样例 ——
function initLists() {
  const fill = () => {
    for (const [id, key] of [
      ['roadNow', 'road.now.items'],
      ['roadNext', 'road.next.items'],
    ] as const) {
      const ul = document.getElementById(id)!
      ul.replaceChildren()
      for (const s of t(key).split('|')) {
        const li = document.createElement('li')
        li.textContent = s
        ul.append(li)
      }
    }
    document.getElementById('exportCode')!.textContent = t('feat.export')
  }
  fill()
  onLang(fill)
}

export function initSections() {
  initHow()
  initPlay()
  initPrivacy()
  initLists()
}
