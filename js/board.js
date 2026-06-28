// ===== BOARD.JS =====
// Handles rendering the tasks array onto the DOM as cards inside columns.
// No data logic here — only reads from `tasks` (tasks.js) and builds HTML.

/**
 * Formats an ISO date string (YYYY-MM-DD) into a readable format.
 * e.g. "2025-12-25" -> "Dec 25, 2025"
 */
function formatDate(isoDateString) {
  if (!isoDateString) return '';
  const date = new Date(isoDateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Builds the HTML string for a single task card.
 * @param {Object} task
 * @returns {string} HTML markup for the card
 */
function buildTaskCardHTML(task) {
  const overdue = isTaskOverdue(task);
  const isDone = task.column === 'done';

  // Description preview: first 60 characters + '...' if longer
  const descPreview = task.description
    ? (task.description.length > 60
        ? task.description.slice(0, 60) + '...'
        : task.description)
    : '';

  // Tags as pills
  const tagsHTML = task.tags.length
    ? `<div class="tags-list">${task.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('')}</div>`
    : '';

  // Arrow buttons hidden on edges (To Do has no left arrow, Done has no right arrow)
  const showLeftArrow = task.column !== 'todo';
  const showRightArrow = task.column !== 'done';

  return `
    <div class="task-card ${overdue ? 'overdue' : ''} ${isDone ? 'done' : ''}" data-id="${task.id}">
      <div class="card-title">${task.title}</div>
      <span class="priority-badge priority-${task.priority}">${task.priority}</span>
      ${overdue ? '<span class="overdue-badge">Overdue</span>' : ''}
      ${task.dueDate ? `<div class="due-date"><i class="fa-regular fa-calendar"></i> ${formatDate(task.dueDate)}</div>` : ''}
      ${tagsHTML}
      ${descPreview ? `<div class="card-description">${descPreview}</div>` : ''}
      <div class="card-actions">
        ${showLeftArrow ? `<button class="move-left-btn" data-id="${task.id}" aria-label="Move left"><i class="fa-solid fa-arrow-left"></i></button>` : ''}
        ${showRightArrow ? `<button class="move-right-btn" data-id="${task.id}" aria-label="Move right"><i class="fa-solid fa-arrow-right"></i></button>` : ''}
        <button class="edit-btn" data-id="${task.id}" aria-label="Edit task"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn" data-id="${task.id}" aria-label="Delete task"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `;
}

/**
 * Renders a list of tasks into a specific column's card-list container.
 * @param {string} column - 'todo' | 'inprogress' | 'done'
 * @param {Array} tasksToRender - filtered/sorted tasks for this column
 */
function renderColumn(column, tasksToRender) {
  const listContainer = document.getElementById(`list-${column}`);
  const countBadge = document.getElementById(`count-${column}`);

  if (!listContainer) return; // safety check

  // Edge case: empty column (no tasks, or all filtered out)
  if (tasksToRender.length === 0) {
    listContainer.innerHTML = `<p class="empty-state">No tasks here</p>`;
  } else {
    listContainer.innerHTML = tasksToRender.map(buildTaskCardHTML).join('');
  }

  if (countBadge) {
    countBadge.textContent = tasksToRender.length;
  }
}

/**
 * Renders the entire board: all three columns, using whatever tasks
 * are passed in (already filtered/sorted by filters.js).
 * Also triggers a stats update so everything stays in sync.
 * @param {Array} visibleTasks - the tasks to display (post filter/sort)
 */
function renderBoard(visibleTasks) {
  const todoTasks = visibleTasks.filter(task => task.column === 'todo');
  const inProgressTasks = visibleTasks.filter(task => task.column === 'inprogress');
  const doneTasks = visibleTasks.filter(task => task.column === 'done');

  renderColumn('todo', todoTasks);
  renderColumn('inprogress', inProgressTasks);
  renderColumn('done', doneTasks);

  // Keep the stats bar in sync every time the board re-renders
  if (typeof updateStats === 'function') {
    updateStats(tasks); // stats always reflect ALL tasks, not just visible/filtered ones
  }
}