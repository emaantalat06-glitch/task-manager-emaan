// ===== FILTERS.JS =====
// Handles search, priority filtering, and sorting — all working together.
// Reads from the global `tasks` array (tasks.js) and returns a filtered/sorted copy.
// Never mutates the original `tasks` array.

/**
 * Returns the tasks that should currently be visible on the board,
 * after applying search, priority filter, and sort — all at once.
 * This is the single function app.js/board.js call to get display-ready data.
 * @returns {Array} filtered + sorted tasks
 */
function getVisibleTasks() {
  const searchTerm = getSearchTerm();
  const priority = getPriorityFilterValue();
  const sortOption = getSortValue();

  let result = tasks;

  // 1. Apply search filter (title only, case-insensitive)
  if (searchTerm) {
    result = result.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // 2. Apply priority filter
  if (priority && priority !== 'all') {
    result = result.filter(task => task.priority === priority);
  }

  // 3. Apply sort (returns a NEW array, doesn't mutate `result`)
  result = sortTasks(result, sortOption);

  return result;
}

/**
 * Reads the current value of the search input.
 * @returns {string}
 */
function getSearchTerm() {
  const input = document.getElementById('search-input');
  return input ? input.value.trim() : '';
}

/**
 * Reads the current value of the priority filter dropdown.
 * @returns {string} 'all' | 'high' | 'medium' | 'low'
 */
function getPriorityFilterValue() {
  const select = document.getElementById('priority-filter');
  return select ? select.value : 'all';
}

/**
 * Reads the current value of the sort dropdown.
 * @returns {string} 'default' | 'dueDate' | 'priority' | 'createdAt'
 */
function getSortValue() {
  const select = document.getElementById('sort-select');
  return select ? select.value : 'default';
}

/**
 * Sorts a list of tasks based on the chosen sort option.
 * Returns a NEW sorted array (does not mutate the input).
 * @param {Array} taskList
 * @param {string} sortOption
 * @returns {Array}
 */
function sortTasks(taskList, sortOption) {
  // Always work on a copy so the original array order is never mutated
  const sorted = [...taskList];

  if (sortOption === 'dueDate') {
    // Soonest due date first. Tasks with no due date go to the end.
    sorted.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (sortOption === 'priority') {
    // High first, then Medium, then Low
    const priorityRank = { high: 0, medium: 1, low: 2 };
    sorted.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  } else if (sortOption === 'createdAt') {
    // Newest created first
    sorted.sort((a, b) => b.createdAt - a.createdAt);
  }
  // 'default' (or any unrecognized value) returns the list in original order

  return sorted;
}