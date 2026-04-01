const physicsChapters = [
  {
    "chapter": "Vectors and Equilibrium",
    "tests": [
      {
        "label": "Vectors and Equilibrium-I",
        "id": "03ec9e8b-b00f-4b88-8f61-1ea63a84a1f0"
      },
      {
        "label": "Vectors and Equilibrium-II",
        "id": "70f18a21-b901-40b4-ac83-173a3a73b01b"
      }
    ]
  },
  {
    "chapter": "Force and Motion",
    "tests": [
      {
        "label": "Force and Motion-I",
        "id": "5854fa33-ff21-49b2-b880-a462086b4d70"
      },
      {
        "label": "Force and Motion-II",
        "id": "3b2b639a-8437-48a0-8c42-364aa14959ca"
      }
    ]
  },
  {
    "chapter": "Work and Energy",
    "tests": [
      {
        "label": "Work and Energy-I",
        "id": "b2618d32-fd04-4849-bf44-0a8a3022fe76"
      },
      {
        "label": "Work and Energy-II",
        "id": "372314b1-0958-42e8-90f1-b0712ec30dfc"
      }
    ]
  },
  {
    "chapter": "Rotational and Circular Motion",
    "tests": [
      {
        "label": "Rotational and Circular Motion-I",
        "id": "9eb29454-3c7f-4b6a-9ec5-82492a7faa6f"
      },
      {
        "label": "Rotational and Circular Motion-II",
        "id": "ced178aa-519d-4e38-aef3-4bff9f44f40b"
      }
    ]
  },
  {
    "chapter": "Fluid Dynamics",
    "tests": [
      {
        "label": "Fluid Dynamics-I",
        "id": "db124ebc-57e7-4f7e-804e-a6c0b2c52dce"
      },
      {
        "label": "Fluid Dynamics-II",
        "id": "558ab3aa-3729-4e30-8727-151d8355e808"
      }
    ]
  },
  {
    "chapter": "Waves",
    "tests": [
      {
        "label": "Waves-I",
        "id": "1f3d428f-f02e-49b5-a01f-709e04555b21"
      },
      {
        "label": "Waves-II",
        "id": "ae7d3a55-bd16-44f9-8334-e7ec123bc5aa"
      }
    ]
  },
  {
    "chapter": "Thermodynamics",
    "tests": [
      {
        "label": "Thermodynamics-I",
        "id": "19be58f8-727a-4cc1-8dd4-8ac54b218b39"
      },
      {
        "label": "Thermodynamics-II",
        "id": "c2f639ab-517b-4fda-bdbc-ae1658d8df48"
      }
    ]
  },
  {
    "chapter": "Electrostatics",
    "tests": [
      {
        "label": "Electrostatics-I",
        "id": "82cb46a4-aeb6-4014-ad86-8483cfcb79ba"
      },
      {
        "label": "Electrostatics-II",
        "id": "bf6474bf-e668-44c4-9df0-d726a04248ae"
      }
    ]
  },
  {
    "chapter": "Current Electricity",
    "tests": [
      {
        "label": "Current Electricity-I",
        "id": "0b5428a2-a28d-4a4a-9aca-95b390807e84"
      },
      {
        "label": "Current Electricity-II",
        "id": "1f495e47-2a78-4cfa-bb0e-090d72daeb4e"
      }
    ]
  },
  {
    "chapter": "Electromagnetism",
    "tests": [
      {
        "label": "Electromagnetism-I",
        "id": "2002e5ab-e741-45ea-80b0-3c992b6531fb"
      },
      {
        "label": "Electromagnetism-II",
        "id": "2c2ee06c-0bc3-41c6-a3c5-be517cc15474"
      }
    ]
  },
  {
    "chapter": "Electromagnetic Induction",
    "tests": [
      {
        "label": "Electromagnetic Induction-I",
        "id": "a1e5226c-19c0-4b56-b2a5-88065078bd38"
      },
      {
        "label": "Electromagnetic Induction-II",
        "id": "726168f7-cbc2-4557-8cf0-a34ee51a7fca"
      }
    ]
  },
  {
    "chapter": "Alternating Current",
    "tests": [
      {
        "label": "Alternating Current-I",
        "id": "cdbd10f0-5011-462e-9f6e-484aa42dc32d"
      },
      {
        "label": "Alternating Current-II",
        "id": "4b77b5da-72c8-42b8-8e1f-a555dda96c19"
      }
    ]
  },
  {
    "chapter": "Electronics",
    "tests": [
      {
        "label": "Electronics-I",
        "id": "ea05b883-40d3-4ac7-af8d-3e3a9a0eb6c4"
      },
      {
        "label": "Electronics-II",
        "id": "401127b4-63af-4574-ac6b-1cdf16e43b4c"
      }
    ]
  },
  {
    "chapter": "Dawn of Modern Physics",
    "tests": [
      {
        "label": "Dawn of Modern Physics-I",
        "id": "f62b5c15-7c75-487c-bdbc-a8d770ad2f9a"
      },
      {
        "label": "Dawn of Modern Physics-II",
        "id": "e4aa488f-2d03-4749-8c5d-8fcae3c6ddf7"
      }
    ]
  },
  {
    "chapter": "Atomic Spectra",
    "tests": [
      {
        "label": "Atomic Spectra-I",
        "id": "3f9bcb9f-ded4-4dc1-a296-1fc73b27d08e"
      },
      {
        "label": "Atomic Spectra-II",
        "id": "b7f99657-e075-43fc-a8c7-919fae6c9160"
      }
    ]
  },
  {
    "chapter": "Nuclear Physics",
    "tests": [
      {
        "label": "Nuclear Physics-I",
        "id": "21e1abbf-b448-494c-b17b-320aebbd7abc"
      },
      {
        "label": "Nuclear Physics-II",
        "id": "dd01ff39-ee6a-4af4-ac50-25c50dc325b6"
      }
    ]
  }
];

function buildTestCard(test, chapterName, testIndex) {
  const fallbackSuffix = testIndex === 1 ? "II" : "I";
  const suffix = String(test.suffix || fallbackSuffix).trim();
  const label = test.label || `${chapterName}-${suffix}`;
  const anchor = document.createElement("a");
  anchor.className = "test-link";
  anchor.href = `Question_Bank.html?MDCAT_Physics=${test.id}`;
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

function renderPhysicsPage() {
  const container = document.getElementById("chapter-container");
  const chapterCount = document.getElementById("chapter-count");
  const testCount = document.getElementById("test-count");

  if (!container || !chapterCount || !testCount) {
    return;
  }

  chapterCount.textContent = String(physicsChapters.length);
  testCount.textContent = String(physicsChapters.length * 2);

  physicsChapters.forEach((chapter, index) => {
    container.appendChild(buildChapterCard(chapter, index));
  });
}

document.addEventListener("DOMContentLoaded", renderPhysicsPage);
