# TaskFlow &bull; Modern Task Management Dashboard

TaskFlow is a modern, responsive, and visually stunning **To-Do List Web Application** built with pure HTML5, CSS3, and vanilla JavaScript. Designed with a dark navy and purple gradient aesthetic, glassmorphic surfaces, and micro-interactions, TaskFlow empowers users to stay focused, organized, and productive.

![TaskFlow Dashboard Preview](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## Key Features

1. **Task Creation & Editing:**
   - Create tasks with a title, detailed notes/description, category, priority (High, Medium, Low), due date, and due time.
   - Edit any existing task with real-time validation and form pre-population.

2. **Delete with Confirmation:**
   - Safe deletion flow featuring a custom modal that displays the task title to prevent accidental removals.

3. **Status Toggles & Overdue Highlighting:**
   - Mark tasks as completed or pending with immediate visual feedback (strikethrough styling, emerald accents, and a subtle chime tone).
   - Dynamic detection for **overdue tasks**, styled with pulsing crimson badges and alert borders.

4. **Task Categorization:**
   - Organize tasks by **Personal**, **College**, **Work**, and **Other**.
   - Color-coded badges and real-time counter indicators for each category.

5. **Multi-level Filtering & Sorting:**
   - Filter by status: **All**, **Pending**, **Completed**, and **Overdue**.
   - Filter by category via sidebar links or the quick mobile dropdown.
   - Sort by Due Date (Earliest / Latest), Priority (High to Low), Recently Added, or Alphabetical (A–Z).

6. **Instant Search:**
   - Real-time search by task title and description with a one-click clear button.

7. **Dashboard Statistics & Progress Bar:**
   - Live metrics showing Total Tasks, Pending Tasks, Completed Tasks, and Overdue count.
   - Real-time completion percentage and animated progress bar.

8. **Layout Switcher:**
   - Toggle between **Grid View** (card-based) and **List View** (compact rows). Preference is saved locally.

9. **Persistent Local Storage:**
   - All tasks and user preferences persist automatically across browser reloads.
   - Pre-loaded with sample demo data on first launch so you can test features right away.

10. **Toast Notifications & Micro-Animations:**
    - Non-intrusive animated toast alerts notify users whenever tasks are created, edited, deleted, or completed.

11. **Fully Responsive:**
    - Seamless layout adaptations for mobile phones, tablets, laptops, and ultra-wide displays.
    - Features a collapsible mobile drawer navigation with backdrop blur.

---

## File Structure

```text
task-04/
│
├── index.html       # Semantic HTML5 dashboard structure and accessible modals
├── style.css        # Modern dark navy & purple gradient theme, CSS variables, and animations
├── script.js        # Vanilla JavaScript ES6+ application logic and LocalStorage handler
└── README.md        # Documentation, feature guide, and setup instructions
```

---

## Getting Started

Because TaskFlow is built purely with vanilla technologies, **no backend, compilation, or npm install is required**.

### Option 1: Direct Browser Launch
1. Double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, Brave).

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local dev server:

**Using Python 3:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using Node.js `npx serve`:**
```bash
npx serve .
```

---

## Keyboard Shortcuts & Usability

- `Escape`: Closes any open modal (Task Form or Delete Confirmation) or the mobile navigation drawer.
- `Tab / Shift+Tab`: Full keyboard focus navigation across all inputs, checkboxes, and buttons.
- Form inputs validate automatically to prevent empty submissions.

---

## Technologies Used

- **HTML5:** Semantic elements (`<main>`, `<aside>`, `<header>`, `<article>`, `<nav>`).
- **CSS3:** Custom properties (CSS variables), CSS Grid, Flexbox, backdrop filters, keyframe animations, and custom scrollbars.
- **JavaScript (ES6+):** Pure vanilla JavaScript, Web Audio API, DOM manipulation, LocalStorage API, and event delegation.
