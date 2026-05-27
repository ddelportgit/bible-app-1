const selectVersion = document.getElementById("select-version");
const selectBook = document.getElementById("select-book");
const selectChapter = document.getElementById("select-chapter");
const button = document.getElementById("go-button");
const chapterText = document.getElementById("chapter");
const bookTitle = document.getElementById("book-title");
const chapterTitle = document.getElementById("chapter-title");

async function initFromApi() {
  try {
    const res = await fetch("https://bible.helloao.org/api/translations.json");
    const data = await res.json();
    populateVersionSelect(data.translations || data);
    restoreLastRead();
  } catch (err) {
    console.error("Failed to load translations", err);
  }
}

function populateVersionSelect(translations) {
  const selectVersion = document.getElementById("select-version");
  selectVersion.innerHTML = "<option value=''>Select version</option>";

  const list = Array.isArray(translations) ? translations : translations.translations || [];

  list.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.englishName || t.name || t.id;
    selectVersion.appendChild(opt);
  });
}

initFromApi();

const booksCache = {};

async function fetchBooksForTranslation(translationId) {
  if (!translationId) return null;
  if (booksCache[translationId]) return booksCache[translationId];

  try {
    const res = await fetch(`https://bible.helloao.org/api/${translationId}/books.json`);
    const data = await res.json();
    booksCache[translationId] = data;
    return data;
  } catch (e) {
    console.error("Failed to fetch books for", translationId, e);
    return null;
  }
}

function populateBookSelect(booksData) {
  selectBook.innerHTML = "<option value=''>Select book</option>";
  if (!booksData || !Array.isArray(booksData.books)) return;

  booksData.books.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.name || b.commonName || b.id;
    opt.dataset.chapters = b.numberOfChapters || 0;
    selectBook.appendChild(opt);
  });

  selectChapter.innerHTML = "<option value=''>Select Chapter</option>";
}

selectVersion.addEventListener("change", async function (e) {
  const version = e.target.value;
  if (!version) {
    selectBook.innerHTML = "<option value=''>Select book</option>";
    selectChapter.innerHTML = "<option value=''>Select chapter</option>";
    return;
  }
  const booksData = await fetchBooksForTranslation(version);
  populateBookSelect(booksData);
});

function populateChapterSelectFromBookOption(bookOption) {
  selectChapter.innerHTML = "<option value=''>Select Chapter</option>";
  if (!bookOption) return;
  const chapters = parseInt(bookOption.dataset.chapters || "0", 10);
  for (let i = 1; i <= chapters; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Chapter ${i}`;
    selectChapter.appendChild(opt);
  }
}

selectBook.addEventListener("change", function (e) {
  const selectedOption = e.target.selectedOptions[0];
  populateChapterSelectFromBookOption(selectedOption);
});

function saveLastRead(version, book, chapter) {
  try {
    localStorage.setItem("lastRead", JSON.stringify({ version, book, chapter }));
  } catch (e) {
    console.error("Could not save last read", e);
  }
}

function restoreLastRead() {
  const raw = localStorage.getItem("lastRead");
  if (!raw) return;
  try {
    const { version, book, chapter } = JSON.parse(raw);
    if (!version) return;

    const vSel = document.getElementById("select-version");
    vSel.value = version;

    vSel.dispatchEvent(new Event("change"));

    const waiter = setInterval(() => {
      const bSel = document.getElementById("select-book");
      if (bSel && bSel.options.length > 1) {
        if (book) {
          bSel.value = book;
          bSel.dispatchEvent(new Event("change"));
        }

        setTimeout(() => {
          const cSel = document.getElementById("select-chapter");
          if (cSel && chapter) cSel.value = chapter;
        }, 150);
        clearInterval(waiter);
      }
    }, 150);
  } catch (e) {
    console.error("Failed to restore last read", e);
  }
}

function getChapter(version, book, chapter) {
  fetch(`https://bible.helloao.org/api/${version}/${book}/${chapter}.json`)
    .then((res) => res.json())
    .then((data) => {
      bookTitle.innerHTML = data.book.name;
      chapterTitle.innerHTML = `Chapter ${data.chapter.number}`;
      chapterText.innerHTML = "";

      data.chapter.content.forEach((verse) => {
        const verseElement = document.createElement("div");
        verseElement.classList.add("verse");

        const filteredContent = verse.content
          .filter((item) => typeof item === "string")
          .map((item) => item.replace(/¶/g, ""));

        verseElement.innerHTML = `<span>${verse.number}</span> <div>${filteredContent.join(
          " ",
        )}</div>`;

        const verseText = `${bookTitle.innerHTML} ${chapterTitle.innerHTML} ${verse.number}`;

        verseElement.addEventListener("click", function () {
          document.querySelectorAll(".verse").forEach((v) => v.classList.remove("active"));
          verseElement.classList.add("active");

          const verseText = `${verse.number}: ${filteredContent.join(" ")}`;
          copyVerseToClipboard(verseText);
        });

        chapterText.appendChild(verseElement);

        saveLastRead(version, book, chapter);
      });
    });
}

button.addEventListener("click", handleInput);

function handleInput() {
  const version = document.getElementById("select-version");
  const book = document.getElementById("select-book");
  const chapter = document.getElementById("select-chapter");

  getChapter(version.value, book.value, chapter.value);
}

// COPY FUNCTION

function copyVerseToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("Verse copied to clipboard");
    })
    .catch((e) => {
      console.error("Could not copy text: ", e);
    });
}

// TOAST

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// DARK MODE

const toggleBtn = document.getElementById("toggle-btn");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

if (!localStorage.getItem("theme")) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    document.body.classList.add("dark");
  }
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});
