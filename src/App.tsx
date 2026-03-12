import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Card = {
  id: number
  emoji: string
  matched: boolean
}

type BoardPreset = {
  label: string
  rows: number
  columns: number
}

const EMOJIS = [
  '🐶',
  '🍕',
  '🚀',
  '🎸',
  '🌈',
  '🦄',
  '🐙',
  '🍩',
  '⚽',
  '🎯',
  '🌟',
  '🐼',
  '🧩',
  '🍉',
  '🚲',
  '🐢',
  '🎈',
  '🦊',
]

const PRESETS: BoardPreset[] = [
  { label: '12 kort (3 × 4)', rows: 3, columns: 4 },
  { label: '18 kort (3 × 6)', rows: 3, columns: 6 },
  { label: '24 kort (4 × 6)', rows: 4, columns: 6 },
  { label: '35 kort (5 × 7)', rows: 5, columns: 7 },
]

function shuffle<T>(items: T[]) {
  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function createDeck(totalCards: number): Card[] {
  const pairCount = Math.ceil(totalCards / 2)
  const selectedEmojis = EMOJIS.slice(0, pairCount)
  const duplicated = selectedEmojis.flatMap((emoji, index) => [
    { id: index * 2, emoji, matched: false },
    { id: index * 2 + 1, emoji, matched: false },
  ])

  return shuffle(duplicated.slice(0, totalCards))
}

function findPreset(rows: number, columns: number) {
  return PRESETS.find((preset) => preset.rows === rows && preset.columns === columns)
}

function App() {
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState(4)
  const [cards, setCards] = useState<Card[]>(() => createDeck(12))
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isResolving, setIsResolving] = useState(false)
  const [justMatchedIds, setJustMatchedIds] = useState<number[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const previousHasWonRef = useRef(false)

  const totalCards = rows * columns
  const matchedCards = cards.filter((card) => card.matched).length
  const hasWon = cards.length > 0 && matchedCards === cards.length
  const isGameActive = (moves > 0 || matchedCards > 0 || flippedIds.length > 0) && !hasWon
  const activePreset = findPreset(rows, columns)

  const boardSummary = useMemo(() => {
    const pairCount = Math.ceil(totalCards / 2)
    const duplicateCount = pairCount * 2 - totalCards

    if (duplicateCount > 0) {
      return `${totalCards} kort (${rows} × ${columns}) · ${pairCount} emoji-par, hvor ${duplicateCount} kort blir uten makker.`
    }

    return `${totalCards} kort (${rows} × ${columns}) · ${pairCount} emoji-par`
  }, [columns, rows, totalCards])

  const playTone = useCallback(
    (
      frequency: number,
      duration = 0.09,
      type: OscillatorType = 'sine',
      volume = 0.08,
      delay = 0,
    ) => {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) {
        return
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass()
      }

      const context = audioContextRef.current
      const startAt = context.currentTime + delay

      if (context.state === 'suspended') {
        void context.resume()
      }

      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, startAt)

      gainNode.gain.setValueAtTime(0.0001, startAt)
      gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.start(startAt)
      oscillator.stop(startAt + duration + 0.02)
    },
    [],
  )

  const playFlipSound = useCallback(() => {
    playTone(540, 0.07, 'triangle', 0.05)
  }, [playTone])

  const playMatchSound = useCallback(() => {
    playTone(620, 0.08, 'sine', 0.07)
    playTone(820, 0.12, 'sine', 0.065, 0.05)
  }, [playTone])

  const playWinSound = useCallback(() => {
    playTone(700, 0.1, 'triangle', 0.08)
    playTone(900, 0.11, 'triangle', 0.08, 0.07)
    playTone(1180, 0.2, 'sine', 0.09, 0.14)
  }, [playTone])

  useEffect(() => {
    if (flippedIds.length !== 2) {
      return
    }

    const [firstId, secondId] = flippedIds
    const firstCard = cards.find((card) => card.id === firstId)
    const secondCard = cards.find((card) => card.id === secondId)

    if (!firstCard || !secondCard) {
      return
    }

    const isMatch = firstCard.emoji === secondCard.emoji

    const timeoutId = window.setTimeout(() => {
      if (isMatch) {
        setJustMatchedIds([firstId, secondId])
        playMatchSound()

        setCards((currentCards) =>
          currentCards.map((card) =>
            flippedIds.includes(card.id) ? { ...card, matched: true } : card,
          ),
        )

        window.setTimeout(() => setJustMatchedIds([]), 360)
      }

      setFlippedIds([])
      setIsResolving(false)
    }, isMatch ? 320 : 800)

    return () => window.clearTimeout(timeoutId)
  }, [cards, flippedIds, playMatchSound])

  useEffect(() => {
    if (hasWon && !previousHasWonRef.current) {
      playWinSound()
    }

    previousHasWonRef.current = hasWon
  }, [hasWon, playWinSound])

  useEffect(() => {
    document.body.classList.toggle('no-page-scroll', isGameActive)

    return () => {
      document.body.classList.remove('no-page-scroll')
    }
  }, [isGameActive])

  function resetGame(nextRows = rows, nextColumns = columns) {
    setRows(nextRows)
    setColumns(nextColumns)
    setCards(createDeck(nextRows * nextColumns))
    setFlippedIds([])
    setMoves(0)
    setIsResolving(false)
    setJustMatchedIds([])
  }

  function handlePresetSelect(preset: BoardPreset) {
    resetGame(preset.rows, preset.columns)
  }

  function handleRowsChange(value: number) {
    if (Number.isNaN(value) || value < 2 || value > 6) {
      return
    }

    resetGame(value, columns)
  }

  function handleColumnsChange(value: number) {
    if (Number.isNaN(value) || value < 2 || value > 8) {
      return
    }

    resetGame(rows, value)
  }

  function handleCardClick(card: Card) {
    const isFlipped = flippedIds.includes(card.id)

    if (card.matched || isFlipped || isResolving || flippedIds.length === 2) {
      return
    }

    playFlipSound()

    const nextFlippedIds = [...flippedIds, card.id]
    setFlippedIds(nextFlippedIds)

    if (nextFlippedIds.length === 2) {
      setMoves((currentMoves) => currentMoves + 1)
      setIsResolving(true)
    }
  }

  return (
    <main className={`app-shell ${isGameActive ? 'is-in-game' : ''}`}>
      <section className={`game-panel ${hasWon ? 'is-celebrating' : ''}`}>
        <div className="game-copy">
          <p className="eyebrow">Emoji Memory</p>
          <h1>Finn alle parene</h1>
          <p className="description">
            Velg vanskelighetsgrad eller sett opp ditt eget brett. Snu to kort om
            gangen og prøv å huske hvor emoji-vennene skjuler seg.
          </p>
        </div>

        <div className="controls-panel">
          <div className="preset-group" aria-label="Ferdige brettstørrelser">
            {PRESETS.map((preset) => {
              const isActive = preset.rows === rows && preset.columns === columns

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={`preset-button ${isActive ? 'is-active' : ''}`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          <div className="custom-controls">
            <label className="field-control">
              <span>Rader</span>
              <select
                value={rows}
                onChange={(event) => handleRowsChange(Number(event.target.value))}
              >
                {[2, 3, 4, 5, 6].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-control">
              <span>Kolonner</span>
              <select
                value={columns}
                onChange={(event) => handleColumnsChange(Number(event.target.value))}
              >
                {[2, 3, 4, 5, 6, 7, 8].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <div className="board-chip">
              <span>{activePreset ? 'Preset' : 'Egendefinert'}</span>
              <strong>{boardSummary}</strong>
            </div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-card">
            <span>Trekk</span>
            <strong>{moves}</strong>
          </div>
          <div className="status-card">
            <span>Fremdrift</span>
            <strong>
              {matchedCards}/{cards.length} kort funnet
            </strong>
          </div>
          <div className="status-card status-card-wide">
            <span>Status</span>
            <strong>{hasWon ? 'Du vant! 🎉' : 'På jakt etter par'}</strong>
          </div>
        </div>

        <div
          className="grid"
          aria-label="Emoji Memory spillbrett"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {cards.map((card) => {
            const isVisible = card.matched || flippedIds.includes(card.id)
            const isJustMatched = justMatchedIds.includes(card.id)

            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card ${isVisible ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''} ${isJustMatched ? 'is-just-matched' : ''}`}
                onClick={() => handleCardClick(card)}
                aria-label={isVisible ? `Kort med ${card.emoji}` : 'Skjult kort'}
                aria-pressed={isVisible}
              >
                <span className="card-face card-front">{card.emoji}</span>
                <span className="card-face card-back">?</span>
              </button>
            )
          })}
        </div>

        <div className="footer-row">
          <button type="button" className="reset-button" onClick={() => resetGame()}>
            Spill igjen
          </button>
          {hasWon ? (
            <p className="win-text">
              Du klarte {cards.length} kort på {moves} trekk!{activePreset ? ' Klar for neste nivå?' : ''}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default App
