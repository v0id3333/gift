function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* Message in a Bottle (ignores categories, picks from all) */
async function initBottle() {
  const bottle = await loadJSON("content/bottle.json");
  const btn = document.getElementById("bottleBtn");
  const out = document.getElementById("bottleOut");

  const allMessages = Object.values(bottle.categories || {}).flat();

  btn.addEventListener("click", () => {
    const r = Math.random();

    if (bottle.meta && r < bottle.meta.emptyChance) {
      out.textContent = "";
      return;
    }

    if (bottle.meta && r < (bottle.meta.emptyChance + bottle.meta.dotsChance)) {
      out.textContent = "…";
      return;
    }

    out.textContent = allMessages.length ? pickRandom(allMessages) : "…";
  });
}

/* Weather (date-based; shows fallback if date missing) */
async function initWeather() {
  const data = await loadJSON("content/weather.json");
  const today = todayISO();
  const el = document.getElementById("weatherOut");

  el.textContent = data[today] || "Clear. Quiet. Nothing to prove.";
}

/* Unsent messages (keeps revealing; doesn’t break) */
async function initUnsent() {
  const messages = await loadJSON("content/unsent.json");
  const btn = document.getElementById("unsentBtn");
  const list = document.getElementById("unsentList");

  const storageKey = "unsent_revealed_v2";
  const revealed = new Set(JSON.parse(localStorage.getItem(storageKey) || "[]"));

  function render() {
    list.innerHTML = "";
    [...revealed].forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      list.appendChild(li);
    });
  }

  render();

  btn.addEventListener("click", () => {
    const unseen = messages.filter((m) => !revealed.has(m));

    // If finished, loop again (so it never "dies")
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

async function main() {
  try {
    await initBottle();
    await initWeather();
    await initUnsent();
  } catch (err) {
    console.error(err);
  }
}

main();
