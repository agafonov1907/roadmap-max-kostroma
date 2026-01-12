const data = [
  {
    id: "healthcare",
    title: "Роадмап сферы здравоохранения",
    milestones: [
      {
        title: "Обновление ЦОД",
        date: "2024-09",
        status: "progress",
        activities: [
          "Закупка оборудования",
          "Миграция сервисов"
        ]
      },
      {
        title: "Резервное копирование",
        date: "2025-02",
        status: "planned",
        activities: [
          "Разработка политики backup"
        ]
      }
    ]
  },
  {
    id: "housing",
    title: "Роадмап сферы ЖКХ",
    milestones: [
      {
        title: "Интеграция систем расчётов",
        date: "2025-03",
        status: "planned",
        activities: [
          "Анализ текущих платформ",
          "Выбор единой системы"
        ]
      },
      {
        title: "Подключение управляющих компаний",
        date: "2025-06",
        status: "planned",
        activities: [
          "Техническое подключение",
          "Обучение сотрудников"
        ]
      }
    ]
  }
];

const app = document.getElementById("app");

function renderDirections() {
  app.innerHTML = `
    <div class="directions">
      ${data.map(d => `
        <div class="direction-card" onclick="openDirection('${d.id}')">
          ${d.title}
        </div>
      `).join("")}
    </div>
  `;
}

function openDirection(id) {
  const direction = data.find(d => d.id === id);

  if (!direction) {
    console.error("Направление не найдено:", id);
    return;
  }

  app.innerHTML = `
    <button class="back" onclick="renderDirections()">← Назад</button>

    <div class="controls">
      <select id="statusFilter">
        <option value="">Все статусы</option>
        <option value="planned">Запланировано</option>
        <option value="progress">В работе</option>
        <option value="done">Завершено</option>
      </select>

      <input id="search" placeholder="Поиск..." />
    </div>

    <div class="timeline" id="timeline"></div>
  `;

  const timeline = document.getElementById("timeline");
  const statusFilter = document.getElementById("statusFilter");
  const search = document.getElementById("search");

  function render() {
    const status = statusFilter.value;
    const query = search.value.toLowerCase();

    timeline.innerHTML = direction.milestones
      .filter(m => !status || m.status === status)
      .filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.activities.some(a => a.toLowerCase().includes(query))
      )
      .map(m => `
        <div class="milestone">
          <div class="milestone-header">
            <strong>${m.title}</strong>
            <span class="status ${m.status}">
              ${m.status === "planned" ? "Запланировано" :
                m.status === "progress" ? "В работе" : "Завершено"}
            </span>
          </div>
          <div class="date">Срок: ${m.date}</div>
          <ul>
            ${m.activities.map(a => `<li>${a}</li>`).join("")}
          </ul>
        </div>
      `).join("");
  }

  statusFilter.onchange = render;
  search.oninput = render;
  render();
}

// Запуск отображения главного экрана
renderDirections();