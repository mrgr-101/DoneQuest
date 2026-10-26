(() => {
  const STORAGE_KEY = "donequest-quests-v1";
  const initialQuests = [
    { id: "read-pages", title: "Read 20 pages", category: "Reading", type: "Harian", xp: 50, completed: true },
    { id: "exercise", title: "Exercise 30 min", category: "Fitness", type: "Harian", xp: 100, completed: true },
    { id: "english", title: "Learn English", category: "Learning", type: "Harian", xp: 75, completed: false },
    { id: "water", title: "Drink 2L water", category: "Health", type: "Harian", xp: 30, completed: true },
    { id: "meditation", title: "Meditasi 10 menit", category: "Health", type: "Custom", xp: 40, completed: false },
    { id: "review-notes", title: "Review catatan kuliah", category: "Learning", type: "Custom", xp: 60, completed: false }
  ];

  let quests = loadQuests();
  let activeFilter = "Semua";
  const list = document.getElementById("questList");
  const progressText = document.getElementById("dailyProgressText");
  const progressBar = document.getElementById("dailyProgressBar");
  const form = document.getElementById("addQuestForm");
  const formMessage = document.getElementById("formMessage");

  function loadQuests() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialQuests.map(q => ({...q}));
    } catch {
      return initialQuests.map(q => ({...q}));
    }
  }
  function saveQuests() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(quests)); } catch {}
  }
  function safeText(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[ch]));
  }
  function toggleQuest(id) {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    quest.completed = !quest.completed;
    saveQuests();
    render();
  }

  function deleteQuest(id) {
    if (confirm("Apakah kamu yakin ingin menghapus quest ini?")) {
      quests = quests.filter(q => q.id !== id);
      saveQuests();
      render();
    }
  }

  function render() {
    const visible = quests.filter(q => {
      if (activeFilter === "Harian" || activeFilter === "Custom") return q.type === activeFilter;
      if (activeFilter === "Selesai") return q.completed;
      return true;
    });
    list.innerHTML = "";
    if (!visible.length) {
      list.innerHTML = '<div class="rounded-xl border border-dashed border-gray-700/80 p-6 text-center text-sm muted">Belum ada quest di kategori ini.</div>';
    }
    visible.forEach(q => {
      const card = document.createElement("article");
      card.className = "quest-card p-4 flex items-center justify-between gap-3 cursor-pointer";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-pressed", String(q.completed));
      
      card.innerHTML = `
        <div class="flex items-center gap-4 min-w-0">
          <input class="quest-check" type="checkbox" ${q.completed ? "checked" : ""} aria-label="Tandai ${safeText(q.title)} selesai">
          <div class="min-w-0">
            <h3 class="font-semibold text-sm sm:text-base ${q.completed ? "line-through text-gray-400" : "text-white"}">${safeText(q.title)}</h3>
            <p class="text-xs muted mt-0.5">${safeText(q.category)} · ${safeText(q.type)}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-bold text-amber-400 text-sm sm:text-base whitespace-nowrap">+${Number(q.xp)} XP</span>
          <button class="delete-btn" aria-label="Hapus quest ${safeText(q.title)}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>`;

      card.addEventListener("click", e => {
        if (e.target instanceof HTMLInputElement || e.target.closest('.delete-btn')) return;
        toggleQuest(q.id);
      });
      
      card.querySelector("input").addEventListener("change", () => toggleQuest(q.id));
      
      card.querySelector(".delete-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteQuest(q.id);
      });

      card.addEventListener("keydown", e => {
        if (e.target === card && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          toggleQuest(q.id);
        }
      });
      list.appendChild(card);
    });

    const completedCount = quests.filter(q => q.completed).length;
    const earnedXP = quests.reduce((sum, q) => sum + (q.completed ? Number(q.xp) : 0), 0);
    const percent = quests.length ? Math.round(completedCount / quests.length * 100) : 0;
    progressText.innerHTML = `${completedCount} dari ${quests.length} quest selesai hari ini · <span class="text-amber-400">+${earnedXP} XP</span>`;
    progressBar.style.width = `${percent}%`;
  }

  document.getElementById("filters").addEventListener("click", e => {
    const button = e.target.closest("button[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.toggle("active", btn === button));
    render();
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("questTitleInput").value.trim();
    const category = document.getElementById("questCategoryInput").value;
    const type = document.getElementById("questFrequencyInput").value;
    const xp = Number(document.getElementById("questXpInput").value);
    if (!title || !Number.isFinite(xp) || xp < 5 || xp > 500) {
      formMessage.textContent = "Isi judul dan XP antara 5–500.";
      return;
    }
    quests.push({ id: `custom-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, title, category, type, xp, completed: false });
    saveQuests();
    form.reset();
    document.getElementById("questXpInput").value = 60;
    formMessage.textContent = "Quest berhasil ditambahkan!";
    activeFilter = "Semua";
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === activeFilter));
    render();
  });

  const mobileButton = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  mobileButton.addEventListener("click", () => mobileMenu.classList.toggle("hidden"));
  render();
})();