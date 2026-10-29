// 中英双语。页面上的文字都从这里取；手写的标题（data-ink）和普通文字（data-i18n）共用同一份。

export type Lang = 'zh' | 'en'

type Dict = Record<string, string>

const zh: Dict = {
  'nav.how': '工作原理',
  'nav.hand': '手写',
  'nav.privacy': '隐私',
  'nav.features': '功能',
  'nav.roadmap': '路线',
  'nav.download': '下载',
  'lang.other': 'EN',
  'theme.toggle': '切换白板 / 黑板',
  'theme.paper': '白板',
  'theme.chalk': '黑板',

  'hero.eyebrow': '本地优先 · 实时会议板书',
  'hero.title': '说话，\n板书自己长出来。',
  'hero.lede': '会议里大家只管讨论，白板上的手绘示意图跟着对话实时生长。全部在你的电脑上运行：不上传音频，不调用云端模型。',
  'hero.note': 'v0.1 早期版本 · Linux / Windows · MIT 开源',
  'cta.download': '下载桌面版',
  'cta.github': '在 GitHub 看源码',

  'demo.title': '产品发布评审',
  'demo.aria': '一块会自己写字的白板',
  'demo.replay': '重播',
  'demo.clear': '清空',
  'demo.placeholder': '说一句…（回车）',
  'demo.speaker': '换一个说话人',
  'demo.you': '你',
  'demo.empty': '白板是空的，说点什么',
  'demo.full': '板子写满了，擦干净接着来',
  'demo.try': '↑ 这是真的：在输入栏打一句，白板会用同一支笔写出来',
  'demo.listening': '正在听…',

  'how.eyebrow': '工作原理',
  'how.title': '一句话，\n一次编辑。',
  'how.s1.t': '听',
  'how.s1.p': '麦克风由桌面外壳采集，Silero 断句，停顿约 0.45 秒就算一句话说完；SenseVoice 识别中英日韩粤，自带标点。',
  'how.s2.t': '想',
  'how.s2.p': '小模型不画图，只写几行「图操作」。每次按当前白板生成语法约束，编号只能从已有节点里选，写不出不存在的东西。',
  'how.s3.t': '排',
  'how.s3.p': '排版是确定性的代码。旧内容原地不动，新内容找空地放，会开到一半板书不会乱跳。',
  'how.s4.t': '写',
  'how.s4.p': '汉字按笔顺一笔一笔写出来。一轮新内容最多写 2.4 秒，写不完就整体加速，板书不会落后于讨论。',
  'how.p1.tag': '麦克风 → Silero VAD → SenseVoice',
  'how.p1.q': '「免费版和团队版，团队版按人头收。」',
  'how.p2.tag': '本地小模型 · 语法约束解码',
  'how.p2.foot': '只输出这几行。编号只能是白板上已有的。',
  'how.p3.tag': '确定性排版',
  'how.p3.foot': '实线：原地不动　虚线：新来的，找空地',
  'how.p4.tag': 'perfect-freehand · 逐笔书写',
  'how.code':
    'T  「定价」\nL  n1 「免费版」\nL  n1 「团队版：按人头」\nM  n3 星标\nE  n5 -> n6 : 「喂给」',

  'hand.eyebrow': '手写',
  'hand.title': '不是手写字体，\n是真的在写。',
  'hand.p':
    '汉字用按笔顺排好的骨架线，英文数字用 Hershey 单线字体，再交给 perfect-freehand 模拟马克笔的压感和收笔。拖动「潦草度」：同一句话从工整写到龙飞凤舞；过半以后汉字带出连笔，英文小写换成连写体。',
  'hand.messy': '潦草度',
  'hand.neat': '工整',
  'hand.wild': '龙飞凤舞',
  'hand.ph': '写点什么…',

  'priv.eyebrow': '隐私',
  'priv.title': '声音不出\n这台电脑。',
  'priv.p': '转写、模型、排版、书写，每一步都在本机完成。没有账号，没有云端，开会也不需要联网。',
  'priv.machine': '你的电脑',
  'priv.mic': '麦克风',
  'priv.asr': '语音识别',
  'priv.llm': '本地模型',
  'priv.board': '白板',
  'priv.cloud': '云端',
  'priv.s1.u': '字节上传',
  'priv.s1.d': '音频和文字都留在本机',
  'priv.s2.d': '一句话到板书（Qwen3.5-4B，RTX 3060 笔记本实测 p50 382 ms）',
  'priv.s3.d': '轻量档模型；核显和纯 CPU 也能跑',
  'priv.s4.d': '代码开源，可以自己审',
  'priv.fine': '首次下载模型需要联网。想用更大的模型，可以自己填一个远程接口——默认不开，失败时自动退回本地。',

  'feat.eyebrow': '还有这些',
  'feat.title': '为真实会议\n准备的细节。',
  'feat.a.t': '白板、黑板，或可编辑的铅笔稿',
  'feat.a.p': '手写模式像有人拿马克笔在写，深色主题下是黑板粉笔。铅笔模式是 Excalidraw 的手绘风格，可以直接拖动、修改、补画。',
  'feat.b.t': '话题和流程图，同一块板',
  'feat.b.p': '要点板有话题、多层条目、待定问题、公式，还能划掉、圈出、星标；流程图有连线和分组。两类可以并存、互相连线。方案被否掉时默认划掉而不是擦掉，更像真实板书。',
  'feat.c.t': '排版不乱跳',
  'feat.c.p': '写上去的东西不挪地方，新内容放在相关节点旁边。时间长了留下空洞，点一下「整理排版」整块重排。',
  'feat.d.t': '导出带走',
  'feat.d.p': '话题写成标题加编号条目，划掉、圈出、星标都保留；流程图写成 Mermaid，最后附上会议记录。',
  'feat.e.t': '开箱即用的本地模型',
  'feat.e.p':
    '自带 llama.cpp（Vulkan：N 卡、A 卡、Intel 核显、骁龙 Adreno 都能用，没有显卡自动退回 CPU）。首次启动按显卡推荐一档，断点续传，下完校验 sha256。',
  'feat.f.t': '中英混着说也行',
  'feat.f.p': 'SenseVoice 识别中、英、日、韩、粤，带标点，数字自动规整。一句 5.6 秒的话，识别只要两三百毫秒。',
  'feat.export': '## 定价\n1. 免费版\n2. 团队版：按人头\n3. ~~按年付费~~\n\n```mermaid\nflowchart LR\n  麦克风 --> 识别 --> 本地模型 --> 白板\n```',

  'road.eyebrow': '路线',
  'road.title': '现在能做什么，\n接下来做什么。',
  'road.now': '现在',
  'road.next': '接下来',
  'road.now.items':
    '文字 → 图操作 → 手绘板书|要点板和流程图，可并存|手写模式：白板 / 黑板，潦草度可调|语音输入：麦克风，带临时字幕|首次启动下载模型，按显卡推荐|远程接口（OpenAI 兼容），本地兜底|增量排版，旧内容不跳|导出 Markdown / PNG / .excalidraw',
  'road.next.items':
    '系统声音：线上会议里别人的声音|区分说话人|macOS 构建|手写模式里的小图标|不参与调参的测试集，再给 2B–4B 小模型做 LoRA 微调',

  'final.title': '把会议，\n交给白板。',
  'final.p': '桌面版，开源（MIT）。目前支持 Linux 和 Windows。',
  'final.soon': '开发中',
  'final.gh': 'github.com/HsiangNianian/boardcast ↗',
  'foot.credit': '汉字笔画来自 hanzi-writer-data（Arphic Public License）· Hershey 字体来自 hersheytext（MIT）',
}

const en: Dict = {
  'nav.how': 'How it works',
  'nav.hand': 'Handwriting',
  'nav.privacy': 'Privacy',
  'nav.features': 'Features',
  'nav.roadmap': 'Roadmap',
  'nav.download': 'Download',
  'lang.other': '中文',
  'theme.toggle': 'Switch whiteboard / blackboard',
  'theme.paper': 'Whiteboard',
  'theme.chalk': 'Blackboard',

  'hero.eyebrow': 'Local-first · live meeting diagrams',
  'hero.title': 'Talk.\nThe board draws itself.',
  'hero.lede':
    'Just have the meeting. The whiteboard sketches along with the conversation, live. Everything runs on your own machine: no audio uploaded, no cloud model.',
  'hero.note': 'v0.1 early release · Linux / Windows · MIT licensed',
  'cta.download': 'Download for desktop',
  'cta.github': 'View on GitHub',

  'demo.title': 'Launch review',
  'demo.aria': 'A whiteboard that writes by itself',
  'demo.replay': 'Replay',
  'demo.clear': 'Clear',
  'demo.placeholder': 'Say something… (enter)',
  'demo.speaker': 'Change speaker',
  'demo.you': 'You',
  'demo.empty': 'The board is empty. Say something.',
  'demo.full': 'Board full. Wiped, carrying on.',
  'demo.try': '↑ This one is real: type a line, the board writes it with the same pen',
  'demo.listening': 'Listening…',

  'how.eyebrow': 'How it works',
  'how.title': 'One sentence,\none edit.',
  'how.s1.t': 'Listen',
  'how.s1.p':
    'The desktop shell captures the mic. Silero cuts a sentence after a ~0.45 s pause, and SenseVoice transcribes Chinese, English, Japanese, Korean and Cantonese with punctuation.',
  'how.s2.t': 'Think',
  'how.s2.p':
    'The small model never draws. It only writes a few lines of graph edits, under a grammar built from the current board, so it can only pick ids that exist.',
  'how.s3.t': 'Place',
  'how.s3.p': 'Layout is plain deterministic code. Old content stays put, new content finds free space, and the board does not jump around mid-meeting.',
  'how.s4.t': 'Write',
  'how.s4.p':
    'Chinese characters are written stroke by stroke, in stroke order. A round of new content takes 2.4 s at most; if it cannot finish, the pen speeds up, so the board never falls behind.',
  'how.p1.tag': 'mic → Silero VAD → SenseVoice',
  'how.p1.q': '"Free tier and a team plan — the team plan is per seat."',
  'how.p2.tag': 'local small model · grammar-constrained decoding',
  'how.p2.foot': 'Only these lines. Ids must already be on the board.',
  'how.p3.tag': 'deterministic layout',
  'how.p3.foot': 'solid: stays put   dashed: new, finds free space',
  'how.p4.tag': 'perfect-freehand · stroke by stroke',
  'how.code': 'T  "Pricing"\nL  n1 "Free tier"\nL  n1 "Team plan: per seat"\nM  n3 star\nE  n5 -> n6 : "feeds"',

  'hand.eyebrow': 'Handwriting',
  'hand.title': 'Not a handwriting\nfont. Actual writing.',
  'hand.p':
    'Chinese characters come from stroke-ordered skeletons, Latin letters from a Hershey single-line font, and perfect-freehand adds marker pressure and tapering. Drag the slider: the same sentence, from neat to wild. Past halfway, Chinese picks up connected strokes and lowercase Latin turns cursive.',
  'hand.messy': 'Messiness',
  'hand.neat': 'neat',
  'hand.wild': 'wild',
  'hand.ph': 'Write something…',

  'priv.eyebrow': 'Privacy',
  'priv.title': 'Your voice never\nleaves this machine.',
  'priv.p': 'Transcription, the model, layout and writing all happen on your machine. No account, no cloud, and no connection needed to hold a meeting.',
  'priv.machine': 'your machine',
  'priv.mic': 'Mic',
  'priv.asr': 'Speech-to-text',
  'priv.llm': 'Local model',
  'priv.board': 'Board',
  'priv.cloud': 'cloud',
  'priv.s1.u': 'bytes up',
  'priv.s1.d': 'audio and text stay on the machine',
  'priv.s2.d': 'per sentence to board (Qwen3.5-4B, p50 382 ms on a laptop RTX 3060)',
  'priv.s3.d': 'light model; runs on integrated graphics or CPU',
  'priv.s4.d': 'open source, audit it yourself',
  'priv.fine':
    'The first model download needs a connection. For a bigger model you can plug in your own remote endpoint. It is off by default, and falls back to local when a request fails.',

  'feat.eyebrow': 'And also',
  'feat.title': 'Details made for\nreal meetings.',
  'feat.a.t': 'Whiteboard, blackboard, or an editable pencil draft',
  'feat.a.p':
    'Handwriting mode looks like someone with a marker (chalk on the dark theme). Pencil mode is Excalidraw’s hand-drawn style: drag, edit and add to it directly.',
  'feat.b.t': 'Topics and flows on one board',
  'feat.b.p':
    'Topic boards have nested items, open questions, formulas, strike-through, circles and stars; flow diagrams have links and groups. The two coexist and link to each other. A rejected idea gets crossed out, not erased, like a real board.',
  'feat.c.t': 'Nothing jumps around',
  'feat.c.p': 'What is written stays put and new content lands next to the nodes it relates to. After a long meeting, one click on “tidy up” re-lays the whole board.',
  'feat.d.t': 'Take it with you',
  'feat.d.p': 'Topics become headings with numbered items (strike-through, circles and stars kept); flows become Mermaid, with the transcript attached.',
  'feat.e.t': 'Local models, out of the box',
  'feat.e.p':
    'Ships with llama.cpp (Vulkan: NVIDIA, AMD, Intel integrated and Snapdragon Adreno all work; no GPU falls back to CPU). First launch recommends a tier for your GPU, resumes downloads and verifies sha256.',
  'feat.f.t': 'Mix languages freely',
  'feat.f.p': 'SenseVoice handles Chinese, English, Japanese, Korean and Cantonese, with punctuation and number normalising. A 5.6 s sentence takes two or three hundred milliseconds.',
  'feat.export': '## Pricing\n1. Free tier\n2. Team plan: per seat\n3. ~~Annual billing~~\n\n```mermaid\nflowchart LR\n  Mic --> ASR --> LocalLLM --> Board\n```',

  'road.eyebrow': 'Roadmap',
  'road.title': 'What works today,\nwhat is next.',
  'road.now': 'now',
  'road.next': 'next',
  'road.now.items':
    'Text → graph edits → hand-drawn board|Topic boards and flow diagrams, together|Handwriting: whiteboard / blackboard, adjustable messiness|Voice input from the mic, with live captions|Model download on first launch, GPU-aware|Remote endpoint (OpenAI-compatible) with local fallback|Incremental layout, old content never jumps|Export Markdown / PNG / .excalidraw',
  'road.next.items':
    'System audio: other people’s voices in online meetings|Telling speakers apart|macOS build|Small icons in handwriting mode|A held-out test set, then LoRA fine-tuning for 2B–4B models',

  'final.title': 'Hand the\nmeeting to the board.',
  'final.p': 'Desktop app, open source (MIT). Linux and Windows for now.',
  'final.soon': 'in progress',
  'final.gh': 'github.com/HsiangNianian/boardcast ↗',
  'foot.credit': 'Hanzi strokes from hanzi-writer-data (Arphic Public License) · Hershey fonts from hersheytext (MIT)',
}

const dicts = { zh, en }

let lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'zh'
const listeners: (() => void)[] = []

export const getLang = () => lang
export const t = (key: string) => dicts[lang][key] ?? dicts.zh[key] ?? key
export const onLang = (fn: () => void) => listeners.push(fn)

export function setLang(next: Lang) {
  lang = next
  document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN'
  try {
    localStorage.setItem('bc-lang', next)
  } catch {
    /* 隐私模式 */
  }
  applyText()
  for (const fn of listeners) fn()
}

export function applyText(root: ParentNode = document) {
  for (const e of root.querySelectorAll<HTMLElement>('[data-i18n]')) e.textContent = t(e.dataset.i18n!)
  for (const e of root.querySelectorAll<HTMLInputElement>('[data-i18n-ph]')) e.placeholder = t(e.dataset.i18nPh!)
  for (const e of root.querySelectorAll<HTMLElement>('[data-i18n-aria]')) e.setAttribute('aria-label', t(e.dataset.i18nAria!))
  document.title = lang === 'en' ? 'boardcast — Talk, and the board draws itself' : 'boardcast — 说话，板书自己长出来'
}
