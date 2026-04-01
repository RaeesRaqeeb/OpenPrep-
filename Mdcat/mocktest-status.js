(function () {
  function normalizeId(rawId) {
    return String(rawId || "").trim();
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  function getPaperIdFromHref(href) {
    try {
      const url = new URL(href, window.location.origin);
      const rawId =
        url.searchParams.get("paper") ||
        url.searchParams.get("MDCAT_Chemistry") ||
        url.searchParams.get("test_id");
      return normalizeId(rawId);
    } catch (_) {
      return null;
    }
  }

  function mergeStats(primary, secondary) {
    const merged = { ...primary };
    for (const [paperId, localStat] of Object.entries(secondary)) {
      const existing = merged[paperId];
      if (!existing || Number(localStat.correct || 0) > Number(existing.correct || 0)) {
        merged[paperId] = localStat;
      }
    }
    return merged;
  }

  function readLocalStats(userId) {
    try {
      const key = `openprep_user_stats_v1_${userId}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  async function resolveUserId(client) {
    const {
      data: { session },
    } = await client.auth.getSession();
    if (session?.user?.id) return session.user.id;

    const { data: userPayload } = await client.auth.getUser();
    if (userPayload?.user?.id) return userPayload.user.id;

    await new Promise((resolve) => setTimeout(resolve, 500));
    const {
      data: { session: retrySession },
    } = await client.auth.getSession();
    return retrySession?.user?.id || null;
  }

  async function getRemoteStatsByPaperId(client, userId, paperIds) {
    const map = {};
    const valid = paperIds.filter(isUuid);
    if (!valid.length) return map;

    const chunkSize = 20;
    for (let i = 0; i < valid.length; i += chunkSize) {
      const chunk = valid.slice(i, i + chunkSize);
      const { data, error } = await client
        .from("user_stats")
        .select("paper_id, attempted, correct, wrong")
        .eq("user_id", userId)
        .in("paper_id", chunk);

      if (error || !Array.isArray(data)) continue;

      for (const row of data) {
        const paperId = normalizeId(row.paper_id);
        if (!paperId) continue;
        map[paperId] = {
          attempted: Number(row.attempted || 0),
          correct: Number(row.correct || 0),
          wrong: Number(row.wrong || 0),
        };
      }
    }

    return map;
  }

  async function getQuestionTotalsByPaperId(client, paperIds) {
    const totals = {};
    const valid = paperIds.filter(isUuid);
    if (!valid.length) return totals;

    const chunkSize = 20;
    for (let i = 0; i < valid.length; i += chunkSize) {
      const chunk = valid.slice(i, i + chunkSize);
      const { data, error } = await client
        .from("Question_Bank")
        .select("test_id")
        .in("test_id", chunk);

      if (error || !Array.isArray(data)) continue;

      for (const row of data) {
        const testId = normalizeId(row.test_id);
        if (!testId) continue;
        totals[testId] = (totals[testId] || 0) + 1;
      }
    }

    return totals;
  }

  function ensureStatusNodes(link) {
    let state = link.querySelector(".test-state");
    if (!state) {
      state = document.createElement("div");
      state.className = "test-state";
      state.innerHTML = '<div class="paper-score-mini"></div><div class="paper-status not-started">Not started</div>';
      link.appendChild(state);
    }

    const scoreNode = state.querySelector(".paper-score-mini");
    const statusNode = state.querySelector(".paper-status");
    return { scoreNode, statusNode };
  }

  function setLinkStatus(link, stat, totalQuestions) {
    const { scoreNode, statusNode } = ensureStatusNodes(link);
    if (!scoreNode || !statusNode) return;

    const attempted = Number(stat?.attempted || 0);
    const correct = Number(stat?.correct || 0);
    const total = Number(totalQuestions || 0);

    statusNode.classList.remove("not-started", "in-progress", "completed");

    if (attempted <= 0) {
      statusNode.classList.add("not-started");
      statusNode.textContent = "Not started";
      scoreNode.textContent = "";
      return;
    }

    const completed = total > 0 ? attempted >= total : false;
    if (completed) {
      statusNode.classList.add("completed");
      statusNode.textContent = "Completed";
    } else {
      statusNode.classList.add("in-progress");
      statusNode.textContent = "Attempted";
    }

    if (total > 0) {
      const percent = Math.round((correct / total) * 100);
      scoreNode.textContent = `Score: ${correct}/${total} (${percent}%)`;
    } else {
      scoreNode.textContent = `Score: ${correct} correct (${attempted} attempted)`;
    }
  }

  async function hydrateStatuses() {
    const links = Array.from(document.querySelectorAll(".test-link"));
    if (!links.length) return;

    const byPaperId = {};
    const paperIds = [];

    for (const link of links) {
      const paperId = getPaperIdFromHref(link.getAttribute("href") || "");
      if (!paperId) continue;
      byPaperId[paperId] = link;
      paperIds.push(paperId);
      setLinkStatus(link, null, 0);
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") return;
    if (!window.SUPABASE_URL || !window.SUPABASE_KEY) return;

    const client =
      window.__openprepSupabaseClient ||
      (() => {
        const c = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
        window.__openprepSupabaseClient = c;
        return c;
      })();

    const userId = await resolveUserId(client);
    if (!userId) return;

    const remoteStats = await getRemoteStatsByPaperId(client, userId, paperIds);
    const localStats = readLocalStats(userId);
    const merged = mergeStats(remoteStats, localStats);
    const totals = await getQuestionTotalsByPaperId(client, paperIds);

    for (const paperId of paperIds) {
      const link = byPaperId[paperId];
      if (!link) continue;
      setLinkStatus(link, merged[paperId] || null, totals[paperId] || 0);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydrateStatuses().catch(() => {
      // Keep page usable even if status hydration fails.
    });
  });
})();
