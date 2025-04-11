const wordInput = document.getElementById("wordInput");
const translationDiv = document.getElementById("translation");
const wordList = document.getElementById("wordList");

function translateWord() {
  const text = wordInput.value.trim();
  if (!text) return;

  fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fa&dt=t&q=${encodeURIComponent(text)}`)
    .then((res) => res.json())
    .then((data) => {
      const translated = data[0][0][0];
      translationDiv.innerText = `ترجمه: ${translated}`;
      translationDiv.dataset.translation = translated;
    })
    .catch((err) => {
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

  showSavedWords();
  wordInput.value = "";
  translationDiv.innerText = "";
  delete translationDiv.dataset.translation;
}

function showSavedWords() {
  wordList.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("wordPairs") || "[]");
  saved.forEach((pair) => {
    const li = document.createElement("li");
    li.innerText = `${pair.english} → ${pair.persian}`;
    wordList.appendChild(li);
  });
}

// نمایش کلمات ذخیره‌شده هنگام لود
showSavedWords();
