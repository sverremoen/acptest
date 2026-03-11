import { useEffect, useState } from 'react'
import './App.css'

type Card = {
  id: number
  emoji: string
  matched: boolean
}

const EMOJIS = ['🐶', '🍕', '🚀', '🎸', '🌈', '🦄']

function shuffle<T>(items: T[]) {
  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function createDeck(): Card[] {
  return shuffle(
    EMOJIS.flatMap((emoji, index) => [
      { id: index * 2, emoji, matched: false },
      { id: index * 2 + 1, emoji, matched: false },
    ]),
  )
}

function App() {
  const [cards, setCards] = useState<Card[]>(() => createDeck())
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isResolving, setIsResolving] = useState(false)

  const hasWon = cards.length > 0 && cards.every((card) => card.matched)

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
        setCards((currentCards) =>
          currentCards.map((card) =>
            flippedIds.includes(card.id) ? { ...card, matched: true } : card,
          ),
        )
      }

      setFlippedIds([])
      setIsResolving(false)
    }, isMatch ? 350 : 850)

    return () => window.clearTimeout(timeoutId)
  }, [cards, flippedIds])

  function resetGame() {
    setCards(createDeck())
    setFlippedIds([])
    setMoves(0)
    setIsResolving(false)
  }

  function handleCardClick(card: Card) {
    const isFlipped = flippedIds.includes(card.id)

    if (card.matched || isFlipped || isResolving || flippedIds.length === 2) {
      return
    }

    const nextFlippedIds = [...flippedIds, card.id]
    setFlippedIds(nextFlippedIds)

    if (nextFlippedIds.length === 2) {
      setMoves((currentMoves) => currentMoves + 1)
      setIsResolving(true)
    }
  }

  return (
    <main className="app-shell">
      <section className="game-panel">
        <div className="game-copy">
          <p className="eyebrow">Emoji Memory</p>
          <h1>Finn alle parene</h1>
          <p className="description">
            Snu to kort om gangen. Treffer du et par blir de stående, ellers snus de
            tilbake.
          </p>
        </div>

        <div className="status-bar">
          <div className="status-card">
            <span>Trekk</span>
            <strong>{moves}</strong>
          </div>
          <div className="status-card">
            <span>Status</span>
            <strong>{hasWon ? 'Du vant! 🎉' : 'På jakt etter par'}</strong>
          </div>
        </div>

        <div className="grid" aria-label="Emoji Memory spillbrett">
          {cards.map((card) => {
            const isVisible = card.matched || flippedIds.includes(card.id)

            return (
              <button
                key={card.id}
                type="button"
                className={`memory-card ${isVisible ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''}`}
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
          <button type="button" className="reset-button" onClick={resetGame}>
            Spill igjen
          </button>
          {hasWon ? <p className="win-text">Alle 6 par funnet på {moves} trekk.</p> : null}
        </div>
      </section>
    </main>
  )
}

export default App
