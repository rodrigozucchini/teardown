const STRINGS = {
  es: {
    introLabel: "INTRO",
    introLead: "Para entender algo, lo desarmo.",
    introBody:
      "Teardown es mi registro de aprendizaje. Cada pieza es un concepto que desarmé hasta entenderlo: el código queda en GitHub, la explicación en Medium y, a veces, un video. Esta página no explica nada. Solo te lleva a las piezas.",
    search: "buscar pieza...",
    all: "todo",
    count: (n, total) => `${n} / ${total} piezas`,
    empty: "Nada por acá. Todavía no lo desarmé.",
    code: "Código",
    medium: "Medium",
    video: "Video",
    footer: "Hecho a mano. Se rompe a propósito.",
  },
  en: {
    introLabel: "INTRO",
    introLead: "To understand something, I take it apart.",
    introBody:
      "Teardown is my learning log. Each part is a concept I took apart until I understood it: the code lives on GitHub, the write-up on Medium and, sometimes, a video. This page explains nothing. It just takes you to the parts.",
    search: "search part...",
    all: "all",
    count: (n, total) => `${n} / ${total} parts`,
    empty: "Nothing here. Haven't taken it apart yet.",
    code: "Code",
    medium: "Medium",
    video: "Video",
    footer: "Handmade. Broken on purpose.",
  },
};

const searchInput = document.getElementById("search");
const tagsEl = document.getElementById("tags");
const listEl = document.getElementById("list");
const countEl = document.getElementById("count");

const topics = [...TOPICS].sort((a, b) => b.date.localeCompare(a.date));
const allTags = [...new Set(topics.flatMap((t) => t.tags))].sort();

let activeTag = null;
let lang = loadLang();

function loadLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved in STRINGS) return saved;
  } catch {}
  return navigator.language.startsWith("es") ? "es" : "en";
}

function setLang(next) {
  lang = next;
  try { localStorage.setItem("lang", next); } catch {}
  render();
}

// Acepta un string o un objeto { es, en }.
function tr(value) {
  return typeof value === "object" && value !== null ? value[lang] ?? value.es : value;
}

function pad(n) {
  return String(n).padStart(3, "0");
}

function link(href, label) {
  if (!href) return "";
  return `<a href="${href}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>`;
}

function renderStatic() {
  const s = STRINGS[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = s[el.dataset.i18n];
  });
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  searchInput.placeholder = s.search;
}

function renderTags() {
  tagsEl.innerHTML = "";
  for (const tag of [null, ...allTags]) {
    const btn = document.createElement("button");
    btn.textContent = `[${tag ?? STRINGS[lang].all}]`;
    btn.className = tag === activeTag ? "tag active" : "tag";
    btn.onclick = () => {
      activeTag = tag;
      renderTags();
      renderList();
    };
    tagsEl.appendChild(btn);
  }
}

function renderList() {
  const s = STRINGS[lang];
  const q = searchInput.value.trim().toLowerCase();
  const filtered = topics.filter((t) => {
    if (activeTag && !t.tags.includes(activeTag)) return false;
    const text = `${tr(t.title)} ${tr(t.description)} ${t.tags.join(" ")}`.toLowerCase();
    return text.includes(q);
  });

  countEl.textContent = s.count(filtered.length, topics.length);

  if (filtered.length === 0) {
    listEl.innerHTML = `<li class="empty">${s.empty}</li>`;
    return;
  }

  listEl.innerHTML = filtered
    .map((t) => {
      const n = topics.length - topics.indexOf(t);
      return `
      <li>
        <details>
          <summary>
            <span class="num">${pad(n)}</span>
            <span class="name">${tr(t.title)}</span>
            <span class="date">${t.date}</span>
            <span class="toggle" aria-hidden="true"></span>
          </summary>
          <div class="body">
            <p>${tr(t.description)}</p>
            <p class="item-tags">${t.tags.map((x) => `#${x}`).join(" ")}</p>
            <div class="links">
              ${link(t.code, s.code)}
              ${link(t.medium, s.medium)}
              ${link(t.video, s.video)}
            </div>
          </div>
        </details>
      </li>`;
    })
    .join("");
}

function render() {
  renderStatic();
  renderTags();
  renderList();
}

document.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.onclick = () => setLang(btn.dataset.lang);
});
searchInput.addEventListener("input", renderList);
render();
