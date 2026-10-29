// 首屏的白板：一段预设的会议自己演一遍；访客在输入栏打字，用同一支笔接着写。
// 网页版没有模型，打字走的是规则快车道（和桌面版里「画一下 A 到 B」同一类规则），界面上会明说。

import { getLang, onLang, t, type Lang } from './i18n.ts'
import { type Tone, place, el } from './stage.ts'
import { arrowed, boxed, star, strikeThrough, underline, writeText, type Written } from './write.ts'

const W = 1000
const COLS = [40, 360, 680]
const TITLE = 40
const ITEM = 28
const ITEM_DX = 44
const ROW = 50
const FLOW_Y = [400, 500]

type L = Record<Lang, string>
const L = (zh: string, en: string): L => ({ zh, en })

type Act =
  | { k: 'topic'; col: number; text: L }
  | { k: 'item'; col: number; id: string; text: L; star?: boolean }
  | { k: 'strike'; id: string }
  | { k: 'question'; col: number; text: L }
  | { k: 'flow'; labels: L[] }

interface Step {
  who: 'A' | 'B' | 'C'
  say: L
  acts: Act[]
}

const SCENE: Step[] = [
  {
    who: 'A',
    say: L('今天定一下发布的事，先说三件：定价、渠道、演示。', 'Let’s settle the launch. Three things: pricing, channels, demo.'),
    acts: [
      { k: 'topic', col: 0, text: L('定价', 'Pricing') },
      { k: 'topic', col: 1, text: L('渠道', 'Channels') },
      { k: 'topic', col: 2, text: L('演示', 'Demo') },
    ],
  },
  {
    who: 'B',
    say: L('定价我倾向免费版加团队版，团队版按人头收，也可以按年付。', 'For pricing I’d do a free tier and a team plan, per seat, maybe annual billing.'),
    acts: [
      { k: 'item', col: 0, id: 'free', text: L('免费版', 'Free tier') },
      { k: 'item', col: 0, id: 'team', text: L('团队版：按人头', 'Team plan: per seat') },
      { k: 'item', col: 0, id: 'year', text: L('按年付费', 'Annual billing') },
    ],
  },
  {
    who: 'C',
    say: L('渠道先走 GitHub 和 Product Hunt。', 'Channels: GitHub and Product Hunt first.'),
    acts: [
      { k: 'item', col: 1, id: 'gh', text: L('GitHub', 'GitHub') },
      { k: 'item', col: 1, id: 'ph', text: L('Product Hunt', 'Product Hunt') },
    ],
  },
  {
    who: 'A',
    say: L('演示要现场说话，别放视频，这个最重要。', 'The demo has to be live speech, no video. That one matters most.'),
    acts: [{ k: 'item', col: 2, id: 'live', text: L('现场说话，不放视频', 'Live speech, no video'), star: true }],
  },
  {
    who: 'B',
    say: L('团队版到底多少钱？这个还没想好。', 'How much is the team plan, actually? Not decided yet.'),
    acts: [{ k: 'question', col: 0, text: L('团队版定价？', 'Team plan price?') }],
  },
  {
    who: 'C',
    say: L('按年付费那个方案不要了。', 'Drop the annual billing idea.'),
    acts: [{ k: 'strike', id: 'year' }],
  },
  {
    who: 'A',
    say: L('演示的数据流是麦克风、识别、本地模型、白板。', 'The demo’s data flow is mic, recognition, local model, board.'),
    acts: [{ k: 'flow', labels: [L('麦克风', 'Mic'), L('识别', 'ASR'), L('本地模型', 'Local LLM'), L('白板', 'Board')] }],
  },
]

class Cancel extends Error {}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initDemo() {
  const win = document.getElementById('demo') as HTMLElement
  const layer = document.getElementById('layer') as unknown as SVGGElement
  const empty = document.getElementById('empty') as HTMLElement
  const capSpk = document.getElementById('capSpk') as HTMLElement
  const capText = document.getElementById('capText') as HTMLElement
  const opsEl = document.getElementById('ops') as HTMLElement
  const form = document.getElementById('composer') as HTMLFormElement
  const input = document.getElementById('say') as HTMLInputElement
  const spkBtn = document.getElementById('spk') as HTMLButtonElement
  const chipsEl = document.getElementById('chips') as HTMLElement

  let tok = 0
  let started = false

  // —— 白板状态 ——
  interface Item {
    x: number
    y: number
    w: number
    g: SVGGElement
  }
  let items = new Map<string, Item>()
  let colRows = [0, 0, 0]
  let colTitled = [false, false, false]
  let n = 0 // 编号，给 ops 里的 nN 用
  const ids = new Map<string, number>()
  const nid = (key: string) => {
    if (!ids.has(key)) ids.set(key, ++n)
    return `n${ids.get(key)}`
  }

  // 自由模式（访客自己打字）
  let free = false
  let topicCol = -1
  let flowNodes = new Map<string, { x: number; y: number; w: number; h: number }>()
  let flowEdges = new Set<string>()
  let flowRow = 0
  let flowX = 40

  const alive = (my: number) => {
    if (my !== tok) throw new Cancel()
  }

  function reset() {
    layer.replaceChildren()
    items = new Map()
    colRows = [0, 0, 0]
    colTitled = [false, false, false]
    n = 0
    ids.clear()
    topicCol = -1
    flowNodes = new Map()
    flowEdges = new Set()
    flowRow = 0
    flowX = 40
    empty.hidden = true
    capText.textContent = ''
    capText.classList.remove('interim')
    opsEl.replaceChildren()
    win.classList.remove('listening')
  }

  // —— 往板上写 ——
  const msFor = 2400
  async function put(w: Written, x: number, y: number, tone: Tone = 'ink', my: number, opts: { delay?: number; opacity?: number } = {}) {
    alive(my)
    const r = place(layer, w, { x, y, tone, maxMs: msFor, still: reduced(), ...opts })
    await r.done
    alive(my)
    return r.g
  }

  async function topic(col: number, text: string, my: number) {
    const x = COLS[col]
    const w = await writeText(text, TITLE, { seed: `topic:${col}:${text}` })
    await put(w, x, 14, 'ink', my)
    await put(underline(w.width + 16, TITLE, `ul:${col}`), x - 6, 14 + TITLE * 1.3, 'ink', my)
    colRows[col] = 0
    colTitled[col] = true
    return w.width
  }

  const rowY = (col: number, row: number) => (colTitled[col] ? 110 : 30) + row * ROW

  async function item(col: number, key: string, text: string, my: number, opts: { star?: boolean; tone?: Tone; mark?: string } = {}) {
    const row = colRows[col]++
    const x = COLS[col]
    const y = rowY(col, row)
    const tone = opts.tone ?? 'ink'
    const pre = await writeText(opts.mark ?? `${row + 1}.`, ITEM, { seed: `pre:${col}:${row}` })
    const w = await writeText(text, ITEM, { seed: `item:${key}` })
    const g = el('g')
    layer.append(g)
    await put(pre, x, y, tone, my)
    const body = await put(w, x + ITEM_DX, y, tone, my)
    g.append(body)
    if (opts.star) {
      const s = await star(ITEM, `star:${key}`)
      await put(s, x + ITEM_DX + w.width + 6, y - 4, 'red', my)
    }
    items.set(key, { x: x + ITEM_DX, y, w: w.width, g: body })
    return { x, y, w: w.width }
  }

  async function strike(key: string, my: number) {
    const it = items.get(key)
    if (!it) return
    await put(strikeThrough(it.w + 10, ITEM, `strike:${key}`), it.x - 4, it.y, 'ink', my)
    it.g.style.opacity = '0.5'
  }

  async function question(col: number, text: string, my: number) {
    const row = colRows[col]++
    const y = rowY(col, row) + 14
    const q = await writeText('?', ITEM, { seed: `q:${col}` })
    const w = await writeText(text, ITEM, { seed: `qt:${text}` })
    await put(q, COLS[col], y, 'red', my)
    await put(w, COLS[col] + ITEM_DX, y, 'red', my)
  }

  async function flowBox(label: string, x: number, y: number, my: number) {
    const w = await writeText(label, ITEM + 2, { seed: `flow:${label}` })
    const bw = w.width + 36
    const bh = 64
    await put(boxed(bw, bh, ITEM, `box:${label}`), x, y, 'ink', my)
    await put(w, x + 18, y + 12, 'ink', my)
    return { x, y, w: bw, h: bh }
  }

  async function flow(labels: string[], my: number) {
    const ws = await Promise.all(labels.map((s) => writeText(s, ITEM + 2, { seed: `flow:${s}` })))
    const gap = 64
    const total = ws.reduce((a, w) => a + w.width + 36, 0) + gap * (labels.length - 1)
    let x = Math.max(40, (W - total) / 2)
    let prev: { x: number; y: number; w: number; h: number } | undefined
    for (const s of labels) {
      const b = await flowBox(s, x, FLOW_Y[0] + 20, my)
      if (prev) await put(arrowed([[prev.x + prev.w + 8, prev.y + prev.h / 2], [b.x - 10, b.y + b.h / 2]], ITEM, `arr:${s}`), 0, 0, 'ink', my)
      prev = b
      x += b.w + gap
    }
  }

  async function act(a: Act, my: number, lang: Lang) {
    if (a.k === 'topic') await topic(a.col, a.text[lang], my)
    else if (a.k === 'item') {
      nid(a.id)
      await item(a.col, a.id, a.text[lang], my, { star: a.star })
    } else if (a.k === 'strike') await strike(a.id, my)
    else if (a.k === 'question') await question(a.col, a.text[lang], my)
    else await flow(a.labels.map((l) => l[lang]), my)
  }

  // —— 字幕和操作行 ——
  function opsOf(s: Step, lang: Lang): string[] {
    const out: string[] = []
    const q = (x: string) => (lang === 'zh' ? `「${x}」` : `"${x}"`)
    for (const a of s.acts) {
      if (a.k === 'topic') out.push(`T  ${q(a.text[lang])}`)
      else if (a.k === 'item') {
        out.push(`L  n${a.col + 1} ${q(a.text[lang])}`)
        if (a.star) out.push(`M  ${nid(a.id)} ${lang === 'zh' ? '星标' : 'star'}`)
      } else if (a.k === 'strike') out.push(`M  ${nid(a.id)} ${lang === 'zh' ? '划掉' : 'strike'}`)
      else if (a.k === 'question') out.push(`Q  n${a.col + 1} ${q(a.text[lang])}`)
      else out.push(a.labels.slice(1).map((l, i) => `E  ${q(a.labels[i][lang])} -> ${q(l[lang])}`).join('\n'))
    }
    return out
  }

  function showOps(lines: string[], tag?: string) {
    opsEl.replaceChildren()
    for (const l of lines.join('\n').split('\n')) {
      const d = document.createElement('div')
      d.textContent = l
      opsEl.append(d)
    }
    if (tag) {
      const d = document.createElement('div')
      d.className = 'ops-tag'
      d.textContent = tag
      opsEl.append(d)
    }
  }

  function setSpeaker(who: string) {
    capSpk.textContent = who
    capSpk.dataset.who = who
  }

  /** 临时字幕一个字一个字出来（灰），说完变实 */
  async function caption(who: string, text: string, my: number) {
    setSpeaker(who)
    opsEl.replaceChildren()
    win.classList.add('listening')
    capText.classList.add('interim')
    if (reduced()) capText.textContent = text
    else {
      capText.textContent = ''
      const chars = [...text]
      const step = Math.max(14, Math.min(34, 1500 / chars.length))
      for (let i = 1; i <= chars.length; i++) {
        capText.textContent = chars.slice(0, i).join('')
        await wait(step)
        alive(my)
      }
      await wait(220)
    }
    alive(my)
    capText.classList.remove('interim')
    win.classList.remove('listening')
  }

  // —— 预设会议 ——
  async function play(my: number) {
    reset()
    started = true
    const lang = getLang()
    try {
      for (const s of SCENE) {
        await caption(s.who, s.say[lang], my)
        showOps(opsOf(s, lang))
        for (const a of s.acts) await act(a, my, lang)
        await wait(reduced() ? 0 : 700)
        alive(my)
      }
      await wait(reduced() ? 0 : 400)
      alive(my)
      // 演完了：把输入栏轻轻提醒一下
      win.classList.add('your-turn')
      input.focus({ preventScroll: true })
    } catch (e) {
      if (!(e instanceof Cancel)) throw e
    }
  }

  function restart() {
    tok++
    free = false
    win.classList.remove('your-turn')
    void play(tok)
  }

  // —— 访客自己打字：规则快车道 ——
  const ARROW = /\s*(?:->|→|=>|＝>|—>)\s*/
  const PREFIX = /^(画一下|画个|画|连一下|连接|连|draw|connect)\s*/i

  type Parsed = { kind: 'edge'; chain: string[] } | { kind: 'topic'; text: string } | { kind: 'question'; text: string } | { kind: 'item'; text: string }

  function parse(raw: string): Parsed {
    const s = raw.trim()
    const topicM = s.match(/^(?:话题|议题|topic)\s*[:：]\s*(.+)$/i)
    if (topicM) return { kind: 'topic', text: topicM[1].trim() }
    let body = s
    let chain = body.split(ARROW).map((x) => x.trim()).filter(Boolean)
    if (chain.length < 2 && PREFIX.test(s)) {
      body = s.replace(PREFIX, '')
      chain = body.split(/\s*到\s*|\s+to\s+/i).map((x) => x.trim()).filter(Boolean)
    }
    if (chain.length >= 2 && chain.every((x) => [...x].length <= 14)) return { kind: 'edge', chain }
    if (/[?？]$/.test(s)) return { kind: 'question', text: s.replace(/[?？]+$/, '').trim() || s }
    return { kind: 'item', text: s }
  }

  async function ensureRoom(my: number, needItem: boolean, needFlow: boolean) {
    const itemsFull = needItem && topicCol >= 0 && colRows[topicCol] >= 5
    const flowFull = needFlow && flowRow >= FLOW_Y.length
    if (itemsFull || flowFull) {
      notice(t('demo.full'))
      layer.replaceChildren()
      items = new Map()
      colRows = [0, 0, 0]
      colTitled = [false, false, false]
      topicCol = -1
      flowNodes = new Map()
      flowEdges = new Set()
      flowRow = 0
      flowX = 40
      await wait(250)
      alive(my)
    }
  }

  function notice(msg: string) {
    empty.textContent = msg
    empty.hidden = false
    setTimeout(() => {
      if (empty.textContent === msg) empty.hidden = true
    }, 2200)
  }

  async function flowNode(label: string, my: number, after?: { x: number; y: number; w: number; h: number }) {
    const have = flowNodes.get(label)
    if (have) return have
    const w = await writeText(label, ITEM + 2, { seed: `flow:${label}` })
    const bw = w.width + 36
    if (flowX + bw > W - 40) {
      flowRow++
      flowX = 40
    }
    if (flowRow >= FLOW_Y.length) {
      await ensureRoom(my, false, true)
    }
    const x = after && flowRow === 0 && after.y === FLOW_Y[0] ? Math.max(flowX, after.x + after.w + 64) : flowX
    const b = await flowBox(label, x, FLOW_Y[flowRow], my)
    flowX = x + bw + 64
    flowNodes.set(label, b)
    return b
  }

  async function run(parsed: Parsed, my: number) {
    if (parsed.kind === 'topic') {
      topicCol = (topicCol + 1) % COLS.length
      if (colTitled[topicCol] || colRows[topicCol]) {
        // 三列都用过了就擦掉重来
        layer.replaceChildren()
        items = new Map()
        colRows = [0, 0, 0]
        colTitled = [false, false, false]
        flowNodes = new Map()
        flowEdges = new Set()
        flowRow = 0
        flowX = 40
        topicCol = 0
        notice(t('demo.full'))
        await wait(250)
        alive(my)
      }
      showOps([`T  ${q(parsed.text)}`], tag())
      await topic(topicCol, parsed.text, my)
    } else if (parsed.kind === 'question' || parsed.kind === 'item') {
      if (topicCol < 0) topicCol = 0
      await ensureRoom(my, true, false)
      const col = topicCol
      showOps([`${parsed.kind === 'question' ? 'Q' : 'L'}  n${col + 1} ${q(parsed.text)}`], tag())
      if (parsed.kind === 'question') await question(col, parsed.text, my)
      else await item(col, `u${Math.random()}`, parsed.text, my)
    } else {
      showOps(parsed.chain.slice(1).map((l, i) => `E  ${q(parsed.chain[i])} -> ${q(l)}`), tag())
      let prev: { x: number; y: number; w: number; h: number } | undefined
      for (const label of parsed.chain) {
        const b = await flowNode(label, my, prev)
        if (prev) {
          const key = `${prev.x},${prev.y}>${b.x},${b.y}`
          if (!flowEdges.has(key)) {
            flowEdges.add(key)
            const same = prev.y === b.y && b.x > prev.x
            const pts: [number, number][] = same
              ? [[prev.x + prev.w + 8, prev.y + prev.h / 2], [b.x - 10, b.y + b.h / 2]]
              : [[prev.x + prev.w / 2, prev.y + prev.h + 6], [b.x + b.w / 2, b.y - 8]]
            await put(arrowed(pts, ITEM, `arr:${key}`), 0, 0, 'ink', my)
          }
        }
        prev = b
      }
    }
  }

  const q = (x: string) => (getLang() === 'zh' ? `「${x}」` : `"${x}"`)
  const tag = () => (getLang() === 'zh' ? '// 网页演示：规则快车道，没有跑模型' : '// web demo: rules lane, no model running')

  async function say(text: string) {
    const s = text.trim()
    if (!s) return
    // 第一次插话：把预设会议的板子换成空白，轮到访客
    const my = ++tok
    win.classList.remove('your-turn')
    if (!free) {
      free = true
      reset()
      await wait(40)
    } else {
      opsEl.replaceChildren()
    }
    try {
      await caption(spkBtn.dataset.who ?? t('demo.you'), s, my)
      await run(parse(s), my)
    } catch (e) {
      if (!(e instanceof Cancel)) throw e
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const v = input.value
    input.value = ''
    void say(v)
  })

  // 说话人：点一下轮换，和桌面版输入框前面那个标签一样
  const WHO = () => [t('demo.you'), 'A', 'B', 'C']
  function setWho(i: number) {
    const w = WHO()[i % 4]
    spkBtn.dataset.i = String(i % 4)
    spkBtn.dataset.who = w
    spkBtn.textContent = w
  }
  spkBtn.addEventListener('click', () => setWho(Number(spkBtn.dataset.i ?? 0) + 1))

  const CHIPS: L[] = [
    L('用户 → 网关 → 订单服务', 'User -> Gateway -> Orders'),
    L('话题：预算', 'topic: Budget'),
    L('上线时间定了吗？', 'Is the launch date set?'),
    L('画一下 麦克风 到 白板', 'draw Mic to Board'),
  ]
  function renderChips() {
    chipsEl.replaceChildren()
    for (const c of CHIPS) {
      const b = document.createElement('button')
      b.type = 'button'
      b.textContent = c[getLang()]
      b.addEventListener('click', () => void say(c[getLang()]))
      chipsEl.append(b)
    }
    setWho(Number(spkBtn.dataset.i ?? 0))
  }
  renderChips()

  document.getElementById('replay')!.addEventListener('click', restart)
  document.getElementById('clear')!.addEventListener('click', () => {
    tok++
    free = true
    reset()
    win.classList.remove('your-turn')
    empty.textContent = t('demo.empty')
    empty.hidden = false
  })

  onLang(() => {
    renderChips()
    empty.textContent = t('demo.empty')
    // 语言一换，板上的字要重写成另一种语言
    if (started) restart()
  })

  // 滚到才开演，免得用户看不到
  const io = new IntersectionObserver(
    (es) => {
      if (es[0].isIntersecting && !started) {
        started = true
        void play(++tok)
      }
    },
    { threshold: 0.35 },
  )
  io.observe(win)
}
