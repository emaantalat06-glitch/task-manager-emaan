# Kanban Task Manager

A Kanban-style task management board built with **HTML, CSS, and vanilla JavaScript** — no frameworks, no backend. Tasks are fully persistent across page reloads using localStorage, inspired by tools like Trello and Jira.

## Live Demo
# Kanban Task Manager

A Kanban-style task management board built with **HTML, CSS, and vanilla JavaScript** — no frameworks, no backend. Tasks are fully persistent across page reloads using localStorage, inspired by tools like Trello and Jira.

## Live Demo


## Video Walkthrough


## Features
- Create, edit, and delete tasks with full form validation (no browser alerts — all custom inline UI)
- Three-column board: To Do, In Progress, Done
- Priority levels (High, Medium, Low) with color-coded badges
- Due dates with overdue detection (red badge + red border)
- Tags system — add/remove multiple tags per task
- Move tasks between columns using arrow buttons
- "Done" tasks get a visual treatment (strikethrough title, checkmark, greyed card)
- Search, priority filter, and sort — all work together simultaneously
- Live dashboard statistics bar (Total, In Progress, Completed, Overdue, Completion %)
- Dark / Light mode toggle, saved across sessions
- Fully responsive — desktop, tablet, and mobile layouts
- Custom delete confirmation dialog (no browser confirm())
- All data persists in localStorage

## Technologies Used
- HTML5
- CSS3 (custom properties, Flexbox, media queries)
- Vanilla JavaScript (ES6+)
- Font Awesome (icons)
- Google Fonts (Inter)

## How to Run Locally
1. Clone or download this repository
2. Open the project folder
3. Double-click `index.html` to open it in your browser

No build steps, no dependencies, no server required.

## Data Structure
Each task is stored as a JavaScript object inside an array:

```javascript
const tasks = [
  {
    id: 1703001234567,        // Date.now() at creation time
    title: 'Build the login page',
    description: 'Create a responsive login form with validation',
    priority: 'high',          // 'high' | 'medium' | 'low'
    column: 'inprogress',      // 'todo' | 'inprogress' | 'done'
    dueDate: '2025-12-25',     // ISO date string YYYY-MM-DD
    tags: ['HTML', 'CSS', 'JS'],
    createdAt: 1703001234567
  }
];

// Saving to localStorage:
localStorage.setItem('kanbanTasks', JSON.stringify(tasks));

// Reading from localStorage:
const tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [];
```

