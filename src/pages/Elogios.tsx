import { useState } from 'react'
import type { ComplimentTag } from '../data'
import { translations, useContent, useT } from '../i18n'
import { useTitle } from '../router'
import { pick, postOnX } from '../share'
import { useCopy } from '../toast'
import PageHead from '../components/PageHead'

const T = translations(
  {
    title: 'Elogios Corporativos',
    label: 'Elogios',
    aside: (n: number) => `${n} elogios`,
    head: 'Elogios corporativos,',
    mute: 'com a sinceridade de sempre.',
    sub: 'Pra quando o RH pede feedback positivo. Comece sorrindo e termine antes que a pessoa entenda.',
    filter: 'Filtrar elogios',
    all: 'Todos',
    inFilter: (n: number) => `${n} no filtro`,
    another: 'Outro elogio',
    copy: 'Copiar',
    postOnX: 'Postar no X',
    copied: 'Copiado. Entregue com um sorriso sincero.',
    postText: (text: string) => `Elogio do dia pro colega: "${text}"`,
  },
  {
    title: 'Corporate Compliments',
    label: 'Compliments',
    aside: (n: number) => `${n} compliments`,
    head: 'Corporate compliments,',
    mute: 'with our usual sincerity.',
    sub: 'For when HR asks for positive feedback. Start with a smile and finish before they get it.',
    filter: 'Filter compliments',
    all: 'All',
    inFilter: (n: number) => `${n} in filter`,
    another: 'Another compliment',
    copy: 'Copy',
    postOnX: 'Post on X',
    copied: 'Copied. Deliver it with a sincere smile.',
    postText: (text: string) => `Today’s compliment for a teammate: “${text}”`,
  },
)

export default function Elogios() {
  const t = useT(T)
  const { COMPLIMENTS, COMPLIMENT_TAGS } = useContent()
  useTitle(t.title)
  const copy = useCopy()
  const [tag, setTag] = useState<ComplimentTag | null>(null)
  const pool = COMPLIMENTS.filter(([, , t]) => !tag || t === tag)
  const [compliment, setCompliment] = useState(() => pick(COMPLIMENTS))

  const next = (t = tag) => {
    const list = COMPLIMENTS.filter(([, , x]) => !t || x === t)
    setCompliment(prev => pick(list, prev))
  }

  const choose = (t: ComplimentTag | null) => {
    setTag(t)
    next(t)
  }

  const [setup, punch, complimentTag] = compliment
  const text = `${setup} ${punch}`
  const label = COMPLIMENT_TAGS.find(t => t.id === complimentTag)?.label

  return (
    <section><div className="wrap">
      <PageHead
        n="04" label={t.label} aside={t.aside(COMPLIMENTS.length)}
        title={t.head} mute={t.mute}
        sub={t.sub}
      />

      <div className="chips" role="group" aria-label={t.filter}>
        <button className="chip" type="button" aria-pressed={tag === null} onClick={() => choose(null)}>{t.all}</button>
        {COMPLIMENT_TAGS.map(x => (
          <button key={x.id} className="chip" type="button" aria-pressed={tag === x.id} onClick={() => choose(x.id)}>{x.label}</button>
        ))}
      </div>

      <div className="gen">
        <div className="gen-top"><span className="label"><span className="num">●</span> {label}</span><span className="label">{t.inFilter(pool.length)}</span></div>
        <div className="gen-body">
          <p className="quote" aria-live="polite">
            “{setup} <span key={setup} className="punch">{punch}</span>”
          </p>
          <div className="actions">
            <button className="btn" type="button" onClick={() => next()}>{t.another}</button>
            <button className="btn ghost" type="button" onClick={() => copy(text, t.copied)}>{t.copy}</button>
            <button className="btn ghost" type="button" onClick={() => postOnX(t.postText(text), '/elogios')}>{t.postOnX}</button>
          </div>
        </div>
      </div>
    </div></section>
  )
}
