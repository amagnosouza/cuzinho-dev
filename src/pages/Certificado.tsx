import { useEffect, useState, type FormEvent } from 'react'
import { useToast } from '../toast'
import { renderCertificate, type CertText } from '../certImage'
import { translations, useT } from '../i18n'
import { useTitle } from '../router'
import { siteUrl } from '../share'
import PageHead from '../components/PageHead'

function registry(text: string) {
  let hash = 0
  for (const c of text) hash = (hash * 31 + c.charCodeAt(0)) % 10000
  return 'MNC-' + String(hash).padStart(4, '0')
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const T = translations(
  {
    title: 'Certificado',
    aside: 'Emissão imediata',
    head: 'Certificado oficial.',
    mute: 'No cuzinho, mas entrega.',
    sub: 'Preencha e poste no X pra todo mundo ver quem manda no deploy de sexta.',
    nameLabel: 'Seu nome',
    whatLabel: 'O que você entregou',
    postOnX: 'Postar no X',
    downloadImage: 'Baixar imagem',
    defaultName: 'Dev Sênior de Sexta',
    defaultWhat: 'a migração do banco às 17:58',
    anonymous: 'Dev Anônimo',
    something: 'alguma coisa, no limite',
    issued: (date: Date) => `emitido em ${date.toLocaleDateString('pt-BR')} às 17:59`,
    reg: 'reg.',
    fileName: 'certificado-no-cuzinho.png',
    postText: (what: string) => `Peguei meu Certificado de Entrega No Cuzinho 🏆 Entreguei ${what}, com zero testes e cem por cento de fé. #NoCuzinho`,
    printing: 'Calma, o certificado tá sendo impresso. Tenta de novo.',
    downloadedPost: 'Imagem baixada. Anexa no post e manda.',
    downloaded: 'Certificado baixado.',
    cert: {
      institute: 'Instituto Brasileiro de Entregas No Limite',
      title: 'Certificado de Entrega No Cuzinho',
      certify: 'certificamos que',
      delivered: 'entregou',
      rest: 'com zero testes, zero documentação e cem por cento de fé, honrando os princípios da Metodologia No Cuzinho.',
      stamp: ['APROVADO', 'SEM REVIEW'],
    } satisfies CertText,
  },
  {
    title: 'Certificate',
    aside: 'Issued instantly',
    head: 'Official certificate.',
    mute: 'Cutting it close. Still shipped.',
    sub: 'Fill it in and post it on X so everyone knows who runs the Friday deploy.',
    nameLabel: 'Your name',
    whatLabel: 'What you shipped',
    postOnX: 'Post on X',
    downloadImage: 'Download image',
    defaultName: 'Friday Senior Dev',
    defaultWhat: 'the database migration at 5:58 PM',
    anonymous: 'Anonymous Dev',
    something: 'something, just in time',
    issued: (date: Date) => `issued on ${date.toLocaleDateString('en-US')} at 5:59 PM`,
    reg: 'reg.',
    fileName: 'no-cuzinho-certificate.png',
    postText: (what: string) => `Got my Certificate of Last-Second Delivery 🏆 Shipped ${what}, with zero tests and one hundred percent faith. #NoCuzinho`,
    printing: 'Hold on, the certificate is still printing. Try again.',
    downloadedPost: 'Image downloaded. Attach it to the post and send.',
    downloaded: 'Certificate downloaded.',
    cert: {
      institute: 'Brazilian Institute of Last-Second Deliveries',
      title: 'Certificate of Last-Second Delivery',
      certify: 'this certifies that',
      delivered: 'shipped',
      rest: 'with zero tests, zero documentation and one hundred percent faith, honoring the principles of the No Cuzinho Methodology.',
      stamp: ['APPROVED', 'NO REVIEW'],
    },
  },
)

export default function Certificado() {
  const t = useT(T)
  useTitle(t.title)
  const toast = useToast()
  const [nome, setNome] = useState(t.defaultName)
  const [feito, setFeito] = useState(t.defaultWhat)
  const [image, setImage] = useState<Blob | null>(null)

  const who = nome.trim() || t.anonymous
  const what = feito.trim() || t.something
  const data = t.issued(new Date())
  const reg = `${t.reg} ${registry(nome + feito)}`

  // Pre-render so the click handlers stay synchronous: share() and window.open() need the user gesture
  useEffect(() => {
    let cancelled = false
    setImage(null)
    const timer = setTimeout(() => {
      renderCertificate({ nome: who, feito: what, data, reg, text: t.cert })
        .then(b => { if (!cancelled) setImage(b) })
        .catch(() => {})
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [who, what, data, reg, t])

  const postText = t.postText(what)

  const postOnX = (e: FormEvent) => {
    e.preventDefault()
    if (!image) { toast(t.printing); return }

    const file = new File([image], t.fileName, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      navigator.share({ files: [file], text: `${postText} ${siteUrl()}` }).catch(() => {})
      return
    }

    const intent = new URL('https://x.com/intent/post')
    intent.searchParams.set('text', postText)
    intent.searchParams.set('url', siteUrl())
    window.open(intent, '_blank', 'noopener')
    download(image, t.fileName)
    toast(t.downloadedPost)
  }

  const onDownload = () => {
    if (!image) { toast(t.printing); return }
    download(image, t.fileName)
    toast(t.downloaded)
  }

  return (
    <section className="dark"><div className="wrap">
      <PageHead
        n="07" label={t.title} aside={t.aside}
        title={t.head} mute={t.mute}
        sub={t.sub}
      />
      <div className="cert-grid">
        <form className="form" onSubmit={postOnX}>
          <div>
            <label htmlFor="nome">{t.nameLabel}</label>
            <input id="nome" maxLength={40} value={nome} onChange={e => setNome(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="feito">{t.whatLabel}</label>
            <input id="feito" maxLength={60} value={feito} onChange={e => setFeito(e.target.value)} />
          </div>
          <div className="actions">
            <button className="btn" type="submit">{t.postOnX}</button>
            <button className="btn ghost" type="button" onClick={onDownload}>{t.downloadImage}</button>
          </div>
        </form>
        <div className="cert">
          <div className="stamp">{t.cert.stamp[0]}<br />{t.cert.stamp[1]}</div>
          <div className="k">{t.cert.institute}</div>
          <h3>{t.cert.title}</h3>
          <div className="k">{t.cert.certify}</div>
          <div className="who">{who}</div>
          <p className="body">{t.cert.delivered} <b>{what}</b>, {t.cert.rest}</p>
          <div className="foot"><span>{data}</span><span>{reg}</span></div>
        </div>
      </div>
    </div></section>
  )
}
