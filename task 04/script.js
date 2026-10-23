/**
 * ===================================================================
 * TASKFLOW - Modern Task Management Application
 * Pure Vanilla JavaScript (ES6+)
 * ===================================================================
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'taskflow_tasks_v1';
  const VIEW_PREF_KEY = 'taskflow_view_pref';

  // --- Application State ---
  let tasks = [];
  let currentFilter = 'all'; // 'all' | 'pending' | 'completed' | 'overdue'
  let currentCategory = 'all'; // 'all' | 'Personal' | 'College' | 'Work' | 'Other'
  let searchQuery = '';
  let sortBy = 'dueDateAsc';
  let viewMode = localStorage.getItem(VIEW_PREF_KEY) || 'grid'; // 'grid' | 'list'
  let taskPendingDeletionId = null;

  // --- DOM Elements Cache ---
  const elements = {
    // Layout & Navigation
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    pageHeading: document.getElementById('pageHeading'),
    currentDateDisplay: document.getElementById('currentDateDisplay'),

    // Task List Container & Empty State
    tasksContainer: document.getElementById('tasksContainer'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptyDescription: document.getElementById('emptyDescription'),
    emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),

    // Controls & Search
    taskSearchInput: document.getElementById('taskSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    taskSortSelect: document.getElementById('taskSortSelect'),
    viewGridBtn: document.getElementById('viewGridBtn'),
    viewListBtn: document.getElementById('viewListBtn'),
    filterPillsContainer: document.getElementById('filterPillsContainer'),
    activeFilterBanner: document.getElementById('activeFilterBanner'),
    activeFilterText: document.getElementById('activeFilterText'),
    resetActiveFiltersBtn: document.getElementById('resetActiveFiltersBtn'),

    // Modal: Add / Edit Task
    taskModal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    taskForm: document.getElementById('taskForm'),
    taskIdInput: document.getElementById('taskIdInput'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    taskDescInput: document.getElementById('taskDescInput'),
    descCharCount: document.getElementById('descCharCount'),
    taskCategoryInput: document.getElementById('taskCategoryInput'),
    taskPriorityInput: document.getElementById('taskPriorityInput'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    taskDueTimeInput: document.getElementById('taskDueTimeInput'),
    titleError: document.getElementById('titleError'),
    dueDateError: document.getElementById('dueDateError'),
    saveBtnText: document.getElementById('saveBtnText'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    sidebarAddTaskBtn: document.getElementById('sidebarAddTaskBtn'),

    // Modal: Delete Confirmation
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    deleteTaskTitlePreview: document.getElementById('deleteTaskTitlePreview'),
    closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

    // Statistics & Counters
    statTotalCount: document.getElementById('statTotalCount'),
    statPendingCount: document.getElementById('statPendingCount'),
    statCompletedCount: document.getElementById('statCompletedCount'),
    statOverdueCount: document.getElementById('statOverdueCount'),
    statCompletedRate: document.getElementById('statCompletedRate'),
    progressPercent: document.getElementById('progressPercent'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressCaption: document.getElementById('progressCaption'),

    // Sidebar Badges
    badgeAll: document.getElementById('badgeAll'),
    badgePending: document.getElementById('badgePending'),
    badgeCompleted: document.getElementById('badgeCompleted'),
    badgeOverdue: document.getElementById('badgeOverdue'),
    catBadgeAll: document.getElementById('catBadgeAll'),
    catBadgePersonal: document.getElementById('catBadgePersonal'),
    catBadgeCollege: document.getElementById('catBadgeCollege'),
    catBadgeWork: document.getElementById('catBadgeWork'),
    catBadgeOther: document.getElementById('catBadgeOther'),

    // Extra Secondary Action Buttons
    loadSampleTasksBtn: document.getElementById('loadSampleTasksBtn'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Initial Demo Tasks ---
  const defaultSampleTasks = [
    {
      id: 'demo-1',
      title: 'Complete Software Engineering Project Report',
      description: 'Prepare documentation, architecture diagrams, and test suite results for final submission.',
      category: 'College',
      priority: 'high',
      dueDate: getRelativeDate(1), // Tomorrow
      dueTime: '17:00',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-2',
      title: 'Weekly Team Sprint Review & Planning',
      description: 'Review completed deliverables for Q4 and allocate sprint backlog tickets with team leads.',
      category: 'Work',
      priority: 'medium',
      dueDate: getRelativeDate(2), // In 2 days
      dueTime: '10:30',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-3',
      title: 'Grocery Shopping & Meal Prep',
      description: 'Buy fresh vegetables, whole grains, fruits, and prepare healthy snacks for the upcoming week.',
      category: 'Personal',
      priority: 'low',
      dueDate: getRelativeDate(0), // Today
      dueTime: '19:00',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-4',
      title: 'Update Portfolio Website & Resume',
      description: 'Add new full-stack projects, refresh tech stack badges, and deploy to Vercel/GitHub Pages.',
      category: 'Other',
      priority: 'medium',
      dueDate: getRelativeDate(-1), // Yesterday (overdue demonstration)
      dueTime: '14:00',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-5',
      title: 'Submit Operating Systems Lab Assignment',
      description: 'Implemented multi-threaded semaphore algorithms in C with benchmark evaluations.',
      category: 'College',
      priority: 'high',
      dueDate: getRelativeDate(-2),
      dueTime: '23:59',
      completed: true,
      createdAt: new Date().toISOString()
    }
  ];

  // --- Date Helper Utilities ---
  function getRelativeDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateStr, timeStr) {
    if (!dateStr) return 'No due date';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    // Format human-friendly: e.g. "Oct 24, 2026"
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);

    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const formattedHours = h % 12 || 12;
      const formattedMins = String(m).padStart(2, '0');
      return `${formattedDate} at ${formattedHours}:${formattedMins} ${period}`;
    }
    return formattedDate;
  }

  function isTaskOverdue(task) {
    if (task.completed || !task.dueDate) return false;
    const now = new Date();
    const [year, month, day] = task.dueDate.split('-').map(Number);
    let hours = 23;
    let minutes = 59;
    if (task.dueTime) {
      const [h, m] = task.dueTime.split(':').map(Number);
      hours = h;
      minutes = m;
    }
    const dueDateTime = new Date(year, month - 1, day, hours, minutes, 59);
    return dueDateTime < now;
  }

  function updateCurrentDateHeader() {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    elements.currentDateDisplay.textContent = today.toLocaleDateString('en-US', options);
  }

  // --- Audio Feedback (Web Audio API Synthesizer) ---
  function playCompletionChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Play soft harmonic dual tones
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {
      // Audio playback can be silently skipped if restricted by browser policy
    }
  }

  // --- Local Storage Management ---
  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        tasks = JSON.parse(stored);
      } else {
        // Initialize with realistic seed tasks on first launch
        tasks = [...defaultSampleTasks];
        saveTasksToStorage();
      }
    } catch (err) {
      console.error('Failed to load tasks from localStorage', err);
      tasks = [...defaultSampleTasks];
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage', err);
      showToast('Local Storage is full or unavailable', 'error');
    }
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }

  // Safe HTML Escaping
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Filtering & Sorting ---
  function getFilteredAndSortedTasks() {
    let list = [...tasks];

    // Status filter
    if (currentFilter === 'pending') {
      list = list.filter(t => !t.completed && !isTaskOverdue(t));
    } else if (currentFilter === 'completed') {
      list = list.filter(t => t.completed);
    } else if (currentFilter === 'overdue') {
      list = list.filter(t => isTaskOverdue(t));
    }

    // Category filter
    if (currentCategory !== 'all') {
      list = list.filter(t => t.category === currentCategory);
    }

    // Search query filter (title and description)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        return titleMatch || descMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        const dateA = a.dueDate ? `${a.dueDate}T${a.dueTime || '23:59'}` : '9999-12-31';
        const dateB = b.dueDate ? `${b.dueDate}T${b.dueTime || '23:59'}` : '9999-12-31';
        return dateA.localeCompare(dateB);
      } else if (sortBy === 'dueDateDesc') {
        const dateA = a.dueDate ? `${a.dueDate}T${a.dueTime || '23:59'}` : '0000-00-00';
        const dateB = b.dueDate ? `${b.dueDate}T${b.dueTime || '23:59'}` : '0000-00-00';
        return dateB.localeCompare(dateA);
      } else if (sortBy === 'createdDesc') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      } else if (sortBy === 'priority') {
        const weights = { high: 3, medium: 2, low: 1 };
        return (weights[b.priority] || 2) - (weights[a.priority] || 2);
      } else if (sortBy === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return list;
  }

  // --- Statistics Calculation ---
  function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter(t => isTaskOverdue(t)).length;
    const pending = total - completed;

    // Stat Cards
    elements.statTotalCount.textContent = total;
    elements.statPendingCount.textContent = pending;
    elements.statCompletedCount.textContent = completed;
    elements.statOverdueCount.textContent = overdue;

    // Completion Rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    elements.statCompletedRate.textContent = `${completionRate}% done`;

    // Sidebar Progress Card
    elements.progressPercent.textContent = `${completionRate}%`;
    elements.progressBarFill.style.width = `${completionRate}%`;
    elements.progressCaption.textContent = `${completed} of ${total} tasks completed`;

    // Sidebar Status Badges
    elements.badgeAll.textContent = total;
    elements.badgePending.textContent = tasks.filter(t => !t.completed && !isTaskOverdue(t)).length;
    elements.badgeCompleted.textContent = completed;
    elements.badgeOverdue.textContent = overdue;

    // Sidebar Category Badges
    elements.catBadgeAll.textContent = total;
    elements.catBadgePersonal.textContent = tasks.filter(t => t.category === 'Personal').length;
    elements.catBadgeCollege.textContent = tasks.filter(t => t.category === 'College').length;
    elements.catBadgeWork.textContent = tasks.filter(t => t.category === 'Work').length;
    elements.catBadgeOther.textContent = tasks.filter(t => t.category === 'Other').length;
  }

  // --- Rendering Functions ---
  function renderTasks() {
    updateStatistics();
    const filteredTasks = getFilteredAndSortedTasks();

    // Update active filter banner
    const isFiltered = currentFilter !== 'all' || currentCategory !== 'all' || searchQuery.trim() !== '';
    if (isFiltered) {
      elements.activeFilterBanner.style.display = 'flex';
      const parts = [];
      if (currentFilter !== 'all') {
        parts.push(`Status: ${capitalize(currentFilter)}`);
      }
      if (currentCategory !== 'all') {
        parts.push(`Category: ${currentCategory}`);
      }
      if (searchQuery.trim() !== '') {
        parts.push(`Search: "${searchQuery}"`);
      }
      elements.activeFilterText.textContent = `Filtered by: ${parts.join(' • ')} (${filteredTasks.length} found)`;
    } else {
      elements.activeFilterBanner.style.display = 'none';
    }

    // Toggle Empty State vs List
    if (filteredTasks.length === 0) {
      elements.tasksContainer.innerHTML = '';
      elements.emptyState.style.display = 'flex';

      if (searchQuery.trim() !== '') {
        elements.emptyTitle.textContent = 'No matching tasks found';
        elements.emptyDescription.textContent = `No tasks matched your search query "${searchQuery}". Try different keywords or reset search.`;
      } else if (currentFilter === 'overdue') {
        elements.emptyTitle.textContent = 'Awesome! No overdue tasks';
        elements.emptyDescription.textContent = 'You are completely on track. Keep up the great pace!';
      } else if (currentFilter === 'completed') {
        elements.emptyTitle.textContent = 'No completed tasks yet';
        elements.emptyDescription.textContent = 'Check off tasks as you finish them to build momentum and track your progress.';
      } else if (currentCategory !== 'all') {
        elements.emptyTitle.textContent = `No tasks in ${currentCategory}`;
        elements.emptyDescription.textContent = `You do not have any tasks filed under the "${currentCategory}" category yet.`;
      } else {
        elements.emptyTitle.textContent = 'Your task list is empty';
        elements.emptyDescription.textContent = 'Create your first task to get organized and stay on top of your daily goals!';
      }
      return;
    }

    elements.emptyState.style.display = 'none';
    elements.tasksContainer.innerHTML = '';

    filteredTasks.forEach(task => {
      const card = createTaskCardElement(task);
      elements.tasksContainer.appendChild(card);
    });
  }

  function createTaskCardElement(task) {
    const card = document.createElement('article');
    const isOverdue = isTaskOverdue(task);

    card.className = `task-card ${task.completed ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}`;
    card.setAttribute('data-id', task.id);

    // Format category & tags
    const catClass = `tag-${task.category ? task.category.toLowerCase() : 'other'}`;
    const priorityClass = `priority-${task.priority || 'medium'}`;

    const formattedDate = formatDisplayDate(task.dueDate, task.dueTime);
    let dateClass = 'task-due-date';
    let dateLabel = formattedDate;

    if (task.completed) {
      dateClass += ' completed-text';
      dateLabel = `Completed • ${formattedDate}`;
    } else if (isOverdue) {
      dateClass += ' overdue-text';
      dateLabel = `Overdue • ${formattedDate}`;
    }

    card.innerHTML = `
      <div class="task-card-header">
        <label class="task-checkbox-container" title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
          <input type="checkbox" class="task-check-input" ${task.completed ? 'checked' : ''} data-id="${task.id}" aria-label="Toggle completed for ${escapeHtml(task.title)}">
          <span class="custom-checkbox">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
        <div class="task-card-content">
          <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
          ${task.description ? `<p class="task-card-desc">${escapeHtml(task.description)}</p>` : ''}
        </div>
      </div>

      <div class="task-card-meta">
        <span class="category-tag ${catClass}">
          <span class="category-dot cat-dot-${task.category.toLowerCase()}"></span>
          ${task.category}
        </span>
        <span class="priority-tag ${priorityClass}">${capitalize(task.priority || 'medium')}</span>
      </div>

      <div class="task-card-footer">
        <div class="${dateClass}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${dateLabel}</span>
        </div>

        <div class="task-actions">
          <button class="task-action-btn edit-btn" data-id="${task.id}" title="Edit Task" aria-label="Edit task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="task-action-btn delete-btn" data-id="${task.id}" title="Delete Task" aria-label="Delete task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    return card;
  }

  function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // --- Modal Open / Close Logic ---
  function openAddModal() {
    elements.taskIdInput.value = '';
    elements.taskForm.reset();
    elements.modalTitle.textContent = 'Create New Task';
    elements.saveBtnText.textContent = 'Add Task';
    elements.descCharCount.textContent = '0';
    clearValidationErrors();

    // Default to today and 18:00
    elements.taskDueDateInput.value = getRelativeDate(0);
    elements.taskDueTimeInput.value = '18:00';
    elements.taskPriorityInput.value = 'medium';
    elements.taskCategoryInput.value = currentCategory !== 'all' ? currentCategory : 'Personal';

    elements.taskModal.classList.add('is-open');
    elements.taskModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => elements.taskTitleInput.focus(), 150);
  }

  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    elements.taskIdInput.value = task.id;
    elements.taskTitleInput.value = task.title;
    elements.taskDescInput.value = task.description || '';
    elements.descCharCount.textContent = (task.description || '').length;
    elements.taskCategoryInput.value = task.category || 'Personal';
    elements.taskPriorityInput.value = task.priority || 'medium';
    elements.taskDueDateInput.value = task.dueDate || getRelativeDate(0);
    elements.taskDueTimeInput.value = task.dueTime || '18:00';

    elements.modalTitle.textContent = 'Edit Task';
    elements.saveBtnText.textContent = 'Update Task';
    clearValidationErrors();

    elements.taskModal.classList.add('is-open');
    elements.taskModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => elements.taskTitleInput.focus(), 150);
  }

  function closeModal() {
    elements.taskModal.classList.remove('is-open');
    elements.taskModal.setAttribute('aria-hidden', 'true');
    clearValidationErrors();
  }

  function clearValidationErrors() {
    elements.taskTitleInput.classList.remove('input-error');
    elements.taskDueDateInput.classList.remove('input-error');
    elements.titleError.classList.remove('visible');
    elements.dueDateError.classList.remove('visible');
  }

  // Delete Confirmation Modal
  function openDeleteModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    taskPendingDeletionId = taskId;
    elements.deleteTaskTitlePreview.textContent = `"${task.title}"`;
    elements.deleteConfirmModal.classList.add('is-open');
    elements.deleteConfirmModal.setAttribute('aria-hidden', 'false');
  }

  function closeDeleteModal() {
    elements.deleteConfirmModal.classList.remove('is-open');
    elements.deleteConfirmModal.setAttribute('aria-hidden', 'true');
    taskPendingDeletionId = null;
  }

  // --- Task CRUD Operations ---
  function handleFormSubmit(e) {
    e.preventDefault();
    clearValidationErrors();

    const title = elements.taskTitleInput.value.trim();
    const dueDate = elements.taskDueDateInput.value;
    const dueTime = elements.taskDueTimeInput.value;
    const description = elements.taskDescInput.value.trim();
    const category = elements.taskCategoryInput.value;
    const priority = elements.taskPriorityInput.value;
    const existingId = elements.taskIdInput.value;

    let hasError = false;

    if (!title) {
      elements.taskTitleInput.classList.add('input-error');
      elements.titleError.classList.add('visible');
      hasError = true;
    }

    if (!dueDate) {
      elements.taskDueDateInput.classList.add('input-error');
      elements.dueDateError.classList.add('visible');
      hasError = true;
    }

    if (hasError) return;

    if (existingId) {
      // Edit existing task
      const taskIndex = tasks.findIndex(t => t.id === existingId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          title,
          description,
          category,
          priority,
          dueDate,
          dueTime,
          updatedAt: new Date().toISOString()
        };
        saveTasksToStorage();
        renderTasks();
        showToast('Task updated successfully!', 'info');
      }
    } else {
      // Create new task
      const newTask = {
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        title,
        description,
        category,
        priority,
        dueDate,
        dueTime,
        completed: false,
        createdAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      saveTasksToStorage();
      renderTasks();
      showToast('New task added successfully!', 'success');
    }

    closeModal();
  }

  function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    if (task.completed) {
      playCompletionChime();
      showToast('Task completed! Keep it up!', 'success');
    } else {
      showToast('Task marked as pending', 'info');
    }

    saveTasksToStorage();
    renderTasks();
  }

  function executeDeleteTask() {
    if (!taskPendingDeletionId) return;

    const taskToDelete = tasks.find(t => t.id === taskPendingDeletionId);
    const taskTitle = taskToDelete ? taskToDelete.title : 'Task';

    tasks = tasks.filter(t => t.id !== taskPendingDeletionId);
    saveTasksToStorage();
    renderTasks();
    closeDeleteModal();
    showToast(`Deleted: "${taskTitle}"`, 'error');
  }

  function clearAllCompletedTasks() {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'info');
      return;
    }

    if (confirm(`Are you sure you want to permanently clear ${completedCount} completed task(s)?`)) {
      tasks = tasks.filter(t => !t.completed);
      saveTasksToStorage();
      renderTasks();
      showToast(`Cleared ${completedCount} completed task(s)!`, 'success');
    }
  }

  function loadSampleData() {
    tasks = JSON.parse(JSON.stringify(defaultSampleTasks));
    saveTasksToStorage();
    renderTasks();
    showToast('Loaded sample tasks successfully!', 'success');
  }

  // --- View Mode Preference ---
  function setViewMode(mode) {
    viewMode = mode;
    localStorage.setItem(VIEW_PREF_KEY, mode);
    if (mode === 'grid') {
      elements.tasksContainer.className = 'task-grid view-mode-grid';
      elements.viewGridBtn.classList.add('active');
      elements.viewListBtn.classList.remove('active');
    } else {
      elements.tasksContainer.className = 'task-grid view-mode-list';
      elements.viewListBtn.classList.add('active');
      elements.viewGridBtn.classList.remove('active');
    }
  }

  // --- Sidebar Mobile Navigation ---
  function openMobileSidebar() {
    elements.sidebar.classList.add('mobile-open');
    elements.sidebarOverlay.classList.add('mobile-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    elements.sidebar.classList.remove('mobile-open');
    elements.sidebarOverlay.classList.remove('mobile-open');
    document.body.style.overflow = '';
  }

  // --- Setup Navigation Event Handlers ---
  function bindEvents() {
    // Mobile navigation
    elements.mobileMenuBtn.addEventListener('click', openMobileSidebar);
    elements.closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // Modal triggers
    elements.openAddModalBtn.addEventListener('click', openAddModal);
    elements.sidebarAddTaskBtn.addEventListener('click', () => {
      closeMobileSidebar();
      openAddModal();
    });
    elements.emptyStateAddBtn.addEventListener('click', openAddModal);

    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelModalBtn.addEventListener('click', closeModal);

    elements.taskForm.addEventListener('submit', handleFormSubmit);

    // Modal backdrop click to dismiss
    elements.taskModal.addEventListener('click', (e) => {
      if (e.target === elements.taskModal) closeModal();
    });

    // Delete modal events
    elements.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', executeDeleteTask);
    elements.deleteConfirmModal.addEventListener('click', (e) => {
      if (e.target === elements.deleteConfirmModal) closeDeleteModal();
    });

    // Keyboard navigation (ESC to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.taskModal.classList.contains('is-open')) closeModal();
        if (elements.deleteConfirmModal.classList.contains('is-open')) closeDeleteModal();
        if (elements.sidebar.classList.contains('mobile-open')) closeMobileSidebar();
      }
    });

    // Character counter for description
    elements.taskDescInput.addEventListener('input', (e) => {
      elements.descCharCount.textContent = e.target.value.length;
    });

    // Status Filter: Sidebar links
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-filter]');
    navLinks.forEach(btn => {
      btn.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        currentFilter = filter;

        // Sync pill buttons
        const pills = document.querySelectorAll('.filter-pills .pill-btn');
        pills.forEach(p => {
          if (p.getAttribute('data-pill-filter') === filter) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });

        // Update main page heading
        elements.pageHeading.textContent = `${capitalize(filter)} Tasks`;

        closeMobileSidebar();
        renderTasks();
      });
    });

    // Status Filter: Top Pill Buttons
    const pillButtons = document.querySelectorAll('.filter-pills .pill-btn');
    pillButtons.forEach(pill => {
      pill.addEventListener('click', () => {
        pillButtons.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.getAttribute('data-pill-filter');
        currentFilter = filter;

        // Sync sidebar
        navLinks.forEach(link => {
          if (link.getAttribute('data-filter') === filter) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        elements.pageHeading.textContent = `${capitalize(filter)} Tasks`;
        renderTasks();
      });
    });

    // Category Filter: Sidebar Links
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryLinks.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');
        currentCategory = category;
        elements.categoryFilterSelect.value = category;

        closeMobileSidebar();
        renderTasks();
      });
    });

    // Category Filter: Dropdown Select
    elements.categoryFilterSelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;

      // Sync sidebar category
      categoryLinks.forEach(btn => {
        if (btn.getAttribute('data-category') === currentCategory) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      renderTasks();
    });

    // Sorting Dropdown
    elements.taskSortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderTasks();
    });

    // Search Input
    elements.taskSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.length > 0) {
        elements.searchClearBtn.style.display = 'flex';
      } else {
        elements.searchClearBtn.style.display = 'none';
      }
      renderTasks();
    });

    elements.searchClearBtn.addEventListener('click', () => {
      elements.taskSearchInput.value = '';
      searchQuery = '';
      elements.searchClearBtn.style.display = 'none';
      elements.taskSearchInput.focus();
      renderTasks();
    });

    // Reset Active Filter Button
    elements.resetActiveFiltersBtn.addEventListener('click', () => {
      currentFilter = 'all';
      currentCategory = 'all';
      searchQuery = '';
      elements.taskSearchInput.value = '';
      elements.searchClearBtn.style.display = 'none';
      elements.categoryFilterSelect.value = 'all';

      // Reset pill active
      pillButtons.forEach(p => {
        if (p.getAttribute('data-pill-filter') === 'all') p.classList.add('active');
        else p.classList.remove('active');
      });

      // Reset sidebar status active
      navLinks.forEach(l => {
        if (l.getAttribute('data-filter') === 'all') l.classList.add('active');
        else l.classList.remove('active');
      });

      // Reset sidebar category active
      categoryLinks.forEach(c => c.classList.remove('active'));

      elements.pageHeading.textContent = 'All Tasks';
      renderTasks();
    });

    // View Switcher (Grid vs List)
    elements.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    elements.viewListBtn.addEventListener('click', () => setViewMode('list'));

    // Secondary Actions
    elements.loadSampleTasksBtn.addEventListener('click', loadSampleData);
    elements.clearCompletedBtn.addEventListener('click', clearAllCompletedTasks);

    // Event Delegation on Task Container for Checkbox, Edit, and Delete
    elements.tasksContainer.addEventListener('click', (e) => {
      // Toggle Checkbox
      const checkInput = e.target.closest('.task-check-input');
      if (checkInput) {
        const taskId = checkInput.getAttribute('data-id');
        toggleTaskCompletion(taskId);
        return;
      }

      // Edit Button
      const editBtn = e.target.closest('.edit-btn');
      if (editBtn) {
        const taskId = editBtn.getAttribute('data-id');
        openEditModal(taskId);
        return;
      }

      // Delete Button
      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        const taskId = deleteBtn.getAttribute('data-id');
        openDeleteModal(taskId);
        return;
      }
    });
  }

  // --- Application Initialization ---
  function init() {
    updateCurrentDateHeader();
    loadTasksFromStorage();
    setViewMode(viewMode);
    bindEvents();
    renderTasks();
  }

  // Boot up when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
