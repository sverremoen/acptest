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
  '🐸',
  '🍓',
]

const MODES = [
  { name: 'Lynstart', rows: 3, columns: 4 },
  { name: 'Dobbel dose', rows: 3, columns: 6 },
  { name: 'Mesterbrett', rows: 4, columns: 6 },
  { name: 'Emoji-maraton', rows: 5, columns: 8 },
]

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function createDeck(totalCards) {
  const pairCount = totalCards / 2
  const selectedEmojis = EMOJIS.slice(0, pairCount)

  return shuffle(
    selectedEmojis.flatMap((emoji, index) => [
      { id: index * 2, emoji, matched: false },
      { id: index * 2 + 1, emoji, matched: false },
    ]),
  )
}

function getActiveMode(rows, columns) {
  return MODES.find((mode) => mode.rows === rows && mode.columns === columns)
}

const state = {
  rows: 3,
  columns: 4,
  cards: createDeck(12),
  flippedIds: [],
  moves: 0,
  isResolving: false,
}

const app = document.querySelector('#app')

function hasWon() {
  return state.cards.length > 0 && state.cards.every((card) => card.matched)
}

function matchedCount() {
  return state.cards.filter((card) => card.matched).length
}

function resetGame(nextRows = state.rows, nextColumns = state.columns) {
  state.rows = nextRows
  state.columns = nextColumns
  state.cards = createDeck(nextRows * nextColumns)
  state.flippedIds = []
  state.moves = 0
  state.isResolving = false
  render()
}

function handleModeClick(rows, columns) {
  resetGame(rows, columns)
}

function handleSizeChange(kind, value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return

  const nextRows = kind === 'rows' ? numeric : state.rows
  const nextColumns = kind === 'columns' ? numeric : state.columns

  if (nextRows < 2 || nextRows > 6 || nextColumns < 2 || nextColumns > 8) {
    return
  }

  const totalCards = nextRows * nextColumns
  if (totalCards % 2 !== 0) {
    return
  }

  resetGame(nextRows, nextColumns)
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
  const activeMode = getActiveMode(state.rows, state.columns)
  const totalCards = state.rows * state.columns
  const foundCards = matchedCount()

  app.innerHTML = `
    <main class="app-shell">
      <section class="game-panel">
        <div class="game-copy">
          <p class="eyebrow">Emoji Memory</p>
          <h1>Finn alle parene</h1>
          <p class="description">
            Velg en modus eller bygg ditt eget brett. Alt er fortsatt enkelt og raskt å forstå — bare større og vanskeligere når du vil.
          </p>
        </div>

        <div class="controls-panel">
          <div class="preset-group" aria-label="Spillmoduser">
            ${MODES.map((mode) => {
              const active = mode.rows === state.rows && mode.columns === state.columns
              return `
                <button
                  type="button"
                  class="preset-button ${active ? 'is-active' : ''}"
                  data-mode="${mode.rows}x${mode.columns}"
                >
                  <strong>${mode.name}</strong>
                  <span>${mode.rows} × ${mode.columns} · ${mode.rows * mode.columns} kort</span>
                </button>
              `
            }).join('')}
          </div>

          <div class="custom-controls">
            <label class="field-control">
              <span>Rader</span>
              <select data-size="rows">
                ${[2, 3, 4, 5, 6]
                  .map((value) => `<option value="${value}" ${value === state.rows ? 'selected' : ''}>${value}</option>`)
                  .join('')}
              </select>
            </label>

            <label class="field-control">
              <span>Kolonner</span>
              <select data-size="columns">
                ${[2, 3, 4, 5, 6, 7, 8]
                  .map((value) => `<option value="${value}" ${value === state.columns ? 'selected' : ''}>${value}</option>`)
                  .join('')}
              </select>
            </label>

            <div class="board-chip">
              <span>${activeMode ? 'Aktiv modus' : 'Egendefinert brett'}</span>
              <strong>${activeMode ? activeMode.name : 'Fri lek'} · ${state.rows} × ${state.columns} · ${totalCards} kort</strong>
            </div>
          </div>
        </div>

        <div class="status-bar">
          <div class="status-card">
            <span>Trekk</span>
            <strong>${state.moves}</strong>
          </div>
          <div class="status-card">
            <span>Fremdrift</span>
            <strong>${foundCards}/${totalCards} kort funnet</strong>
          </div>
          <div class="status-card status-card-wide">
            <span>Status</span>
            <strong>${won ? 'Du vant! 🎉' : 'På jakt etter par'}</strong>
          </div>
        </div>

        <div class="grid" aria-label="Emoji Memory spillbrett" style="grid-template-columns: repeat(${state.columns}, minmax(0, 1fr));">
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
          ${won ? `<p class="win-text">Du klarte ${totalCards} kort på ${state.moves} trekk.</p>` : ''}
        </div>
      </section>
    </main>
  `

  app.querySelectorAll('[data-card-id]').forEach((button) => {
    button.addEventListener('click', () => {
      handleCardClick(Number(button.getAttribute('data-card-id')))
    })
  })

  app.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const [rows, columns] = button.getAttribute('data-mode').split('x').map(Number)
      handleModeClick(rows, columns)
    })
  })

  app.querySelectorAll('[data-size]').forEach((select) => {
    select.addEventListener('change', (event) => {
      handleSizeChange(select.getAttribute('data-size'), event.target.value)
    })
  })

  app.querySelector('[data-reset-game]')?.addEventListener('click', () => resetGame())
}

render()
