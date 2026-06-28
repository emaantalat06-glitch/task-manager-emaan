// ===== STORAGE.JS =====
// Handles ALL reading/writing to localStorage.
// No other file should touch localStorage directly — they call these functions.

const STORAGE_KEY = 'kanbanTasks';
const THEME_KEY = 'kanbanTheme';

/**
 * Saves the full tasks array to localStorage.
 * Called every time tasks are added, edited, moved, or deleted.
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

/**
 * Loads tasks from localStorage.
 * Returns an empty array if nothing is stored yet (first-time load edge case).
 */
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}

/**
 * Saves the current theme ('dark' or 'light') to localStorage.
 */
function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Loads the saved theme. Defaults to 'light' if nothing is stored.
 */
function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}