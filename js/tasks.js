// ===== TASKS.JS =====
// Pure data-manipulation functions for the tasks array.
// No DOM code here — only array/object logic (create, update, delete, find).

// The in-memory array of all tasks. This is the single source of truth
// while the app is running; it gets synced to localStorage via storage.js.
let tasks = [];

/**
 * Generates a unique ID for a new task using the current timestamp.
 * Date.now() is unique enough for this app's purposes (per spec).
 */
function generateTaskId() {
  return Date.now();
}

/**
 * Creates a new task object and adds it to the tasks array.
 * @param {Object} taskData - { title, description, priority, column, dueDate, tags }
 * @returns {Object} the newly created task
 */
function createTask(taskData) {
  const newTask = {
    id: generateTaskId(),
    title: taskData.title,
    description: taskData.description || '',
    priority: taskData.priority,       // 'high' | 'medium' | 'low'
    column: taskData.column,           // 'todo' | 'inprogress' | 'done'
    dueDate: taskData.dueDate || null, // ISO date string YYYY-MM-DD
    tags: taskData.tags || [],
    createdAt: Date.now()
  };

  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

/**
 * Finds a single task by its ID.
 * @param {number} id
 * @returns {Object|undefined}
 */
function findTaskById(id) {
  return tasks.find(task => task.id === id);
}

/**
 * Updates an existing task with new field values.
 * @param {number} id - the task's unique ID
 * @param {Object} updates - fields to overwrite (title, description, etc.)
 * @returns {Object|null} the updated task, or null if not found
 */
function updateTask(id, updates) {
  const task = findTaskById(id);
  if (!task) {
    console.warn(`updateTask: no task found with id ${id}`);
    return null;
  }

  // Merge updates into the existing task object
  Object.assign(task, updates);
  saveTasks(tasks);
  return task;
}

/**
 * Moves a task to a different column ('todo' | 'inprogress' | 'done').
 * @param {number} id
 * @param {string} newColumn
 */
function moveTask(id, newColumn) {
  return updateTask(id, { column: newColumn });
}

/**
 * Deletes a task by ID.
 * @param {number} id
 * @returns {boolean} true if a task was removed, false if not found
 */
function deleteTask(id) {
  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);

  if (tasks.length === initialLength) {
    console.warn(`deleteTask: no task found with id ${id}`);
    return false;
  }

  saveTasks(tasks);
  return true;
}

/**
 * Checks if a task is overdue.
 * A task is overdue if its due date has passed AND it's not in the Done column.
 * @param {Object} task
 * @returns {boolean}
 */
function isTaskOverdue(task) {
  if (!task.dueDate || task.column === 'done') return false;

  // Compare dates only (ignore time-of-day) to avoid timezone edge cases
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

/**
 * Returns all tasks belonging to a specific column.
 * @param {string} column
 */
function getTasksByColumn(column) {
  return tasks.filter(task => task.column === column);
}

/**
 * Initializes the tasks array from localStorage on app startup.
 * Call this once, early in app.js.
 */
function initializeTasks() {
  tasks = loadTasks();
}