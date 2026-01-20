let employees = [];

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

async function loadData() {
  try {
    const res = await fetch('data.json');
    employees = await res.json();
    renderEmployeeCards();
  } catch (e) {
    console.error(e);
    document.getElementById("app").innerHTML = '<div class="no-results">Ошибка загрузки</div>';
  }
}

function parseDate(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return { year: y, month: m };
}

function getLoadClass(inProgressCount) {
  if (inProgressCount >= 3) return 'load-high';
  if (inProgressCount >= 1) return 'load-medium';
  return 'load-low';
}

function renderEmployeeCards() {
  const app = document.getElementById("app");
  if (!employees.length) {
    app.innerHTML = '<div class="no-results">Нет данных</div>';
    return;
  }

  app.classList.add('fade-out');
  setTimeout(() => {
    const cards = employees.map(emp => {
      const k = emp.kpi;
      const loadClass = getLoadClass(k.in_progress);

      return `
        <div class="employee-card ${loadClass}" onclick="openEmployee('${emp.id}')">
          <strong>${emp.name}</strong>
          <div class="kpi-summary">
            Всего: ${k.total} • В работе: ${k.in_progress}<br>
            На неделе: ${k.this_week} • В месяце: ${k.this_month}
          </div>
        </div>
      `;
    }).join('');

    app.innerHTML = `<div class="employee-cards">${cards}</div>`;
    app.classList.remove('fade-out');
  }, 300);
}

function openEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  const app = document.getElementById("app");
  app.classList.add('fade-out');
  setTimeout(() => {
    app.innerHTML = `
      <button class="back" onclick="renderEmployeeCards()">← Назад</button>
      <div class="controls">
        <select id="statusFilter">
          <option value="">Все статусы</option>
          <option value="Не выполнено">Не выполнено</option>
          <option value="В работе">В работе</option>
          <option value="Выполнено">Выполнено</option>
        </select>
        <input id="search" placeholder="Поиск по задачам..." />
      </div>
      <div class="timeline" id="timeline"></div>
    `;

    const timeline = document.getElementById("timeline");
    const statusFilter = document.getElementById("statusFilter");
    const search = document.getElementById("search");

    function render() {
      let tasks = emp.tasks;
      const status = statusFilter.value;
      const query = search.value.toLowerCase();

      if (status) tasks = tasks.filter(t => t.status === status);
      if (query) {
        tasks = tasks.filter(t =>
          t.title.toLowerCase().includes(query) ||
          t.activities.some(a =>
            a.title.toLowerCase().includes(query) ||
            a.responsible.toLowerCase().includes(query)
          )
        );
      }

      if (tasks.length === 0) {
        timeline.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        return;
      }

      const grouped = {};
      tasks.forEach(t => {
        const { year, month } = parseDate(t.date);
        if (!grouped[year]) grouped[year] = {};
        if (!grouped[year][month]) grouped[year][month] = [];
        grouped[year][month].push(t);
      });

      let html = '';
      Object.keys(grouped).sort((a, b) => b - a).forEach(year => {
        html += `<h2 class="year-header">${year}</h2>`;
        Object.keys(grouped[year]).sort((a, b) => a - b).forEach(m => {
          html += `<h3 class="month-header">${MONTHS_RU[parseInt(m)-1]}</h3>`;
          grouped[year][m].forEach(t => {
            const deadlineHtml = t.deadline ? `<div class="deadline">Дедлайн: ${t.deadline}</div>` : '';
            const linkHtml = t.link ? `<a href="${t.link}" target="_blank" class="task-link">📎 Ссылка</a>` : '';
            html += `
              <div class="task">
                <div class="task-header">
                  <strong>${t.title}</strong>
                  <span class="status" data-status="${t.status}">${t.status}</span>
                </div>
                ${deadlineHtml}
                ${linkHtml}
                <ul>
                  ${t.activities.map(a => `
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

      setTimeout(() => {
        timeline.querySelectorAll('.task').forEach(el => el.classList.add('visible'));
      }, 10);
    }

    statusFilter.addEventListener('change', render);
    search.addEventListener('input', render);
    render();
    app.classList.remove('fade-out');
  }, 300);
}

loadData();