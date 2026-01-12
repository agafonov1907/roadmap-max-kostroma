const data = [
  {
    id: "digital",
    title: "Цифровые госуслуги",
    milestones: [
      {
        title: "Единый портал услуг",
        date: "2024-06",
        status: "done",
        activities: [
          "Запуск MVP портала",
          "Интеграция базовых услуг"
        ]
      },
      {
        title: "Мобильное приложение",
        date: "2024-12",
        status: "progress",
        activities: [
          "UX/UI дизайн",
          "Бета-тестирование"
        ]
      }
    ]
  },
  {
    id: "infra",
    title: "Инфраструктура",
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
    id: "security",
    title: "Кибербезопасность",
    milestones: [
      {
        title: "SOC центр",
        date: "2024-08",
        status: "done",
        activities: [
          "Набор команды",
          "Внедрение SIEM"
        ]
      },
      {
        title: "Обучение сотрудников",
        date: "2025-01",
        status: "planned",
        activities: [
          "Фишинг-симуляции",
          "Онлайн-курсы"
        ]
      }
    ]
  }
];

function formatMonthYear(dateStr) {
  const [year, month] = dateStr.split('-');
  const months = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

const app = document.getElementById("app");

function renderDirections() {
  app.innerHTML = `
    <div class="directions">
      ${data.map(d => `
        <button type="button" class="direction-card" onclick="openDirection('${d.id}')">
          <strong>${d.title}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function openDirection(id) {
  const direction = data.find(d => d.id === id);
  if (!direction) return;

  history.pushState({ view: 'direction', id }, '', `#${id}`);

  app.innerHTML = `
    <button class="back" onclick="goBack()">← Назад</button>

    <div class="controls">
      <select id="statusFilter">
        <option value="">Все статусы</option>
        <option value="planned">Запланировано</option>
        <option value="progress">В работе</option>
        <option value="done">Завершено</option>
      </select>

      <input id="search" placeholder="Поиск по задачам..." />
    </div>

    <div class="timeline" id="timeline"></div>
  `;

  const timeline = document.getElementById("timeline");
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("search");

  const sortedMilestones = [...direction.milestones].sort((a, b) => a.date.localeCompare(b.date));

  function renderMilestones() {
    const status = statusFilter.value;
    const query = searchInput.value.trim().toLowerCase();

    const filtered = sortedMilestones
      .filter(m => !status || m.status === status)
      .filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.activities.some(a => a.toLowerCase().includes(query))
      );

    if (filtered.length === 0) {
      timeline.innerHTML = `<div class="empty-state">Ничего не найдено</div>`;
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
        <div class="date">Срок: ${formatMonthYear(m.date)}</div>
        <ul>
          ${m.activities.map(a => `<li>${a}</li>`).join("")}
        </ul>
      </div>
    `).join("");
  }

  statusFilter.addEventListener('change', renderMilestones);
  searchInput.addEventListener('input', renderMilestones);

  renderMilestones();
}

function goBack() {
  history.back();
}

window.addEventListener('popstate', (event) => {
  if (event.state?.view === 'direction') {
    openDirection(event.state.id);
  } else {
    renderDirections();
  }
});

// Инициализация при загрузке
if (window.location.hash) {
  const id = window.location.hash.slice(1);
  const dir = data.find(d => d.id === id);
  if (dir) {
    openDirection(id);
    return;
  }
}
renderDirections();