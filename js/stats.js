// ===== STATS.JS =====
// Calculates and renders the dashboard statistics bar.
// Always operates on the FULL tasks array (not the filtered/visible ones),
// since stats should reflect the true state of the board, not the current filter.

/**
 * Recalculates and updates all stats bar values in the DOM.
 * Called every time tasks change (create, edit, delete, move) via app.js.
 * @param {Array} allTasks - the full tasks array (unfiltered)
 */
function updateStats(allTasks) {
  const total = allTasks.length;
  const inProgress = allTasks.filter(task => task.column === 'inprogress').length;
  const completed = allTasks.filter(task => task.column === 'done').length;
  const overdue = allTasks.filter(task => isTaskOverdue(task)).length;

  // Completion % = (Done / Total) * 100, guarding against divide-by-zero
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  renderStatValue('stat-total', total);
  renderStatValue('stat-inprogress', inProgress);
  renderStatValue('stat-completed', completed);
  renderStatValue('stat-overdue', overdue);
  renderStatValue('stat-completion-percent', `${completionPercent}%`);

  // Highlight overdue count in red if greater than 0
  const overdueElement = document.getElementById('stat-overdue');
  if (overdueElement) {
    overdueElement.classList.toggle('has-overdue', overdue > 0);
  }

  // Update the progress bar fill width
  const progressFill = document.getElementById('completion-progress-fill');
  if (progressFill) {
    progressFill.style.width = `${completionPercent}%`;
  }
}

/**
 * Helper to safely set text content on a stat element by ID.
 * @param {string} elementId
 * @param {string|number} value
 */
function renderStatValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}