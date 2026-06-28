// ===== APP.JS =====
// Main entry point. Initializes the app on page load:
// loads tasks, applies saved theme, renders the board, and wires up
// all event listeners (delegated where possible).

/**
 * Runs once when the DOM is fully loaded.
 * This is the single startup sequence for the whole app.
 */
function initApp() {
  // 1. Load tasks from localStorage into the in-memory `tasks` array
  initializeTasks();

  // 2. Apply saved theme (dark/light) immediately
  applyTheme(loadTheme());

  // 3. Render the board for the first time (no filters active yet)
  refreshBoard();

  // 4. Wire up all event listeners
  setupHeaderListeners();
  setupBoardListeners();
  setupFilterListeners();
}

/**
 * Re-runs the filter/sort pipeline and re-renders the board.
 * Call this any time tasks change (create, edit, delete, move)
 * or filters/search/sort change.
 */
function refreshBoard() {
  const visibleTasks = getVisibleTasks(); // from filters.js
  renderBoard(visibleTasks);              // from board.js
}

/**
 * Applies the given theme ('dark' or 'light') to the page.
 * @param {string} theme
 */
function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  // Update the toggle button icon (moon for light mode, sun for dark mode)
  const themeIcon = document.querySelector('#theme-toggle-btn i');
  if (themeIcon) {
    themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

/**
 * Toggles between dark and light mode, saving the new preference.
 */
function toggleTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  saveTheme(newTheme);
}

/**
 * Sets up listeners for header buttons (theme toggle, add task).
 */
function setupHeaderListeners() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  const addTaskBtn = document.getElementById('add-task-btn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => openTaskModal('create'));
  }
}

/**
 * Sets up ONE delegated click listener on the board for all card actions
 * (edit, delete, move left, move right). This avoids attaching separate
 * listeners to every single card, which would break after re-renders.
 */
function setupBoardListeners() {
  const board = document.querySelector('.board');
  if (!board) return;

  board.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.edit-btn');
    const deleteBtn = event.target.closest('.delete-btn');
    const leftBtn = event.target.closest('.move-left-btn');
    const rightBtn = event.target.closest('.move-right-btn');

    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      openTaskModal('edit', id);
    } else if (deleteBtn) {
      const id = Number(deleteBtn.dataset.id);
      openDeleteConfirm(id);
    } else if (leftBtn) {
      const id = Number(leftBtn.dataset.id);
      moveTaskLeft(id);
    } else if (rightBtn) {
      const id = Number(rightBtn.dataset.id);
      moveTaskRight(id);
    }
  });
}

/**
 * Moves a task one column to the left (done -> inprogress -> todo).
 */
function moveTaskLeft(id) {
  const task = findTaskById(id);
  if (!task) return;

  const order = ['todo', 'inprogress', 'done'];
  const currentIndex = order.indexOf(task.column);
  if (currentIndex > 0) {
    moveTask(id, order[currentIndex - 1]);
    refreshBoard();
  }
}

/**
 * Moves a task one column to the right (todo -> inprogress -> done).
 */
function moveTaskRight(id) {
  const task = findTaskById(id);
  if (!task) return;

  const order = ['todo', 'inprogress', 'done'];
  const currentIndex = order.indexOf(task.column);
  if (currentIndex < order.length - 1) {
    moveTask(id, order[currentIndex + 1]);
    refreshBoard();
  }
}

/**
 * Sets up listeners for the search/filter/sort controls bar.
 */
function setupFilterListeners() {
  const searchInput = document.getElementById('search-input');
  const priorityFilter = document.getElementById('priority-filter');
  const sortSelect = document.getElementById('sort-select');
  const clearBtn = document.getElementById('clear-filters-btn');

  if (searchInput) {
    searchInput.addEventListener('input', refreshBoard);
  }
  if (priorityFilter) {
    priorityFilter.addEventListener('change', refreshBoard);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', refreshBoard);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (priorityFilter) priorityFilter.value = 'all';
      if (sortSelect) sortSelect.value = 'default';
      refreshBoard();
    });
  }
}

// ===== STARTUP =====
// Wait for the DOM to be ready, then initialize everything.
document.addEventListener('DOMContentLoaded', initApp);