/* helpers */
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Could not load ${path}`);
  }
  return res.json();
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* 1) One Line a Day */
async function initOneLine() {
  const data = await loadJSON("content/one-line.json");
  const today = todayISO();

  const lineEl = document.getElementById("oneLine");
  const hintEl = document.getElementById("oneLineHint");

  if (data[today]) {
    lineEl.textContent = data[today];
    hintEl.textContent = "";
  } else {
    lineEl.textContent = "…";
    hintEl.textContent = "No line for today yet.";
  }
}

/* 2) Message in a Bottle */
async function initBottle() {
  const bottle = await loadJSON("content/bottle.json");

  const btn = document.getElementById("bottleBtn");
  const out = document.getElementById("bottleOut");
  const categorySelect = document.getElementById("bottleCategory");

  btn.addEventListener("click", () => {
    const r = Math.random();

    if (r < bottle.meta.emptyChance) {
      out.textContent = "";
      return;
    }

    if (r < bottle.meta.emptyChance + bottle.meta.dotsChance) {
      out.textContent = "…";
      return;
    }

    let category = categorySelect.value;

    if (category === "any") {
      const keys = Object.keys(bottle.categories);
      category = pickRandom(keys);
    }

    const messages = bottle.categories[category];
    out.textContent = pickRandom(messages);
  });
}

/* 3) Mood Weather */
async function initWeather() {
  const data = await loadJSON("content/weather.json");
  const today = todayISO();

  const el = document.getElementById("weatherOut");
  el.textContent = data[today] || "Clear. Quiet. Nothing to prove.";
}

/* 4) Unsent Messages (persists locally) */
async function initUnsent() {
  const messages = await loadJSON("content/unsent.json");

  const btn = document.getElementById("unsentBtn");
  const list = document.getElementById("unsentList");

  const storageKey = "unsent_revealed_v1";
  const revealed = new Set(
    JSON.parse(localStorage.getItem(storageKey) || "[]")
  );

  function render() {
    list.innerHTML = "";
    revealed.forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      list.appendChild(li);
    });
  }

  render();

  btn.addEventListener("click", () => {
    const unseen = messages.filter((m) => !revealed.has(m));

    if (unseen.length === 0) {
      revealed.clear();
      localStorage.setItem(storageKey, JSON.stringify([]));
      render();
      return;
    }

    const next = pickRandom(unseen);
    revealed.add(next);
    localStorage.setItem(storageKey, JSON.stringify([...revealed]));
    render();
  });
}

/* start everything */
async function main() {
  try {
    await initOneLine();
    await initBottle();
    await initWeather();
    await initUnsent();
  } catch (err) {
    console.error(err);
  }
}

main();
