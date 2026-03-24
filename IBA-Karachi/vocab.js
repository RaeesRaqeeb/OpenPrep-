(async function () {
	function showFatalError(message) {
		const loading = document.getElementById("loadingState");
		const errorBox = document.getElementById("errorState");
		const main = document.getElementById("mainContent");
		const msg = document.getElementById("errorMsg");
		if (loading) loading.style.display = "none";
		if (main) main.style.display = "none";
		if (errorBox) errorBox.style.display = "flex";
		if (msg) msg.textContent = message;
	}

	try {
	const VOCAB_TEST_ID = "8c855dc9-8b94-44f1-9731-c2c86e632213";

	/* ── Init Supabase ───────────────────────────── */
	const sb =
		window.__openprepSupabaseClient ||
		(() => {
			const c = window.supabase.createClient(
				window.SUPABASE_URL,
				window.SUPABASE_KEY,
			);
			window.__openprepSupabaseClient = c;
			return c;
		})();

	/* ── Guard ───────────────────────────────────── */
	const {
		data: { session },
	} = await sb.auth.getSession();
	if (!session) {
		const returnTo = encodeURIComponent("/IBA-Karachi/vocab.html");
		window.location.href = `/login?returnTo=${returnTo}`;
		return;
	}
	const userId = session.user.id;

	/* ── State ───────────────────────────────────── */
	let allCards = []; // full list from DB
	let progress = {}; // { cardId: 'mastered' | 'in-progress' }
	let deck = []; // filtered list currently shown
	let deckIndex = 0;
	let isFlipped = false;

	/* ── Fetch cards ─────────────────────────────── */
	const { data: cards, error } = await sb
		.from("Vocab_IBA")
		.select("id, front, back")
		.eq("test_id", VOCAB_TEST_ID)
		.order("id", { ascending: true });

	if (error || !cards || cards.length === 0) {
		show("error");
		document.getElementById("errorMsg").textContent =
			error?.message || "No vocabulary cards found for this test.";
		return;
	}

	allCards = cards;

	/* ── Fetch saved progress ────────────────────── */
	const { data: savedProgress } = await sb
		.from("flashcard_progress")
		.select("flashcard_id, status")
		.eq("user_id", userId)
		.eq("test_id", VOCAB_TEST_ID);

	if (savedProgress) {
		savedProgress.forEach((r) => {
			progress[r.flashcard_id] = r.status;
		});
	}

	/* ── Build UI ────────────────────────────────── */
	show("main");
	buildWordList();
	updateStats();
	setFilter("all");

	/* ── Filter tabs ─────────────────────────────── */
	document.querySelectorAll(".filter-tab").forEach((tab) => {
		tab.addEventListener("click", () => setFilter(tab.dataset.filter));
	});

	function setFilter(filter) {
		document.querySelectorAll(".filter-tab").forEach((t) => {
			t.classList.toggle("active", t.dataset.filter === filter);
		});

		if (filter === "all") {
			deck = [...allCards];
			document.getElementById("deckLabel").textContent = "all cards";
		} else if (filter === "mastered") {
			deck = allCards.filter((c) => progress[c.id] === "mastered");
			document.getElementById("deckLabel").textContent = "mastered cards";
		} else if (filter === "in-progress") {
			deck = allCards.filter((c) => progress[c.id] === "in-progress");
			document.getElementById("deckLabel").textContent = "in progress cards";
		} else if (filter === "new") {
			deck = allCards.filter((c) => !progress[c.id]);
			document.getElementById("deckLabel").textContent = "not started cards";
		}

		deckIndex = 0;
		resetFlip();

		if (deck.length === 0) {
			document.getElementById("doneState").style.display = "";
			document.getElementById("cardArea").style.display = "none";
		} else {
			document.getElementById("doneState").style.display = "none";
			document.getElementById("cardArea").style.display = "";
			renderCard();
		}
	}

	/* ── Render card ─────────────────────────────── */
	function renderCard() {
		if (!deck.length) return;
		const card = deck[deckIndex];
		const status = progress[card.id] || "new";

		document.getElementById("cardFront").textContent = card.front;
		document.getElementById("cardBack").textContent = card.back;
		document.getElementById("navPos").textContent = `${deckIndex + 1} / ${deck.length}`;

		// Badge
		const badge = document.getElementById("cardBadge");
		badge.className = "card-status-badge";
		if (status === "mastered") {
			badge.classList.add("badge-mastered");
			badge.textContent = "Mastered";
		} else if (status === "in-progress") {
			badge.classList.add("badge-in-progress");
			badge.textContent = "In Progress";
		} else {
			badge.classList.add("badge-new");
			badge.textContent = "New";
		}

		// Nav arrows
		document.getElementById("prevBtn").disabled = deckIndex === 0;
		document.getElementById("nextBtn").disabled = deckIndex === deck.length - 1;

		// Highlight in word list
		document.querySelectorAll(".word-row").forEach((r) => {
			r.classList.toggle("active", r.dataset.id === card.id);
		});

		resetFlip();
	}

	/* ── Flip ────────────────────────────────────── */
	function flipCard() {
		isFlipped = !isFlipped;
		document.getElementById("card3d").classList.toggle("flipped", isFlipped);
		document.getElementById("cardActions").classList.toggle("visible", isFlipped);
	}

	function resetFlip() {
		isFlipped = false;
		document.getElementById("card3d").classList.remove("flipped");
		document.getElementById("cardActions").classList.remove("visible");
	}

	/* ── Nav ─────────────────────────────────────── */
	function prevCard() {
		if (deckIndex > 0) {
			deckIndex--;
			renderCard();
		}
	}

	function nextCard() {
		if (deckIndex < deck.length - 1) {
			deckIndex++;
			renderCard();
		}
	}

	/* ── Mark card ───────────────────────────────── */
	async function markCard(status) {
		const card = deck[deckIndex];
		if (!card) return;

		progress[card.id] = status;
		updateStats();
		buildWordList();
		renderCard();

		// Auto advance
		setTimeout(() => {
			if (deckIndex < deck.length - 1) nextCard();
		}, 300);

		// Save to Supabase
		await sb.from("flashcard_progress").upsert(
			{
				user_id: userId,
				flashcard_id: card.id,
				test_id: VOCAB_TEST_ID,
				status: status,
			},
			{ onConflict: "user_id, flashcard_id" },
		);
	}

	/* ── Stats ───────────────────────────────────── */
	function updateStats() {
		const mastered = allCards.filter((c) => progress[c.id] === "mastered").length;
		const inProgress = allCards.filter((c) => progress[c.id] === "in-progress").length;
		const newCards = allCards.filter((c) => !progress[c.id]).length;
		const pct = Math.round((mastered / allCards.length) * 100);

		document.getElementById("masteredCount").textContent = mastered;
		document.getElementById("inProgressCount").textContent = inProgress;
		document.getElementById("newCount").textContent = newCards;
		document.getElementById("masteryPct").textContent = pct + "%";

		setTimeout(() => {
			document.getElementById("masteryBar").style.width = pct + "%";
		}, 100);
	}

	/* ── Word list ───────────────────────────────── */
	function buildWordList() {
		const list = document.getElementById("wordList");
		list.innerHTML = "";

		allCards.forEach((card) => {
			const status = progress[card.id] || "new";
			const row = document.createElement("div");
			row.className = "word-row";
			row.dataset.id = card.id;

			const dotClass =
				status === "mastered"
					? "dot-mastered"
					: status === "in-progress"
						? "dot-in-progress"
						: "dot-new";

			const badgeHtml =
				status === "mastered"
					? '<span class="card-status-badge badge-mastered compact-badge">Mastered</span>'
					: status === "in-progress"
						? '<span class="card-status-badge badge-in-progress compact-badge">In Progress</span>'
						: "";

			row.innerHTML = `
				<div class="word-row-status ${dotClass}"></div>
				<div class="word-row-front">${card.front}</div>
				<div class="word-row-back">${card.back}</div>
				<div class="word-row-badge">${badgeHtml}</div>
			`;

			row.addEventListener("click", () => {
				// Jump to this card in current deck
				const idxInDeck = deck.findIndex((c) => c.id === card.id);
				if (idxInDeck >= 0) {
					deckIndex = idxInDeck;
					renderCard();
					window.scrollTo({ top: 0, behavior: "smooth" });
				} else {
					// Card not in current filter, switch to all
					setFilter("all");
					const newIdx = deck.findIndex((c) => c.id === card.id);
					if (newIdx >= 0) {
						deckIndex = newIdx;
						renderCard();
					}
					window.scrollTo({ top: 0, behavior: "smooth" });
				}
			});

			list.appendChild(row);
		});
	}

	/* ── Show/hide states ────────────────────────── */
	function show(state) {
		document.getElementById("loadingState").style.display = state === "loading" ? "flex" : "none";
		document.getElementById("errorState").style.display = state === "error" ? "flex" : "none";
		document.getElementById("mainContent").style.display = state === "main" ? "" : "none";
	}

	/* ── Expose for HTML onclick ─────────────────── */
	window.flipCard = flipCard;
	window.prevCard = prevCard;
	window.nextCard = nextCard;
	window.markCard = markCard;
	window.setFilter = setFilter;
  } catch (err) {
    console.error("Vocab page failed to initialize", err);
    showFatalError(err?.message || "Something went wrong while loading vocabulary cards.");
  }
})();
