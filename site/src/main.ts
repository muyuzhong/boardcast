import './style.css'
import { initDemo } from './demo.ts'
import { applyText, getLang, setLang } from './i18n.ts'
import { initInk } from './inkText.ts'
import { initSections } from './sections.ts'

// 主题：白板 / 黑板。同时是产品本身的一个功能，所以首屏的窗口里也放了一个开关。
function initTheme() {
  const root = document.documentElement
  const set = (v: 'paper' | 'chalk') => {
    root.dataset.theme = v
    try {
      localStorage.setItem('bc-theme', v)
    } catch {
      /* 隐私模式 */
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', v === 'chalk' ? '#151a17' : '#efeae0')
    for (const b of document.querySelectorAll<HTMLElement>('[data-set-theme]')) b.setAttribute('aria-pressed', String(b.dataset.setTheme === v))
  }
  document.getElementById('theme')!.addEventListener('click', () => set(root.dataset.theme === 'chalk' ? 'paper' : 'chalk'))
  for (const b of document.querySelectorAll<HTMLElement>('[data-set-theme]')) b.addEventListener('click', () => set(b.dataset.setTheme as 'paper' | 'chalk'))
  set(root.dataset.theme === 'chalk' ? 'chalk' : 'paper')
}

function initChrome() {
  const nav = document.getElementById('nav')!
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 12)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  document.getElementById('lang')!.addEventListener('click', () => setLang(getLang() === 'zh' ? 'en' : 'zh'))

  // 滚到才出现
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es)
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
    },
    { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
  )
  for (const e of document.querySelectorAll('.card, .road > div, .stats > div, .how-steps li, .sec-lede, .diagram, .play, .dl, .gh')) {
    e.classList.add('rv')
    io.observe(e)
  }
}

applyText()
initTheme()
initChrome()
initInk()
initDemo()
initSections()
