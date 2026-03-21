(function () {
  function normalizePaperId(rawId) {
    return String(rawId || '').trim()
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }

  function getPaperIdFromHref(href) {
    try {
      const url = new URL(href, window.location.origin)
      const rawId = (
        url.searchParams.get('paper') ||
        url.searchParams.get('IBA_Karachi_Math') ||
        url.searchParams.get('test_id')
      )
      return normalizePaperId(rawId)
    } catch (_) {
      return null
    }
  }

  function getTotalQuestionsFromCard(card) {
    const metaItems = card.querySelectorAll('.paper-meta span')
    for (const item of metaItems) {
      const text = (item.textContent || '').toLowerCase()
      if (!text.includes('question')) continue
      const match = text.match(/\d+/)
      if (match) return Number(match[0])
    }
    return 0
  }

  async function getQuestionTotalsByPaperId(client, paperIds) {
    const totals = {}
    const validPaperIds = paperIds.filter(isUuid)
    if (!validPaperIds.length) return totals

    const chunkSize = 20
    for (let i = 0; i < validPaperIds.length; i += chunkSize) {
      const chunk = validPaperIds.slice(i, i + chunkSize)
      const { data, error } = await client
        .from('Question_Bank')
        .select('test_id')
        .in('test_id', chunk)

      if (error || !Array.isArray(data)) {
        continue
      }

      for (const row of data) {
        const testId = normalizePaperId(row.test_id)
        if (!testId) continue
        totals[testId] = (totals[testId] || 0) + 1
      }
    }

    return totals
  }

  function ensureScoreNode(card) {
    let node = card.querySelector('.paper-score-mini')
    if (node) return node

    node = document.createElement('div')
    node.className = 'paper-score-mini'
    const right = card.querySelector('.paper-right')
    if (right) right.insertBefore(node, right.querySelector('.paper-actions'))
    return node
  }

  function setCardStatus(card, stat, externalTotalQuestions = 0) {
    const statusNode = card.querySelector('.paper-status')
    const scoreNode = ensureScoreNode(card)
    if (!statusNode || !scoreNode) return

    const attempted = Number(stat?.attempted || 0)
    const correct = Number(stat?.correct || 0)
    const totalFromCard = getTotalQuestionsFromCard(card)
    const totalQuestions = Number(externalTotalQuestions || totalFromCard || 0)

    statusNode.classList.remove('not-started', 'in-progress', 'completed')

    if (attempted <= 0) {
      statusNode.classList.add('not-started')
      statusNode.textContent = 'Not started'
      scoreNode.textContent = ''
      return
    }

    const hasTotalQuestions = totalQuestions > 0
    const isCompleted = hasTotalQuestions ? attempted >= totalQuestions : false
    if (isCompleted) {
      statusNode.classList.add('completed')
      statusNode.textContent = 'Completed'
    } else {
      statusNode.classList.add('in-progress')
      statusNode.textContent = 'Attempted'
    }

    if (hasTotalQuestions) {
      const percent = Math.round((correct / totalQuestions) * 100)
      scoreNode.textContent = `Score: ${correct}/${totalQuestions} (${percent}%)`
    } else {
      scoreNode.textContent = `Score: ${correct} correct (${attempted} attempted)`
    }
  }

  function mergeStatMaps(baseMap, fallbackMap) {
    const merged = { ...baseMap }
    for (const [paperId, localStat] of Object.entries(fallbackMap)) {
      const existing = merged[paperId]
      if (!existing) {
        merged[paperId] = localStat
        continue
      }
      if (Number(localStat.correct || 0) > Number(existing.correct || 0)) {
        merged[paperId] = localStat
      }
    }
    return merged
  }

  function readLocalStats(userId) {
    try {
      const key = `openprep_user_stats_v1_${userId}`
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : {}
    } catch (_) {
      return {}
    }
  }

  async function getRemoteStatsByPaperId(client, userId, paperIds) {
    const map = {}
    if (!paperIds.length) return map

    const validPaperIds = paperIds.filter(isUuid)
    if (!validPaperIds.length) return map

    const chunkSize = 20
    for (let i = 0; i < validPaperIds.length; i += chunkSize) {
      const chunk = validPaperIds.slice(i, i + chunkSize)

      const { data, error } = await client
        .from('user_stats')
        .select('paper_id, attempted, correct, wrong')
        .eq('user_id', userId)
        .in('paper_id', chunk)

      if (error || !Array.isArray(data)) {
        continue
      }

      for (const row of data) {
        const paperId = normalizePaperId(row.paper_id)
        if (!paperId) continue
        map[paperId] = {
          attempted: Number(row.attempted || 0),
          correct: Number(row.correct || 0),
          wrong: Number(row.wrong || 0)
        }
      }
    }

    return map
  }

  async function resolveUserId(client) {
    const { data: { session } } = await client.auth.getSession()
    if (session?.user?.id) return session.user.id

    const { data: userPayload } = await client.auth.getUser()
    if (userPayload?.user?.id) return userPayload.user.id

    // Some pages can load before auth state hydrates; retry once.
    await new Promise((resolve) => setTimeout(resolve, 500))
    const { data: { session: retrySession } } = await client.auth.getSession()
    return retrySession?.user?.id || null
  }

  async function hydrateMocktestStatuses() {
    const cards = Array.from(document.querySelectorAll('.paper-card'))
    if (!cards.length) return

    const cardByPaperId = {}
    const paperIds = []

    for (const card of cards) {
      const href = card.getAttribute('href') || ''
      const paperId = getPaperIdFromHref(href)
      if (!paperId) continue
      cardByPaperId[paperId] = card
      paperIds.push(paperId)
      setCardStatus(card, null)
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') return
    if (!window.SUPABASE_URL || !window.SUPABASE_KEY) return

    const client = window.__openprepSupabaseClient || (() => {
      const c = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY)
      window.__openprepSupabaseClient = c
      return c
    })()

    const userId = await resolveUserId(client)
    if (!userId) return

    const remoteStats = await getRemoteStatsByPaperId(client, userId, paperIds)
    const localStats = readLocalStats(userId)
    const mergedStats = mergeStatMaps(remoteStats, localStats)
    const totalsByPaperId = await getQuestionTotalsByPaperId(client, paperIds)

    for (const paperId of paperIds) {
      const card = cardByPaperId[paperId]
      if (!card) continue
      setCardStatus(card, mergedStats[paperId] || null, totalsByPaperId[paperId] || 0)
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    hydrateMocktestStatuses().catch(() => {
      // Keep page usable even if status loading fails.
    })
  })
})()
