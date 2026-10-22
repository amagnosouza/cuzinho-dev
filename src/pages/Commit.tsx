import { useState } from 'react'
import { translations, useContent, useT } from '../i18n'
import { useTitle } from '../router'
import { pick, postOnX } from '../share'
import { useCopy } from '../toast'
import PageHead from '../components/PageHead'

const T = translations(
  {
    title: 'Mensagem de Commit',
    aside: (n: number) => `${n} mensagens`,
    head: 'Mensagem de commit',
    mute: 'pra quem não sabe o que mudou.',
    sub: 'Mas precisa commitar antes das 18h.',
    suggested: 'Mensagem sugerida',
    friday: 'modo sexta',
    normal: 'modo normal',
    fridayCheck: 'Modo sexta (pula os hooks e força o push na main)',
    another: 'Outra mensagem',
    copy: 'Copiar comando',
    postOnX: 'Postar no X',
    copiedFriday: 'Copiado. Que Deus te acompanhe.',
    copied: 'Comando copiado.',
    postText: (msg: string) => `Meu commit de hoje: ${msg}`,
  },
  {
    title: 'Commit Message',
    aside: (n: number) => `${n} messages`,
    head: 'Commit messages',
    mute: 'for when you don’t know what changed.',
    sub: 'But you still need to commit before 6 PM.',
    suggested: 'Suggested message',
    friday: 'Friday mode',
    normal: 'normal mode',
    fridayCheck: 'Friday mode (skips the hooks and force-pushes to main)',
    another: 'Another message',
    copy: 'Copy command',
    postOnX: 'Post on X',
    copiedFriday: 'Copied. Godspeed.',
    copied: 'Command copied.',
    postText: (msg: string) => `Today’s commit: ${msg}`,
  },
)

export default function Commit() {
  const t = useT(T)
  const { COMMITS } = useContent()
  useTitle(t.title)
  const copy = useCopy()
  const [msg, setMsg] = useState(() => pick(COMMITS))
  const [friday, setFriday] = useState(false)

  // Escaped so messages like Revert "..." still paste as a valid shell command
  const quoted = msg.replace(/"/g, '\\"')
  const cmd = friday
    ? `git add -A && git commit --no-verify -m "${quoted}" && git push --force origin main`
    : `git commit -m "${quoted}"`

  return (
    <section><div className="wrap">
      <PageHead
        n="05" label="Commit" aside={t.aside(COMMITS.length)}
        title={t.head} mute={t.mute}
        sub={t.sub}
      />

      <div className="gen">
        <div className="gen-top"><span className="label"><span className="num">●</span> {t.suggested}</span><span className="label">{friday ? t.friday : t.normal}</span></div>
        <div className="gen-body">
          <p className="quote" aria-live="polite">{msg}</p>
          <pre className="term"><span className="p" aria-hidden="true">$ </span>{cmd}</pre>
          <label className="check">
            <input type="checkbox" checked={friday} onChange={e => setFriday(e.target.checked)} />
            {t.fridayCheck}
          </label>
          <div className="actions">
            <button className="btn" type="button" onClick={() => setMsg(m => pick(COMMITS, m))}>{t.another}</button>
            <button className="btn ghost" type="button" onClick={() => copy(cmd, friday ? t.copiedFriday : t.copied)}>{t.copy}</button>
            <button className="btn ghost" type="button" onClick={() => postOnX(t.postText(msg), '/commit')}>{t.postOnX}</button>
          </div>
        </div>
      </div>
    </div></section>
  )
}
