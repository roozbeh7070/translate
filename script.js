const wordInput = document.getElementById("wordInput");
const translationDiv = document.getElementById("translation");
const wordList = document.getElementById("wordList");
const savedWordsSection = document.getElementById("savedWordsSection");

let correctWords = JSON.parse(localStorage.getItem("correctWords") || "[]");
let wrongWords = JSON.parse(localStorage.getItem("wrongWords") || "[]");

function translateWord() {
  const text = wordInput.value.trim();
  if (!text) return;

  fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fa&dt=t&q=${encodeURIComponent(text)}`)
    .then(res => res.json())
    .then(data => {
      const translated = data[0][0][0];
      translationDiv.innerText = `ترجمه: ${translated}`;
      translationDiv.dataset.translation = translated;
    })
    .catch(err => {
      console.error("خطا در ترجمه:", err);
      translationDiv.innerText = "خطا در ترجمه";
    });
}

function saveWord() {
  const english = wordInput.value.trim();
  const persian = translationDiv.dataset.translation;
  if (!english || !persian) return;

  const saved = JSON.parse(localStorage.getItem("wordPairs") || "[]");
  saved.push({ english, persian });
  localStorage.setItem("wordPairs", JSON.stringify(saved));

  wordInput.value = "";
  translationDiv.innerText = "";
  delete translationDiv.dataset.translation;

  if (savedWordsSection.style.display === "block") {
    showSavedWords();
  }
}

function toggleSavedWords() {
  if (savedWordsSection.style.display === "none") {
    savedWordsSection.style.display = "block";
    showSavedWords();
  } else {
    savedWordsSection.style.display = "none";
  }
}

function showSavedWords() {
  wordList.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("wordPairs") || "[]");
  saved.forEach(pair => {
    const li = document.createElement("li");
    li.innerText = `${pair.english} → ${pair.persian}`;
    wordList.appendChild(li);
  });
}

function playPronunciation(word) {
  if (!word) return;
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  synth.cancel(); // برای جلوگیری از تداخل
  synth.speak(utterance);
}

// ---------------- آزمون ------------------

let currentQuizList = [];
let currentIndex = 0;
let quizMode = "en2fa";

function startQuiz() {
  const allWords = JSON.parse(localStorage.getItem("wordPairs") || "[]");
  const mode = document.querySelector('input[name="sourceType"]:checked').value;
  quizMode = document.querySelector('input[name="quizMode"]:checked').value;

  if (mode === "all") currentQuizList = allWords;
  else if (mode === "correct") currentQuizList = correctWords;
  else if (mode === "wrong") currentQuizList = wrongWords;

  if (currentQuizList.length === 0) {
    alert("لیست انتخاب‌شده خالی است!");
    return;
  }

  currentIndex = 0;
  document.getElementById("quizBox").style.display = "block";
  showQuestion();
}

function showQuestion() {
  document.getElementById("quizAnswer").style.display = "none";
  const item = currentQuizList[currentIndex];
  if (!item) return;
  document.getElementById("quizQuestion").innerText =
    quizMode === "en2fa" ? item.english : item.persian;
  document.getElementById("quizAnswer").innerText =
    quizMode === "en2fa" ? item.persian : item.english;
}

function showAnswer() {
  document.getElementById("quizAnswer").style.display = "block";
}

function markCorrect() {
  const item = currentQuizList[currentIndex];
  correctWords = correctWords.filter(i => i.english !== item.english); // حذف اگر قبلاً بوده
  correctWords.push(item);
  wrongWords = wrongWords.filter(i => i.english !== item.english); // از غلط‌ها حذف
  localStorage.setItem("correctWords", JSON.stringify(correctWords));
  localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
  nextQuiz();
}

function markWrong() {
  const item = currentQuizList[currentIndex];
  wrongWords = wrongWords.filter(i => i.english !== item.english);
  wrongWords.push(item);
  correctWords = correctWords.filter(i => i.english !== item.english);
  localStorage.setItem("wrongWords", JSON.stringify(wrongWords));
  localStorage.setItem("correctWords", JSON.stringify(correctWords));
  nextQuiz();
}

function nextQuiz() {
  currentIndex++;
  if (currentIndex >= currentQuizList.length) {
    alert("آزمون به پایان رسید!");
    document.getElementById("quizBox").style.display = "none";
  } else {
    showQuestion();
  }
}
