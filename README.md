# OpenPrep — Free Entry Test Prep for Pakistani Students

> Built by students who got in. Free for students trying to.

**[openprep.me](https://openprep.me)** · [Contributors](https://openprep.me/contributors) · [About](https://openprep.me/aboutus/aboutus)

---

## What is OpenPrep?

OpenPrep is a free, open-source exam preparation platform built by Pakistani university students for students preparing for admission tests at **IBA Karachi, MDCAT, ECAT, LUMS, FAST, NUST, NED** and more.

Coaching centers and prep academies charge tens of thousands of rupees for the same material. OpenPrep makes it available to every student — regardless of their financial background — completely free, forever.

---

## What's Available Right Now

| Exam | Status | Questions | Mock Tests |
|---|---|---|---|
| IBA Karachi | ✅ Live | 2,100+ | 10+ |
| MDCAT | 🔄 In progress | — | — |
| ECAT | 🔜 Coming soon | — | — |
| LUMS (LCAT) | 🔜 Coming soon | — | — |
| FAST | 🔜 Coming soon | — | — |

---

## Features

- **2,100+ MCQs** — carefully curated and explained questions for IBA Karachi covering Quantitative, Verbal and Analytical sections
- **Mock tests** — timed full-length papers with automatic scoring
- **Progress tracking** — every quiz attempt is saved to your profile; best score per paper is recorded
- **Personal dashboard** — see your total attempted, correct, wrong and accuracy at a glance
- **Question reporting** — logged in users can flag incorrect or unclear questions
- **Google Sign-In** — one click signup, no friction
- **100% free** — no paywalls, no subscriptions, no hidden fees

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Plain HTML, CSS, JavaScript |
| Auth | Supabase Auth (Google OAuth + Email) |
| Database | Supabase (PostgreSQL) |
| Hosting | Netlify |
| Domain | Namecheap |

## How to Contribute

OpenPrep is fully open source and welcomes contributions from any Pakistani university student. You do not need to be a developer.

### Option 1 — Add Questions
The fastest way to help. Add MCQs with explanations for any exam.

1. Fork this repository
2. Open the relevant subject folder
3. Follow the MCQ format below
4. Submit a pull request

**MCQ Format:**
```json
{
  "test_id": "your-paper-uuid",
  "question": "Your question here",
  "option_a": "Option A",
  "option_b": "Option B",
  "option_c": "Option C",
  "option_d": "Option D",
  "correct": "a",
  "explanation": "Explanation of why A is correct",
  "subject": "Quantitative"
}
```

### Option 2 — Fix Errors
Spotted a wrong answer or typo?
- Open a **GitHub Issue** describing the problem
- Or submit a fix directly via pull request

### Option 3 — Write Code
Check open issues tagged [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to find something to work on.

### Option 4 — Spread the Word
Share OpenPrep in your university WhatsApp groups. More students means more contributors means better content for everyone.

---

## Running Locally

No build tools needed. This is plain HTML/CSS/JS.

```bash
# Clone the repo
git clone https://github.com/MehdiAliQoli/OpenPrep.git
cd OpenPrep

# Create your local Supabase config (never commit this)
touch supabase.js
```

Add your Supabase credentials to `supabase.js`:


## Support OpenPrep

OpenPrep will always be free for students. The only real cost is the domain (~$15/year). Hosting and database are on free tiers.

If OpenPrep helped you — or you believe in what it stands for — any contribution towards keeping the domain alive is genuinely appreciated.

You can also support by:
- ⭐ Starring this repository
- 🐛 Reporting bugs via Issues
- 📝 Contributing questions
- 📢 Sharing with students who need it

---

## Contributors

| Name | University | Contribution |
|---|---|---|
| [Mehdi Ali Qoli](https://github.com/MehdiAliQoli) | IBA Karachi | Founder, platform & all IBA content |
| [Mushtaq Ahmed](https://github.com/MushtaqAhmadSaqi)) | COMSAT ISLAMABAD | Contributing to the MDCAT Section |

Want your name here? [Contribute to OpenPrep →](#how-to-contribute)

---

## License

- **Code** — [MIT License](LICENSE)
- **Content (MCQs, explanations)** — [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — free to use for educational purposes, not for commercial use

---

## Contact

- **GitHub Issues** — for bugs, errors, or suggestions
- **Website** — [openprep.me/about](https://openprep.me/aboutus/aboutus)

---

<p align="center">
  <strong>OpenPrep — free forever, open source always.</strong><br>
  Made with care at IBA Karachi 🇵🇰
</p>
