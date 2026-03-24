;(async function () {

  const VOCAB_TEST_ID = '8c855dc9-8b94-44f1-9731-c2c86e632213'

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

  /* ── Get auth headers ────────────────────────── */
  async function getHeaders() {
    const { data: { session } } = await sb.auth.getSession()
    const token = session ? session.access_token : window.SUPABASE_KEY
    return {
      'apikey':        window.SUPABASE_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json'
    }
  }

  /* ── State ───────────────────────────────────── */
  let allCards     = []
  let progress     = {}
  let deck         = []
  let deckIndex    = 0
  let isFlipped    = false
  let activeFilter = 'all'

  /* ── Fetch vocab cards via REST (avoids RLS header issues) ── */
  try {
    const res = await fetch(
      `${window.SUPABASE_URL}/rest/v1/Vocab_IBA?test_id=eq.${VOCAB_TEST_ID}&select=id,front,back&order=id.asc`,
      { headers: await getHeaders() }
    )

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      showError(`Failed to load cards: ${errBody.message || res.status + ' ' + res.statusText}`)
      return
    }

    allCards = await res.json()

    if (!allCards.length) {
      showError(`No vocabulary cards found. Check that test_id "${VOCAB_TEST_ID}" exists in Vocab_IBA table.`)
      return
    }

  } catch (err) {
    showError(`Network error: ${err.message}`)
    return
  }

  /* ── Fetch saved progress ────────────────────── */
  try {
    const res = await fetch(
      `${window.SUPABASE_URL}/rest/v1/flashcard_progress?user_id=eq.${userId}&test_id=eq.${VOCAB_TEST_ID}&select=flashcard_id,status`,
      { headers: await getHeaders() }
    )
    if (res.ok) {
      const saved = await res.json()
      saved.forEach(r => { progress[r.flashcard_id] = r.status })
    }
    // If flashcard_progress table doesn't exist yet — silently continue
    // progress will just be empty and all cards show as "New"
  } catch (_) {}

  /* ── Boot UI ─────────────────────────────────── */
  show('main')
  buildWordList()
  updateStats()
  setFilter('all')

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

    progress[card.id] = status
    updateStats()
    buildWordList()
    renderCard()

    // Auto advance after short delay
    setTimeout(() => {
      if (deckIndex < deck.length - 1) nextCard()
    }, 300)

    // Save to Supabase via REST
    try {
      await fetch(
        `${window.SUPABASE_URL}/rest/v1/flashcard_progress`,
        {
          method:  'POST',
          headers: {
            ...await getHeaders(),
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            user_id:      userId,
            flashcard_id: card.id,
            test_id:      VOCAB_TEST_ID,
            status:       status
          })
        }
      )
    } catch (err) {
      console.warn('Could not save progress:', err.message)
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
    document.getElementById('mainContent').style.display  = state === 'main'    ? ''     : 'none'
  }

  function showError(msg) {
    show('error')
    const el = document.getElementById('errorMsg')
    if (el) el.textContent = msg
    console.error('Flashcard error:', msg)
  }

  /* ── expose to HTML onclick ──────────────────── */
  window.flipCard  = flipCard
  window.prevCard  = prevCard
  window.nextCard  = nextCard
  window.markCard  = markCard
  window.setFilter = setFilter

})()