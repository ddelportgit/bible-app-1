const button = document.getElementById("go-button");
const chapterText = document.getElementById("chapter");
const bookTitle = document.getElementById("book-title");
const chapterTitle = document.getElementById("chapter-title");

const chaptersByBook = {
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  "1_Samuel": 31,
  "2_Samuel": 24,
  "1_Kings": 22,
  "2_Kings": 25,
  "1_Chronicles": 29,
  "2_Chronicles": 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  Song_of_Solomon: 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  "1_Corinthians": 16,
  "2_Corinthians": 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  "1_Thessalonians": 5,
  "2_Thessalonians": 3,
  "1_Timothy": 6,
  "2_Timothy": 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  "1_Peter": 5,
  "2_Peter": 3,
  "1_John": 5,
  "2_John": 1,
  "3_John": 1,
  Jude: 1,
  Revelation: 22,
};

function updateSelectChapter() {
  const selectBook = document.getElementById("select-book");
  const selectChapter = document.getElementById("select-chapter");
  const selectedBook = selectBook.value;

  selectChapter.innerHTML = "<option value=''>Select Chapter</option>";

  if (selectedBook) {
    const chapterCount = chaptersByBook[selectedBook];
    for (let i = 1; i <= chapterCount; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Chapter ${i}`;
      selectChapter.appendChild(option);
    }
  }
}

const selectedVerses = new Set();

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
          document
            .querySelectorAll(".verse")
            .forEach((v) => v.classList.remove("active"));
          verseElement.classList.add("active");

          const verseText = `${verse.number}: ${filteredContent.join(" ")}`;
          copyVerseToClipboard(verseText);
        });

        chapterText.appendChild(verseElement);
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
