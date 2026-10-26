(() => {
  // Key Storage sama dengan quest.js
  const STORAGE_KEY = "donequest-quests-v1";

  // Data default jika localStorage kosong
  const initialQuests = [
    { id: "read-pages", title: "Read 20 pages", category: "Reading", type: "Harian", xp: 50, completed: true },
    { id: "exercise", title: "Exercise 30 min", category: "Fitness", type: "Harian", xp: 100, completed: true },
    { id: "english", title: "Learn English", category: "Learning", type: "Harian", xp: 75, completed: false },
    { id: "water", title: "Drink 2L water", category: "Health", type: "Harian", xp: 30, completed: true },
    { id: "meditation", title: "Meditasi 10 menit", category: "Health", type: "Custom", xp: 40, completed: false },
    { id: "review-notes", title: "Review catatan kuliah", category: "Learning", type: "Custom", xp: 60, completed: false }
  ];

  let quests = [];
  const baseUserXP = 2660;
  const xpPerLevel = 3200;

  // DOM Elements
  const questListContainer = document.getElementById("questList");
  const dailyProgressText = document.getElementById("dailyProgressText");
  const dailyProgressBar = document.getElementById("dailyProgressBar");
  const userXpText = document.getElementById("userXpText");
  const levelProgressBar = document.getElementById("levelProgressBar");

  // Membaca dari LocalStorage
  function loadQuests() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialQuests.map(q => ({ ...q }));
    } catch {
      return initialQuests.map(q => ({ ...q }));
    }
  }

  // Menyimpan ke LocalStorage
  function saveQuests() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
    } catch (e) {
      console.error("Gagal menyimpan ke localStorage", e);
    }
  }

  // Sanitasi teks (Mencegah XSS)
  function safeText(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  // Toggle Quest berdasarkan ID
  function toggleQuest(id) {
    quests = loadQuests(); // data terbaru
    const quest = quests.find(q => q.id === id);
    if (!quest) return;

    quest.completed = !quest.completed;
    saveQuests();   // Simpan ke localStorage
    renderQuests(); // Update tampilan Dashboard
  }

  // Render Tampilan Dashboard
  function renderQuests() {
    if (!questListContainer) return;
    questListContainer.innerHTML = "";

    let completedCount = 0;
    let earnedXP = 0;

    quests.forEach(q => {
      if (q.completed) {
        completedCount++;
        earnedXP += Number(q.xp);
      }

      const questCard = document.createElement("div");
      questCard.className = "quest-item bg-[#192338] hover:bg-[#1e2b45] transition-colors rounded-xl p-4 sm:p-4.5 flex items-center justify-between border border-gray-800/60 cursor-pointer";

      questCard.innerHTML = `
        <div class="flex items-center space-x-4 pointer-events-none">
          <input type="checkbox" ${q.completed ? 'checked' : ''} 
            class="quest-checkbox w-5 h-5 accent-amber-500 rounded cursor-pointer pointer-events-auto">
          <div>
            <h3 class="quest-title font-semibold text-sm sm:text-base ${q.completed ? 'line-through text-gray-400' : 'text-gray-200'}">${safeText(q.title)}</h3>
            <p class="text-xs text-gray-400 mt-0.5">${safeText(q.category)} · ${safeText(q.type)}</p>
          </div>
        </div>
        <span class="quest-xp font-bold text-amber-500 text-sm sm:text-base pointer-events-none">+${Number(q.xp)} XP</span>
      `;

      // Event Listener Tunggal pada Card
      questCard.addEventListener("click", () => {
        toggleQuest(q.id);
      });

      questListContainer.appendChild(questCard);
    });

    // Update Progress Daily Quest
    const totalQuests = quests.length;
    const dailyPercent = totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0;
    
    if (dailyProgressText) {
      dailyProgressText.innerHTML = `${completedCount} dari ${totalQuests} quest selesai hari ini · <span class="text-amber-400">+${earnedXP} XP</span>`;
    }
    if (dailyProgressBar) {
      dailyProgressBar.style.width = `${dailyPercent}%`;
    }

    // Update Level & XP Sidebar
    const totalCurrentXP = baseUserXP + earnedXP;
    const levelPercent = Math.min((totalCurrentXP / xpPerLevel) * 100, 100);

    if (userXpText) {
      userXpText.innerText = `${totalCurrentXP.toLocaleString('id-ID')} / ${xpPerLevel.toLocaleString('id-ID')} XP menuju Level 13`;
    }
    if (levelProgressBar) {
      levelProgressBar.style.width = `${levelPercent}%`;
    }
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Real-time update jika data diubah dari tab/halaman lain
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      quests = loadQuests();
      renderQuests();
    }
  });

  // Load awal
  document.addEventListener("DOMContentLoaded", () => {
    quests = loadQuests();
    renderQuests();
  });
})();