const EMOJIS = ['🐶', '🍕', '🚀', '🎸', '🌈', '🦄']

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function createDeck() {
  return shuffle(
    EMOJIS.flatMap((emoji, index) => [
      { id: index * 2, emoji, matched: false },
      { id: index * 2 + 1, emoji, matched: false },
    ]),
  )
}

const state = {
  cards: createDeck(),
  flippedIds: [],
  moves: 0,
  isResolving: false,
}

const app = document.querySelector('#app')

function hasWon() {
  return state.cards.length > 0 && state.cards.every((card) => card.matched)
}

function resetGame() {
  state.cards = createDeck()
  state.flippedIds = []
  state.moves = 0
  state.isResolving = false
  render()
}

function handleCardClick(cardId) {
  const card = state.cards.find((item) => item.id === cardId)
  const isFlipped = state.flippedIds.includes(cardId)

  if (!card || card.matched || isFlipped || state.isResolving || state.flippedIds.length === 2) {
    return
  }

  state.flippedIds = [...state.flippedIds, cardId]
  render()

  if (state.flippedIds.length !== 2) {
    return
  }

  state.moves += 1
  state.isResolving = true
  const [firstId, secondId] = state.flippedIds
  const firstCard = state.cards.find((item) => item.id === firstId)
  const secondCard = state.cards.find((item) => item.id === secondId)
  const match = firstCard && secondCard && firstCard.emoji === secondCard.emoji

  window.setTimeout(() => {
    if (match) {
      state.cards = state.cards.map((item) =>
        state.flippedIds.includes(item.id) ? { ...item, matched: true } : item,
      )
    }

    state.flippedIds = []
    state.isResolving = false
    render()
  }, match ? 350 : 850)
}

function render() {
  const won = hasWon()

  app.innerHTML = `
    <main class="app-shell">
      <section class="game-panel">
        <div class="game-copy">
          <p class="eyebrow">Emoji Memory</p>
          <h1>Finn alle parene</h1>
          <p class="description">
            Snu to kort om gangen. Treffer du et par blir de stående, ellers snus de tilbake.
          </p>
        </div>

        <div class="status-bar">
          <div class="status-card">
            <span>Trekk</span>
            <strong>${state.moves}</strong>
          </div>
          <div class="status-card">
            <span>Status</span>
            <strong>${won ? 'Du vant! 🎉' : 'På jakt etter par'}</strong>
          </div>
        </div>

        <div class="grid" aria-label="Emoji Memory spillbrett">
          ${state.cards
            .map((card) => {
              const visible = card.matched || state.flippedIds.includes(card.id)
              return `
                <button
                  type="button"
                  class="memory-card ${visible ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''}"
                  data-card-id="${card.id}"
                  aria-label="${visible ? `Kort med ${card.emoji}` : 'Skjult kort'}"
                  aria-pressed="${visible}"
                >
                  <span class="card-face card-front">${card.emoji}</span>
                  <span class="card-face card-back">?</span>
                </button>
              `
            })
            .join('')}
        </div>

        <div class="footer-row">
          <button type="button" class="reset-button" data-reset-game="true">Spill igjen</button>
          ${won ? `<p class="win-text">Alle 6 par funnet på ${state.moves} trekk.</p>` : ''}
        </div>
      </section>
    </main>
  `

  app.querySelectorAll('[data-card-id]').forEach((button) => {
    button.addEventListener('click', () => {
      handleCardClick(Number(button.getAttribute('data-card-id')))
    })
  })

  app.querySelector('[data-reset-game]')?.addEventListener('click', resetGame)
}

render()
