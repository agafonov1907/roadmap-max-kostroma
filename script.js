const app = document.getElementById("app");

async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Не удалось загрузить data.json");
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    app.innerHTML = "<p style='color:white; padding:20px;'>Ошибка загрузки дорожной карты.</p>";
    return [];
  }
}

function renderDirections(data) {
  app.innerHTML = `
    <div class="directions">
      ${data.map(d => `
        <div class="direction-card" data-id="${d.id}">
          ${d.title}
        </div>
      `).join("")}
    </div>
  `;

  // Назначаем обработчики через addEventListener (без onclick в HTML)
  document.querySelectorAll(".direction-card").forEach(card => {
    card.addEventListener("click", () => {
      openDirection(card.dataset.id, data);
    });
  });
}

function openDirection(id, fullData) {
  const direction = fullData.find(d => d.id === id);
  if (!direction) {
    console.error("Направление не найдено:", id);
    return;
  }

  app.innerHTML = `
    <button class="back">← Назад</button>

    <div class="controls">
      <select id="statusFilter">
        <option value="">Все статусы</option>
        <option value="planned">Запланировано</option>
        <option value="progress">В работе</option>
        <option value="done">Завершено</option>
      </select>
      <input id="search" placeholder="Поиск по задачам или ответственным..." />
    </div>

    <div class="timeline" id="timeline"></div>
  `;

  // Обработчик "Назад"
  document.querySelector(".back").addEventListener("click", () => {
    renderDirections(fullData);
  });

  const timeline = document.getElementById("timeline");
  const statusFilter = document.getElementById("statusFilter");
  const search = document.getElementById("search");

  function render() {
    const status = statusFilter.value;
    const query = search.value.trim().toLowerCase();

    const filtered = direction.milestones
      .filter(m => !status || m.status === status)
      .filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.responsible.toLowerCase().includes(query) ||
        m.activities.some(a => a.toLowerCase().includes(query))
      );

    if (filtered.length === 0) {
      timeline.innerHTML = "<p class='no-results'>Ничего не найдено.</p>";
      return;
    }

    timeline.innerHTML = filtered.map(m => `
      <div class="milestone">
        <div class="milestone-header">
          <strong>${m.title}</strong>
          <span class="status ${m.status}">
            ${m.status === "planned" ? "Запланировано" :
              m.status === "progress" ? "В работе" : "Завершено"}
          </span>
        </div>
        <div class="date">Срок: ${m.date}</div>
        <div class="responsible">Ответственный: ${m.responsible}</div>
        <ul>
          ${m.activities.map(a => `<li>${a}</li>`).join("")}
        </ul>
      </div>
    `).join("");
  }

  statusFilter.addEventListener("change", render);
  search.addEventListener("input", render);
  render();
}

// Запуск приложения
loadData().then(data => {
  renderDirections(data);
});