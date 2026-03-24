;(async function () {

  const VOCAB_TEST_ID = '8c855dc9-8b94-44f1-9731-c2c86e632213'
  const VALID_STATUSES = new Set(['mastered', 'in-progress'])
  
  // Global error handler for any uncaught errors
  window.onerror = (msg, url, line, col, err) => {
    console.error('🚨 GLOBAL ERROR:', msg, 'at', url, line, col)
    showError(`Unexpected error: ${msg}`)
    return true
  }

  /* ── Wait for DOM ────────────────────────────── */
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r))
  }

  /* ── Validate config ─────────────────────────── */
  if (!window.SUPABASE_URL || !window.SUPABASE_KEY) {
    showError('Supabase config missing. Make sure supabase.js loads before this script.')
    return
  }

  /* ── Supabase client ─────────────────────────── */
  const sb = window.__openprepSupabaseClient || (() => {
    const c = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY)
    window.__openprepSupabaseClient = c
    return c
  })()

  /* ── Auth guard ──────────────────────────────── */
  const { data: { session }, error: authError } = await sb.auth.getSession()
  if (authError || !session) {
    window.location.href = '/login'
    return
  }
  const userId = session.user.id
  const localProgressKey = `openprep:vocab-progress:${VOCAB_TEST_ID}:${userId}`

  /* ── State ───────────────────────────────────── */
  let allCards     = []
  let progress     = {}
  let deck         = []
  let deckIndex    = 0
  let isFlipped    = false
  let activeFilter = 'all'

  /* ── Fetch vocab cards ───────────────────────── */
  const { data: cards, error: cardsError } = await sb
    .from('Vocab_IBA')
    .select('id, front, back')
    .eq('test_id', VOCAB_TEST_ID)
    .order('id', { ascending: true })

  if (cardsError || !cards?.length) {
    const msg = cardsError?.message || 'No vocabulary cards found in Vocab_IBA table'
    showError(msg)
    return
  }

  allCards = cards
  const validCardIds = new Set(allCards.map(c => String(c.id)))

  /* ── Fetch saved progress ────────────────────── */
  let serverProgressAvailable = false
  const { data: saved, error: savedError } = await sb
    .from('flashcard_progress')
    .select('flashcard_id, status')
    .eq('user_id', userId)
    .eq('test_id', VOCAB_TEST_ID)

  if (!savedError && Array.isArray(saved)) {
    saved.forEach((r) => {
      const cardId = String(r.flashcard_id)
      if (validCardIds.has(cardId) && VALID_STATUSES.has(r.status)) {
        progress[cardId] = r.status
      }
    })
    serverProgressAvailable = true
  } else if (savedError) {
    console.warn('flashcard_progress unavailable, using local progress:', savedError.message)
  }

  // Local fallback keeps state persistence even when DB progress table is unavailable.
  const localProgress = readLocalProgress(localProgressKey)
  Object.entries(localProgress).forEach(([cardId, status]) => {
    if (!progress[cardId] && validCardIds.has(cardId) && VALID_STATUSES.has(status)) {
      progress[cardId] = status
    }
  })

  // If server is available and has no rows yet, push local progress up once.
  if (serverProgressAvailable && Object.keys(progress).length > 0) {
    await syncAllProgressToServer(progress)
  }

  /* ── Boot UI ─────────────────────────────────── */
  try {
    // Validate DOM elements exist
    const mainEl = document.getElementById('mainContent')
    const loadingEl = document.getElementById('loadingState')
    const errorEl = document.getElementById('errorState')
    const wordListEl = document.getElementById('wordList')

    if (!mainEl || !loadingEl || !errorEl || !wordListEl) {
      throw new Error('Missing critical DOM elements')
    }

    show('main')
    buildWordList()
    updateStats()
    setFilter('all')
  } catch (bootErr) {
    console.error('❌ BOOT ERROR:', bootErr.message, bootErr.stack)
    showError('Failed to render UI: ' + bootErr.message)
  }

  /* ── Filter tabs ─────────────────────────────── */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter))
  })

  /* ── setFilter ───────────────────────────────── */
  function setFilter(filter) {
    activeFilter = filter

    document.querySelectorAll('.filter-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.filter === filter)
    )

    const labels = {
      all:          'all cards',
      mastered:     'mastered cards',
      'in-progress':'in progress cards',
      new:          'not started cards'
    }
    document.getElementById('deckLabel').textContent = labels[filter] || 'all cards'

    if (filter === 'all')          deck = [...allCards]
    else if (filter === 'mastered')     deck = allCards.filter(c => progress[c.id] === 'mastered')
    else if (filter === 'in-progress')  deck = allCards.filter(c => progress[c.id] === 'in-progress')
    else if (filter === 'new')          deck = allCards.filter(c => !progress[c.id])

    deckIndex = 0
    resetFlip()

    const isEmpty = deck.length === 0
    document.getElementById('doneState').style.display = isEmpty ? ''     : 'none'
    document.getElementById('cardArea').style.display  = isEmpty ? 'none' : ''
    if (!isEmpty) renderCard()
  }

  /* ── renderCard ──────────────────────────────── */
  function renderCard() {
    if (!deck.length) return
    const card   = deck[deckIndex]
    const status = progress[card.id] || 'new'

    document.getElementById('cardFront').textContent = card.front
    document.getElementById('cardBack').textContent  = card.back
    document.getElementById('navPos').textContent    = `${deckIndex + 1} / ${deck.length}`
    document.getElementById('prevBtn').disabled      = deckIndex === 0
    document.getElementById('nextBtn').disabled      = deckIndex === deck.length - 1

    const badge    = document.getElementById('cardBadge')
    const badgeMap = {
      mastered:      ['badge-mastered',     'Mastered'],
      'in-progress': ['badge-in-progress',  'In Progress'],
      new:           ['badge-new',          'New']
    }
    const [cls, txt] = badgeMap[status] || badgeMap.new
    badge.className  = `card-status-badge ${cls}`
    badge.textContent = txt

    document.querySelectorAll('.word-row').forEach(r =>
      r.classList.toggle('active', r.dataset.id === card.id)
    )

    resetFlip()
  }

  /* ── flip ────────────────────────────────────── */
  function flipCard() {
    isFlipped = !isFlipped
    document.getElementById('card3d').classList.toggle('flipped', isFlipped)
    document.getElementById('cardActions').classList.toggle('visible', isFlipped)
  }

  function resetFlip() {
    isFlipped = false
    document.getElementById('card3d').classList.remove('flipped')
    document.getElementById('cardActions').classList.remove('visible')
  }

  /* ── nav ─────────────────────────────────────── */
  function prevCard() {
    if (deckIndex > 0) { deckIndex--; renderCard() }
  }

  function nextCard() {
    if (deckIndex < deck.length - 1) { deckIndex++; renderCard() }
  }

  /* ── markCard ────────────────────────────────── */
  async function markCard(status) {
    const card = deck[deckIndex]
    if (!card) return

    const cardKey = String(card.id)
    progress[cardKey] = status
    writeLocalProgress(localProgressKey, progress)

    updateStats()
    buildWordList()
    renderCard()

    // Auto advance after short delay
    setTimeout(() => {
      if (deckIndex < deck.length - 1) nextCard()
    }, 300)

    // Save to Supabase when progress table is available.
    const { error: saveError } = await sb.from('flashcard_progress').upsert(
      {
        user_id: userId,
        flashcard_id: card.id,
        test_id: VOCAB_TEST_ID,
        status
      },
      { onConflict: 'user_id,flashcard_id,test_id' }
    )

    if (saveError) {
      console.warn('Could not sync progress to DB, kept locally:', saveError.message)
    }
  }

  /* ── updateStats ─────────────────────────────── */
  function updateStats() {
    const mastered   = allCards.filter(c => progress[c.id] === 'mastered').length
    const inProgress = allCards.filter(c => progress[c.id] === 'in-progress').length
    const newCards   = allCards.filter(c => !progress[c.id]).length
    const pct        = allCards.length > 0 ? Math.round((mastered / allCards.length) * 100) : 0

    document.getElementById('masteredCount').textContent   = mastered
    document.getElementById('inProgressCount').textContent = inProgress
    document.getElementById('newCount').textContent        = newCards
    document.getElementById('masteryPct').textContent      = pct + '%'

    setTimeout(() => {
      document.getElementById('masteryBar').style.width = pct + '%'
    }, 100)
  }

  /* ── buildWordList ───────────────────────────── */
  function buildWordList() {
    const list = document.getElementById('wordList')
    list.innerHTML = ''

    allCards.forEach(card => {
      const status  = progress[card.id] || 'new'
      const dotCls  = status === 'mastered'    ? 'dot-mastered'
                    : status === 'in-progress' ? 'dot-in-progress'
                    : 'dot-new'

      const badgeHtml = status === 'mastered'
        ? '<span class="card-status-badge badge-mastered" style="font-size:10px;padding:2px 8px;position:static;">Mastered</span>'
        : status === 'in-progress'
          ? '<span class="card-status-badge badge-in-progress" style="font-size:10px;padding:2px 8px;position:static;">In Progress</span>'
          : ''

      const row         = document.createElement('div')
      row.className     = 'word-row'
      row.dataset.id    = card.id
      row.innerHTML     = `
        <div class="word-dot ${dotCls}"></div>
        <div class="word-front">${card.front}</div>
        <div class="word-back">${card.back}</div>
        <div class="word-badge">${badgeHtml}</div>
      `

      row.addEventListener('click', () => {
        const idx = deck.findIndex(c => c.id === card.id)
        if (idx >= 0) {
          deckIndex = idx
          renderCard()
        } else {
          setFilter('all')
          const newIdx = deck.findIndex(c => c.id === card.id)
          if (newIdx >= 0) { deckIndex = newIdx; renderCard() }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })

      list.appendChild(row)
    })
  }

  /* ── show/hide states ────────────────────────── */
  function show(state) {
    document.getElementById('loadingState').style.display = state === 'loading' ? 'flex' : 'none'
    document.getElementById('errorState').style.display   = state === 'error'   ? 'flex' : 'none'
    document.getElementById('mainContent').style.display  = state === 'main'    ? 'block' : 'none'
  }

  function showError(msg) {
    show('error')
    const el = document.getElementById('errorMsg')
    if (el) el.textContent = msg
    console.error('Flashcard error:', msg)
  }

  function readLocalProgress(key) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return {}
      return parsed
    } catch {
      return {}
    }
  }

  function writeLocalProgress(key, progressMap) {
    try {
      localStorage.setItem(key, JSON.stringify(progressMap))
    } catch {
      // Ignore storage write errors to avoid blocking the flow.
    }
  }

  async function syncAllProgressToServer(progressMap) {
    const entries = Object.entries(progressMap)
    if (!entries.length) return

    const rows = entries
      .filter(([cardId, status]) => VALID_STATUSES.has(status))
      .map(([cardId, status]) => ({
        user_id: userId,
        flashcard_id: Number(cardId),
        test_id: VOCAB_TEST_ID,
        status
      }))

    if (!rows.length) return

    const { error } = await sb
      .from('flashcard_progress')
      .upsert(rows, { onConflict: 'user_id,flashcard_id,test_id' })

    if (error) {
      console.warn('Bulk sync to DB failed, local progress retained:', error.message)
    }
  }

  /* ── expose to HTML onclick ──────────────────── */
  window.flipCard  = flipCard
  window.prevCard  = prevCard
  window.nextCard  = nextCard
  window.markCard  = markCard
  window.setFilter = setFilter

})()