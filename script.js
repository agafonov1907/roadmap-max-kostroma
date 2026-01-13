let data = [];

// Вспомогательная функция: преобразует "2024-06" → { year: 2024, month: 6 }
function parseDate(dateStr) {
  const [year, month] = dateStr.split('-').map(Number);
  return { year, month };
}

// Названия месяцев на русском
const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

async function loadData() {
  try {
    const response = await fetch('data.json');
    data = await response.json();
    renderDirections();
  } catch (error) {
    console.error('Ошибка загрузки data.json:', error);
    document.getElementById("app").innerHTML = '<div class="no-results">Не удалось загрузить данные</div>';
  }
}

const app = document.getElementById("app");

function renderDirections() {
  if (!data || data.length === 0) {
    app.innerHTML = '<div class="no-results">Нет данных для отображения</div>';
    return;
  }

  app.classList.add('fade-out');
  setTimeout(() => {
    app.innerHTML = `
      <div class="directions">
        ${data.map(d => `
          <div class="direction-card" onclick="openDirection('${d.id}')">
            ${d.title}
          </div>
        `).join("")}
      </div>
    `;
    app.classList.remove('fade-out');
  }, 300);
}

function openDirection(id) {
  const direction = data.find(d => d.id === id);
  if (!direction) {
    console.error("Направление не найдено:", id);
    return;
  }

  app.classList.add('fade-out');
  setTimeout(() => {
    app.innerHTML = `
      <button class="back" onclick="renderDirections()">← Назад</button>
      <div class="controls">
        <select id="statusFilter">
          <option value="">Все статусы</option>
          <option value="Не выполнено">Не выполнено</option>
          <option value="В работе">В работе</option>
          <option value="Выполнено">Выполнено</option>
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

      // Фильтрация этапов
      let filteredMilestones = direction.milestones
        .filter(m => !status || m.status === status)
        .filter(m =>
          m.title.toLowerCase().includes(query) ||
          m.activities.some(a =>
            a.title.toLowerCase().includes(query) ||
            (a.responsible && a.responsible.toLowerCase().includes(query))
          )
        );

      if (filteredMilestones.length === 0) {
        timeline.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        return;
      }

      // Группировка: год → месяц → этапы
      const grouped = {};
      filteredMilestones.forEach(m => {
        const { year, month } = parseDate(m.date);
        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) grouped[year][month] = [];
        grouped[year][month].push(m);
      });

      // Формирование HTML
      let html = '';
      Object.keys(grouped)
        .sort((a, b) => b - a) // Сначала новые года
        .forEach(year => {
          html += `<h2 class="year-header">${year}</h2>`;
          const months = grouped[year];
          Object.keys(months)
            .sort((a, b) => a - b) // Январь → Декабрь
            .forEach(monthNum => {
              const monthName = MONTHS_RU[parseInt(monthNum) - 1];
              html += `<h3 class="month-header">${monthName}</h3>`;
              months[monthNum].forEach(m => {
                html += `
                  <div class="milestone">
                    <div class="milestone-header">
                      <strong>${m.title}</strong>
                      <span class="status" data-status="${m.status}">
                        ${m.status}
                      </span>
                    </div>
                    <ul>
                      ${m.activities.map(a => `
                        <li>
                          ${a.title}
                          ${a.responsible ? `<span class="responsible">— ${a.responsible}</span>` : ''}
                        </li>
                      `).join("")}
                    </ul>
                  </div>
                `;
              });
            });
        });

      timeline.innerHTML = html;

      // Анимация появления (опционально)
      setTimeout(() => {
        timeline.querySelectorAll('.milestone').forEach(el => {
          el.classList.add('visible');
        });
      }, 10);
    }

    statusFilter.addEventListener('change', render);
    search.addEventListener('input', render);
    render();
    
    app.classList.remove('fade-out');
  }, 300);
}

// Запуск
loadData();