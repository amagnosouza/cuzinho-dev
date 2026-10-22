import { useEffect, useMemo, useRef, useState } from 'react'
import { BINGO } from '../data'
import { translations, useContent, useT } from '../i18n'
import { useTitle } from '../router'
import { postOnX } from '../share'
import { useToast } from '../toast'
import PageHead from '../components/PageHead'

const STORAGE_KEY = 'mnc-bingo'
const CENTER = 12
const FREE = -1

// Cells are positions in BINGO, so the same board reads in either language
type Board = { cells: number[]; marked: boolean[] }

function newBoard(): Board {
  const pool = BINGO.map((_, i) => i)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const cells = pool.slice(0, 24)
  cells.splice(CENTER, 0, FREE)
  return { cells, marked: cells.map((_, i) => i === CENTER) }
}

function loadBoard(): Board {
  try {
    const b = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as Board
    // Boards saved before the English version stored the phrases themselves, so they start over
    const valid = (c: unknown) => Number.isInteger(c) && (c as number) >= FREE && (c as number) < BINGO.length
    if (b.cells?.length === 25 && b.marked?.length === 25 && b.cells.every(valid)) return b
  } catch { /* first visit or storage blocked */ }
  return newBoard()
}

const LINES = [
  ...[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(c => r * 5 + c)),
  ...[0, 1, 2, 3, 4].map(c => [0, 1, 2, 3, 4].map(r => r * 5 + c)),
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
]

const T = translations(
  {
    title: 'Bingo da Daily',
    head: 'Bingo da daily.',
    mute: 'A reunião podia ser um e-mail.',
    sub: 'Abra antes da reunião e marque cada frase que alguém falar. Completou linha, coluna ou diagonal: liga o microfone e grita.',
    board: 'Cartela de bingo',
    won: 'BINGO! Grita no meio da daily.',
    postText: 'Fiz BINGO na daily de hoje 🎯 A reunião podia ser um e-mail.',
    postOnX: 'Postar bingo no X',
    reset: 'Nova cartela',
  },
  {
    title: 'Standup Bingo',
    head: 'Standup bingo.',
    mute: 'This meeting could have been an email.',
    sub: 'Open it before the meeting and mark each phrase as someone says it. Complete a row, column or diagonal? Unmute and yell.',
    board: 'Bingo board',
    won: 'BINGO! Yell it in the middle of standup.',
    postText: 'Got BINGO at today’s standup 🎯 This meeting could have been an email.',
    postOnX: 'Post bingo on X',
    reset: 'New board',
  },
)

export default function Bingo() {
  const t = useT(T)
  const { BINGO: phrases, BINGO_FREE } = useContent()
  useTitle(t.title)
  const toast = useToast()
  const [board, setBoard] = useState(loadBoard)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(board)) } catch { /* storage blocked */ }
  }, [board])

  const winning = useMemo(() => {
    const cells = new Set<number>()
    for (const line of LINES) if (line.every(i => board.marked[i])) line.forEach(i => cells.add(i))
    return cells
  }, [board])
  const won = winning.size > 0

  // Only celebrate the transition to a win, not boards that load already won
  const wasWon = useRef(won)
  useEffect(() => {
    if (won && !wasWon.current) toast(t.won)
    wasWon.current = won
  }, [won, toast, t])

  const toggle = (i: number) => {
    if (i === CENTER) return
    setBoard(b => ({ ...b, marked: b.marked.map((m, j) => (j === i ? !m : m)) }))
  }

  const reset = () => setBoard(newBoard())

  return (
    <section><div className="wrap">
      <PageHead
        n="06" label="Bingo" aside="5 × 5"
        title={t.head} mute={t.mute}
        sub={t.sub}
      />

      <div className="bingo" role="group" aria-label={t.board}>
        {board.cells.map((cell, i) => (
          <button
            key={i}
            type="button"
            className={`cell${i === CENTER ? ' free' : ''}${winning.has(i) ? ' win' : ''}`}
            aria-pressed={board.marked[i]}
            onClick={() => toggle(i)}
          >{cell === FREE ? BINGO_FREE : phrases[cell]}</button>
        ))}
      </div>

      <div className="actions" style={{ marginTop: 28 }}>
        {won && <button className="btn" type="button" onClick={() => postOnX(t.postText, '/bingo')}>{t.postOnX}</button>}
        <button className={won ? 'btn ghost' : 'btn'} type="button" onClick={reset}>{t.reset}</button>
      </div>
    </div></section>
  )
}
