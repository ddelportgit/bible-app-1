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
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Kings": 22,
  "2 Kings": 25,
  "1 Chronicles": 29,
  "2 Chronicles": 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  "Song of Solomon": 8,
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
  "1 Corinthians": 16,
  "2 Corinthians": 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  "1 Thessalonians": 5,
  "2 Thessalonians": 3,
  "1 Timothy": 6,
  "2 Timothy": 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  "1 Peter": 5,
  "2 Peter": 3,
  "1 John": 5,
  "2 John": 1,
  "3 John": 1,
  Jude: 1,
  Revelation: 22,
};

function updateSelectChapter() {
  const selectBook = document.getElementById("select-book");
  const selectChapter = document.getElementById("select-chapter");
  const selectedBook = selectBook.value;

  // clear previoius chapter options

  selectChapter.innerHTML = "<option value=''>Select Chapter</option>";

  if (selectedBook) {
    const chapterCount = chaptersByBook[selectedBook];
    for (let i = 1; i <= chapterCount; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Chapter: ${i}`;
      selectChapter.appendChild(option);
    }
  }
}

function getChapter(version, book, chapter) {
  fetch(`https://bible.helloao.org/api/${version}/${book}/${chapter}.json`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      bookTitle.innerHTML = data.book.name;
      chapterTitle.innerHTML = `Chapter ${data.chapter.number}`;
      chapterText.innerHTML = "";

      //   data.chapter.content.forEach((verse) => {
      //     const verseElement = document.createElement("div");
      //     verseElement.classList.add("verse");
      //     verseElement.innerHTML = `<span> ${verse.number}:</span> ${verse.content.join(" ")}`;
      //     chapterText.appendChild(verseElement);
      //   });

      data.chapter.content.forEach((verse) => {
        const verseElement = document.createElement("div");
        verseElement.classList.add("verse");

        // Filter out any content that has a noteId
        const filteredContent = verse.content
          .filter((item) => typeof item === "string")
          .map((item) => item.replace(/¶/g, "")); // Remove the ¶ symbol

        verseElement.innerHTML = `<span>${verse.number}</span> ${filteredContent.join(" ")}`;
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

// function displayChapter(data) {
//   const chapterText = document.getElementById("chapter");
//   chapter.innerHTML = data.chapter.content.map((verse) => <div> ${verse} </div>);
// }
