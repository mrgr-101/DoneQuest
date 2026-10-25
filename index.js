// Data Awal Quest
let quests = [
  { title: "Read 20 pages", category: "Reading", type: "Harian", xp: 50, completed: true },
  { title: "Exercise 30 min", category: "Fitness", type: "Harian", xp: 100, completed: true },
  { title: "Learn English", category: "Learning", type: "Harian", xp: 75, completed: false },
  { title: "Drink 2L water", category: "Health", type: "Harian", xp: 30, completed: true }
];

let baseUserXP = 2660; // Total XP dasar sebelum quest hari ini
const xpPerLevel = 3200;

// Referensi Elemen DOM
const questListContainer = document.getElementById("questList");
const dailyProgressText = document.getElementById("dailyProgressText");
const dailyProgressBar = document.getElementById("dailyProgressBar");
const userXpText = document.getElementById("userXpText");
const levelProgressBar = document.getElementById("levelProgressBar");

// Referensi Elemen Modal
const questModal = document.getElementById("questModal");
const modalContent = document.getElementById("modalContent");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

// Fungsi Toggle Status Quest (Selesai / Belum Selesai)
function toggleQuest(index) {
  quests[index].completed = !quests[index].completed;
  renderQuests();
}

// Fungsi Render Daftar Quest & Update UI
function renderQuests() {
  if (!questListContainer) return;
  questListContainer.innerHTML = "";

  let completedCount = 0;
  let earnedXP = 0;

  quests.forEach((q, idx) => {
    if (q.completed) {
      completedCount++;
      earnedXP += q.xp;
    }

    const questCard = document.createElement("div");
    questCard.className = `quest-item bg-[#192338] hover:bg-[#1e2b45] transition-colors rounded-xl p-4 sm:p-4.5 flex items-center justify-between border border-gray-800/60 cursor-pointer`;
    questCard.onclick = () => toggleQuest(idx);

    questCard.innerHTML = `
      <div class="flex items-center space-x-4">
        <input type="checkbox" ${q.completed ? 'checked' : ''} onclick="event.stopPropagation(); toggleQuest(${idx})" class="quest-checkbox w-5 h-5 accent-amber-500 rounded cursor-pointer">
        <div>
          <h3 class="quest-title font-semibold text-sm sm:text-base ${q.completed ? 'line-through text-gray-400' : 'text-gray-200'}">${q.title}</h3>
          <p class="text-xs text-gray-400 mt-0.5">${q.category} · ${q.type}</p>
        </div>
      </div>
      <span class="quest-xp font-bold text-amber-500 text-sm sm:text-base">+${q.xp} XP</span>
    `;

    questListContainer.appendChild(questCard);
  });

  // Update UI Progress Harian
  const totalQuests = quests.length;
  const dailyPercent = totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0;
  
  if (dailyProgressText) {
    dailyProgressText.innerHTML = `${completedCount} dari ${totalQuests} quest selesai hari ini · <span class="text-amber-400">+${earnedXP} XP</span>`;
  }
  if (dailyProgressBar) {
    dailyProgressBar.style.width = `${dailyPercent}%`;
  }

  // Update UI XP & Level Sidebar
  const totalCurrentXP = baseUserXP + earnedXP;
  const levelPercent = Math.min((totalCurrentXP / xpPerLevel) * 100, 100);
  
  if (userXpText) {
    userXpText.innerText = `${totalCurrentXP.toLocaleString('id-ID')} / ${xpPerLevel.toLocaleString('id-ID')} XP menuju Level 13`;
  }
  if (levelProgressBar) {
    levelProgressBar.style.width = `${levelPercent}%`;
  }
}

// Fungsi Kontrol Modal
function openModal() {
  if (!questModal || !modalContent) return;
  questModal.classList.remove("hidden");
  setTimeout(() => {
    modalContent.classList.remove("scale-95", "opacity-0");
    modalContent.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeModal() {
  if (!questModal || !modalContent) return;
  modalContent.classList.remove("scale-100", "opacity-100");
  modalContent.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    questModal.classList.add("hidden");
  }, 200);
}

// Fungsi Tambah Custom Quest Baru
function addCustomQuest(e) {
  e.preventDefault();
  const title = document.getElementById("questTitleInput").value;
  const category = document.getElementById("questCategoryInput").value;
  const xp = parseInt(document.getElementById("questXpInput").value) || 50;

  quests.push({
    title: title,
    category: category,
    type: "Harian",
    xp: xp,
    completed: false
  });

  document.getElementById("addQuestForm").reset();
  closeModal();
  renderQuests();
}

// Event Listeners
if (openModalBtn) openModalBtn.addEventListener("click", openModal);
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

if (questModal) {
  questModal.addEventListener("click", (e) => {
    if (e.target === questModal) closeModal();
  });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  renderQuests();
});