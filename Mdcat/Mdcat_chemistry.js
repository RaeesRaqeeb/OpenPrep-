const chemistryChapters = [
  {
    chapter: "Stoichiometry",
    tests: [
      { id: "1c5c4090-4b62-4923-8bc0-3ddfbe80bdd9", suffix: "I" },
      { id: "57604804-c7b2-4dd9-afc6-6d402afdfa18", suffix: "II" }
    ]
  },
  {
    chapter: "Atomic Structure",
    tests: [
      { id: "1de40927-5342-426b-b2f4-12323d3ae6c9", suffix: "I" },
      { id: "587a501e-42af-4d42-8896-1b30e9a55888", suffix: "II" }
    ]
  },
  {
    chapter: "Gases",
    tests: [
      { label: "Gases-I", id: "b3d3fc8a-0c7c-4e6e-b784-bd73679f91fc" },
      { label: "Gases-II", id: "3d457993-a483-4e76-990b-2ba23f7aa012" }
    ]
  },
  {
    chapter: "Liquids",
    tests: [
      { label: "Liquids-I", id: "54f80bfe-ce88-419b-8061-6e36e4ebdbda" },
      { label: "Liquids-II", id: "80ee73d2-c51d-4151-a2a4-67dc4c607b34" }
    ]
  },
  {
    chapter: "Solid",
    tests: [
      { label: "Solid-I", id: "1a316a91-70e7-4a05-828a-6a9f6473f15d" },
      { label: "Solid-II", id: "cd5edf30-1e85-435e-8ef6-41436f1bee4c" }
    ]
  },
  {
    chapter: "Chemical Equilibrium",
    tests: [
      { label: "Chemical Equilibrium-I", id: "1d5904cc-8b43-41b6-8815-367d42d673b9" },
      { label: "Chemical Equilibrium-II", id: "79c0c031-f2e6-4a98-a08c-6421f4d4a791" }
    ]
  },
  {
    chapter: "Reaction Kinetics",
    tests: [
      { label: "Reaction Kinetics-I", id: "c9b404ea-c170-41c5-be8b-ec2d665cc599" },
      { label: "Reaction Kinetics-II", id: "7a4a7f52-9b56-49fd-9698-120bb44f1c03" }
    ]
  },
  {
    chapter: "Thermo Chemistry and Energetics of Chemical Reaction",
    tests: [
      { label: "Thermo Chemistry and Energetics of Chemical Reaction-I", id: "6d874c0a-6273-4023-963d-4f483a73cde7" },
      { label: "Thermo Chemistry and Energetics of Chemical Reaction-II", id: "6d2bb923-f1d6-4c5b-9ad6-fb55a1504786" }
    ]
  },
  {
    chapter: "Electrochemistry",
    tests: [
      { label: "Electrochemistry-I", id: "26883e2f-bf4b-4bb8-bfcb-6783a55c092f" },
      { label: "Electrochemistry-II", id: "9f653dc6-c130-45ec-a569-a16906b0f791" }
    ]
  },
  {
    chapter: "Chemical Bonding",
    tests: [
      { label: "Chemical Bonding-I", id: "8785ee16-27d4-4622-95ba-4839e736cda0" },
      { label: "Chemical Bonding-II", id: "d059354f-5432-464a-af76-ca738d4816c9" }
    ]
  },
  {
    chapter: "S- and P- Block Elements",
    tests: [
      { label: "S- and P- Block Elements-I", id: "3614e651-406e-4927-b99f-8f28db309c89" },
      { label: "S- and P- Block Elements-II", id: "fd2ebc2e-72c3-4d8e-b596-203f861e354f" }
    ]
  },
  {
    chapter: "Transition Elements",
    tests: [
      { label: "Transition Elements-I", id: "9f8814b6-6975-468e-8b60-68869576ec07" },
      { label: "Transition Elements-II", id: "749d7f62-c9e7-41f1-9aa6-5809637b4864" }
    ]
  },
  {
    chapter: "Fundamental Principles of Organic Chemistry",
    tests: [
      { label: "Fundamental Principles of Organic Chemistry-I", id: "0ed28033-2fa6-4bd6-857f-5dc16833ee78" },
      { label: "Fundamental Principles of Organic Chemistry-II", id: "52ebc95f-3954-42a2-957e-2f1ad7d7d74f" }
    ]
  },
  {
    chapter: "Chemistry of Hydrocarbons",
    tests: [
      { label: "Chemistry of Hydrocarbons-I", id: "d9c5918c-9b80-4e68-b951-f883ea807855" },
      { label: "Chemistry of Hydrocarbons-II", id: "f9afdc19-cbc0-41fe-a420-35cf9e2c0581" }
    ]
  },
  {
    chapter: "Alkyl Halides",
    tests: [
      { label: "Alkyl Halides-I", id: "70fd1710-8c97-4e79-9dd4-d3570dc814c4" },
      { label: "Alkyl Halides-II", id: "93246517-485b-494c-8cef-455e7e7b27d6" }
    ]
  },
  {
    chapter: "Alcohols and Phenols",
    tests: [
      { label: "Alcohols and Phenols-I", id: "a3953452-d844-46fb-882c-3fa3379f0abd" },
      { label: "Alcohols and Phenols-II", id: "0edaed75-8ede-4dc9-a226-eedea539e1b4" }
    ]
  },
  {
    chapter: "Aldehydes and Ketones",
    tests: [
      { label: "Aldehydes and Ketones-I", id: "8d97ad9e-ffb9-48a1-a52c-79d9c9da33ad" },
      { label: "Aldehydes and Ketones-II", id: "811d8b2c-3e65-4a53-b215-d2fbfdf07523" }
    ]
  },
  {
    chapter: "Carboxylic Acids",
    tests: [
      { label: "Carboxylic Acids-I", id: "e1280e72-02cb-4f3c-a56a-75c8356e89fb" },
      { label: "Carboxylic Acids-II", id: "72548742-83c7-4d51-b563-6b12c3b0de91" }
    ]
  },
  {
    chapter: "Macro Molecules",
    tests: [
      { label: "Macro Molecules-I", id: "c986bd02-509e-497b-84b5-fc6ee8fd4798" },
      { label: "Macro Molecules-II", id: "478a232d-bf39-4a6b-9c5b-2a868f30a3ba" }
    ]
  },
  {
    chapter: "Industrial Chemistry",
    tests: [
      { label: "Industrial Chemistry-I", id: "0e78dbc0-25d6-481c-b76e-9b6bbfc0505b" },
      { label: "Industrial Chemistry-II", id: "8d3a7e5e-b4b5-4529-9350-cb15bf091682" }
    ]
  }
];

function buildTestCard(test, chapterName, testIndex) {
  const fallbackSuffix = testIndex === 1 ? "II" : "I";
  const suffix = String(test.suffix || fallbackSuffix).trim();
  const label = test.label || `${chapterName}-${suffix}`;
  const anchor = document.createElement("a");
  anchor.className = "test-link";
  anchor.href = `Question_Bank.html?MDCAT_Chemistry=${test.id}`;
  anchor.innerHTML = `
    <span class="test-name">${label}</span>
    <span class="test-cta">Practice →</span>
  `;
  return anchor;
}

function buildChapterCard(chapter, index) {
  const card = document.createElement("article");
  card.className = "chapter-card";

  const head = document.createElement("div");
  head.className = "chapter-head";
  head.innerHTML = `
    <h2 class="chapter-title">${String(index + 1).padStart(2, "0")}. ${chapter.chapter}</h2>
    <span class="chapter-tag">2 Tests</span>
  `;

  const testRow = document.createElement("div");
  testRow.className = "test-row";
  chapter.tests.forEach((test, testIndex) => testRow.appendChild(buildTestCard(test, chapter.chapter, testIndex)));

  card.appendChild(head);
  card.appendChild(testRow);
  return card;
}

function renderChemistryPage() {
  const container = document.getElementById("chapter-container");
  const chapterCount = document.getElementById("chapter-count");
  const testCount = document.getElementById("test-count");

  if (!container || !chapterCount || !testCount) {
    return;
  }

  chapterCount.textContent = String(chemistryChapters.length);
  testCount.textContent = String(chemistryChapters.length * 2);

  chemistryChapters.forEach((chapter, index) => {
    container.appendChild(buildChapterCard(chapter, index));
  });
}

document.addEventListener("DOMContentLoaded", renderChemistryPage);