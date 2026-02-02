let employees = [];

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
        <input id="search" placeholder="Поиск по задачам..." />
      </div>
      <div class="kanban-board" id="kanbanBoard"></div>
    `;

    const kanbanBoard = document.getElementById("kanbanBoard");
    const searchInput = document.getElementById("search");

    function render() {
      const query = searchInput.value.toLowerCase();

      // Фильтрация задач
      const filteredTasks = emp.tasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.activities.some(a =>
          a.title.toLowerCase().includes(query) ||
          a.responsible.toLowerCase().includes(query)
        )
      );

      // Группировка по статусу
      const columns = {
        "Не выполнено": [],
        "В работе": [],
        "Выполнено": []
      };

      filteredTasks.forEach(task => {
        if (columns[task.status]) {
          columns[task.status].push(task);
        }
      });

      // Рендер колонок
      kanbanBoard.innerHTML = Object.entries(columns).map(([status, tasks]) => `
        <div class="kanban-column">
          <div class="column-header" data-status="${status}">${status} (${tasks.length})</div>
          ${tasks.map(t => `
            <div class="task-card">
              <div class="task-title">${t.title}</div>
              ${t.deadline ? `<div class="deadline">Дедлайн: ${t.deadline}</div>` : ''}
              ${t.link ? `<a href="${t.link}" target="_blank" class="task-link">📎 Ссылка</a>` : ''}
              <ul>
                ${t.activities.map(a => `
                  <li>
                    ${a.title}
                    ${a.deadline ? `<div class="activity-deadline">До: ${a.deadline}</div>` : ''}
                    ${a.responsible ? `<span class="responsible">— ${a.responsible}</span>` : ''}
                  </li>
                `).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      `).join("");

      // Анимация появления
      setTimeout(() => {
        kanbanBoard.querySelectorAll('.task-card').forEach((el, i) => {
          el.style.transitionDelay = `${i * 50}ms`;
          el.classList.add('visible');
        });
      }, 10);
    }

    searchInput.addEventListener('input', render);
    render();
    app.classList.remove('fade-out');
  }, 300);
}

loadData();