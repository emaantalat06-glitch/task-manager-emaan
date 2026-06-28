// ===== UI.JS =====
// Handles the task creation/edit modal and the custom delete confirmation dialog.
// All DOM injection for these UI pieces lives here.

let currentEditId = null; // null = create mode, otherwise = id of task being edited
let currentTags = [];      // tags currently in the open form, before save

/**
 * Opens the task modal in either 'create' or 'edit' mode.
 * @param {string} mode - 'create' | 'edit'
 * @param {number|null} taskId - required if mode is 'edit'
 */
function openTaskModal(mode, taskId = null) {
  currentEditId = mode === 'edit' ? taskId : null;
  const existingTask = mode === 'edit' ? findTaskById(taskId) : null;
  currentTags = existingTask ? [...existingTask.tags] : [];

  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = buildModalHTML(mode, existingTask);

  setupModalListeners();
}

/**
 * Builds the HTML for the task form modal.
 * @param {string} mode
 * @param {Object|null} task - existing task data when editing
 * @returns {string}
 */
function buildModalHTML(mode, task) {
  const title = task ? task.title : '';
  const description = task ? task.description : '';
  const priority = task ? task.priority : 'medium';
  const dueDate = task ? task.dueDate : '';
  const column = task ? task.column : 'todo';

  return `
    <div class="modal-overlay" id="task-modal-overlay">
      <div class="modal-box">
        <h2>${mode === 'edit' ? 'Edit Task' : 'New Task'}</h2>
        <form id="task-form">
          <div class="form-group">
            <label for="task-title">Title</label>
            <input type="text" id="task-title" value="${escapeHTML(title)}">
            <div class="error-text" id="error-title"></div>
          </div>

          <div class="form-group">
            <label for="task-description">Description</label>
            <textarea id="task-description" rows="3">${escapeHTML(description)}</textarea>
          </div>

          <div class="form-group">
            <label for="task-priority">Priority</label>
            <select id="task-priority">
              <option value="high" ${priority === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${priority === 'low' ? 'selected' : ''}>Low</option>
            </select>
          </div>

          <div class="form-group">
            <label for="task-due-date">Due Date</label>
            <input type="date" id="task-due-date" min="${getTodayISO()}" value="${dueDate || ''}">
          </div>

          <div class="form-group">
            <label for="task-tags-input">Tags</label>
            <input type="text" id="task-tags-input" placeholder="Type a tag and press Enter">
            <div class="tags-list" id="tags-preview">${renderTagPills(currentTags)}</div>
          </div>

          <div class="form-group">
            <label for="task-column">Column</label>
            <select id="task-column">
              <option value="todo" ${column === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="inprogress" ${column === 'inprogress' ? 'selected' : ''}>In Progress</option>
              <option value="done" ${column === 'done' ? 'selected' : ''}>Done</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" id="cancel-modal-btn" class="btn-secondary">Cancel</button>
            <button type="submit" id="save-task-btn" class="btn-primary">
              ${mode === 'edit' ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Renders the current tags as removable pills inside the modal.
 * @param {Array<string>} tagList
 * @returns {string}
 */
function renderTagPills(tagList) {
  return tagList
    .map((tag, index) => `
      <span class="tag-pill">
        ${escapeHTML(tag)}
        <button type="button" class="remove-tag-btn" data-index="${index}" aria-label="Remove tag">&times;</button>
      </span>
    `)
    .join('');
}

/**
 * Wires up all listeners inside the open modal (submit, cancel, tags, overlay click).
 */
function setupModalListeners() {
  const overlay = document.getElementById('task-modal-overlay');
  const form = document.getElementById('task-form');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const tagsInput = document.getElementById('task-tags-input');
  const tagsPreview = document.getElementById('tags-preview');

  form.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', closeTaskModal);

  // Close modal if clicking the dark overlay itself (not the box)
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeTaskModal();
  });

  // Add a tag when pressing Enter in the tags input
  tagsInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newTag = tagsInput.value.trim();
      if (newTag && !currentTags.includes(newTag)) {
        currentTags.push(newTag);
        tagsPreview.innerHTML = renderTagPills(currentTags);
        tagsInput.value = '';
      }
    }
  });

  // Remove a tag when its pill's × button is clicked
  tagsPreview.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.remove-tag-btn');
    if (removeBtn) {
      const index = Number(removeBtn.dataset.index);
      currentTags.splice(index, 1);
      tagsPreview.innerHTML = renderTagPills(currentTags);
    }
  });
}

/**
 * Validates and submits the task form. Shows inline errors if invalid.
 * @param {Event} event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const titleInput = document.getElementById('task-title');
  const title = titleInput.value.trim();
  const errorTitle = document.getElementById('error-title');

  // Validation: title required, minimum 3 characters
  if (title.length < 3) {
    errorTitle.textContent = 'Title must be at least 3 characters.';
    return;
  }
  errorTitle.textContent = '';

  const taskData = {
    title: title,
    description: document.getElementById('task-description').value.trim(),
    priority: document.getElementById('task-priority').value,
    dueDate: document.getElementById('task-due-date').value || null,
    tags: [...currentTags],
    column: document.getElementById('task-column').value
  };

  if (currentEditId) {
    updateTask(currentEditId, taskData);
  } else {
    createTask(taskData);
  }

  closeTaskModal();
  refreshBoard();
}

/**
 * Closes and clears the task modal.
 */
function closeTaskModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = '';
  currentEditId = null;
  currentTags = [];
}

// ===== DELETE CONFIRMATION DIALOG =====

let pendingDeleteId = null;

/**
 * Opens a custom confirmation dialog before deleting a task.
 * @param {number} taskId
 */
function openDeleteConfirm(taskId) {
  pendingDeleteId = taskId;
  const container = document.getElementById('confirm-dialog-container');

  container.innerHTML = `
    <div class="modal-overlay" id="confirm-overlay">
      <div class="modal-box">
        <h2>Delete Task?</h2>
        <p>This action cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" id="cancel-delete-btn" class="btn-secondary">Cancel</button>
          <button type="button" id="confirm-delete-btn" class="btn-primary">Delete</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteConfirm);
  document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);

  document.getElementById('confirm-overlay').addEventListener('click', (event) => {
    if (event.target.id === 'confirm-overlay') closeDeleteConfirm();
  });
}

/**
 * Executes the deletion after user confirms.
 */
function confirmDelete() {
  if (pendingDeleteId !== null) {
    deleteTask(pendingDeleteId);
    refreshBoard();
  }
  closeDeleteConfirm();
}

/**
 * Closes the delete confirmation dialog without deleting.
 */
function closeDeleteConfirm() {
  document.getElementById('confirm-dialog-container').innerHTML = '';
  pendingDeleteId = null;
}

// ===== SMALL HELPERS =====

/**
 * Returns today's date as an ISO string (YYYY-MM-DD), used as the
 * minimum allowed value for the due date picker (no past dates).
 */
function getTodayISO() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Escapes HTML special characters to prevent broken markup or injection
 * when inserting user-typed text (title, description, tags) into innerHTML.
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}