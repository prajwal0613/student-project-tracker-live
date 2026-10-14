
// The server API is the source of truth for project records.
// This array is only a temporary copy used to render the page.
const projects = [];

let editingId = null;
let isBusy = false;
let hasLoaded = false;
let isLoading = true;

const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const message = document.querySelector('#message');

// Search, Filter, and Sort elements & state
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const filterPills = document.querySelectorAll('.filter-pill');
const countAll = document.querySelector('#count-all');
const countPlanned = document.querySelector('#count-planned');
const countInProgress = document.querySelector('#count-in-progress');
const countCompleted = document.querySelector('#count-completed');

let searchQuery = '';
let activeFilter = 'All';
let sortBy = 'newest';

const validStatuses = [
    'Planned',
    'In Progress',
    'Completed'
];

// Read an API error response safely.
async function getApiErrorMessage(response) {
    try {
        const data = await response.json();

        if (typeof data?.error === 'string' && data.error.trim()) {
            return data.error;
        }
    } catch (error) {
        // Fall back to the HTTP status.
    }

    return `Request failed (HTTP ${response.status}).`;
}

// Validate the collection returned by the API.
function isValidProjectArray(data) {
    if (!Array.isArray(data)) {
        return false;
    }

    const ids = new Set();

    return data.every(project => {
        if (
            project === null ||
            typeof project !== 'object' ||
            !Number.isSafeInteger(project.id) ||
            project.id < 1 ||
            typeof project.name !== 'string' ||
            project.name.trim() === '' ||
            project.name.length > 80 ||
            !validStatuses.includes(project.status) ||
            ids.has(project.id)
        ) {
            return false;
        }

        ids.add(project.id);
        return true;
    });
}

// Update count badges on filter pills.
function updateFilterCounts() {
    const counts = {
        All: projects.length,
        Planned: 0,
        'In Progress': 0,
        Completed: 0
    };

    projects.forEach(project => {
        if (Object.prototype.hasOwnProperty.call(counts, project.status)) {
            counts[project.status]++;
        }
    });

    if (countAll) countAll.textContent = counts.All;
    if (countPlanned) countPlanned.textContent = counts.Planned;
    if (countInProgress) countInProgress.textContent = counts['In Progress'];
    if (countCompleted) countCompleted.textContent = counts.Completed;
}

// Filter and sort the in-memory projects.
function getFilteredAndSortedProjects() {
    let result = projects.slice();

    // 1. Status Filter
    if (activeFilter !== 'All') {
        result = result.filter(project => project.status === activeFilter);
    }

    // 2. Search Query (matches project name case-insensitively)
    const query = searchQuery.trim().toLowerCase();
    if (query !== '') {
        result = result.filter(project =>
            project.name.toLowerCase().includes(query)
        );
    }

    // 3. Sorting
    result.sort((a, b) => {
        if (sortBy === 'newest') {
            return b.id - a.id;
        }
        if (sortBy === 'oldest') {
            return a.id - b.id;
        }
        if (sortBy === 'name-asc') {
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        }
        if (sortBy === 'name-desc') {
            return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
        }
        return 0;
    });

    return result;
}

// Disable mutation controls while requests are pending
// or when the collection has not loaded successfully.
function updateControls() {
    const disabled = isBusy || !hasLoaded;

    nameInput.disabled = disabled;
    statusInput.disabled = disabled;
    saveButton.disabled = disabled;
    cancelButton.disabled = disabled;

    if (searchInput) searchInput.disabled = !hasLoaded;
    if (sortSelect) sortSelect.disabled = !hasLoaded;
    filterPills.forEach(pill => {
        pill.disabled = !hasLoaded;
    });

    projectList.querySelectorAll('button[data-action]').forEach(button => {
        button.disabled = disabled;
    });
}

// Display the current collection or the appropriate empty/error state.
function render() {
    projectList.textContent = '';
    updateFilterCounts();

    if (!hasLoaded) {
        emptyState.textContent = isLoading
            ? 'Loading projects...'
            : 'Projects could not be loaded. Refresh the page to try again.';
        emptyState.hidden = false;
        updateControls();
        return;
    }

    const displayedProjects = getFilteredAndSortedProjects();

    displayedProjects.forEach(project => {
        const item = document.createElement('li');
        item.dataset.id = project.id;

        const details = document.createElement('span');
        details.className = 'project-details';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'project-name';
        nameSpan.textContent = project.name;

        const statusBadge = document.createElement('span');
        const slug = project.status.toLowerCase().replace(/\s+/g, '-');
        statusBadge.className = `status-badge status-${slug}`;
        statusBadge.textContent = project.status;

        details.appendChild(nameSpan);
        details.appendChild(document.createTextNode(' '));
        details.appendChild(statusBadge);

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.dataset.action = 'edit';
        editButton.dataset.id = project.id;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.dataset.action = 'delete';
        deleteButton.dataset.id = project.id;

        const actions = document.createElement('div');
        actions.className = 'project-actions';
        actions.appendChild(editButton);
        actions.appendChild(document.createTextNode(' '));
        actions.appendChild(deleteButton);

        item.appendChild(details);
        item.appendChild(actions);

        projectList.appendChild(item);
    });

    if (displayedProjects.length === 0) {
        if (projects.length === 0) {
            emptyState.textContent = 'No projects added yet.';
        } else if (searchQuery.trim() !== '' && activeFilter !== 'All') {
            emptyState.textContent = `No "${activeFilter}" projects matching "${searchQuery.trim()}".`;
        } else if (searchQuery.trim() !== '') {
            emptyState.textContent = `No projects matching "${searchQuery.trim()}".`;
        } else {
            emptyState.textContent = `No ${activeFilter} projects found.`;
        }
        emptyState.hidden = false;
    } else {
        emptyState.textContent = '';
        emptyState.hidden = true;
    }

    updateControls();
}

// Load projects from the API.
async function loadProjects() {
    isLoading = true;
    render();

    let response;

    try {
        response = await fetch('/api/projects');
    } catch (error) {
        hasLoaded = false;
        isLoading = false;
        projects.length = 0;

        render();
        message.textContent =
            'Could not connect to the server. Check that it is running and try again.';
        return false;
    }

    if (!response.ok) {
        const errorMessage = await getApiErrorMessage(response);

        hasLoaded = false;
        isLoading = false;
        projects.length = 0;

        render();
        message.textContent = `Could not load projects: ${errorMessage}`;
        return false;
    }

    let data;

    try {
        data = await response.json();
    } catch (error) {
        hasLoaded = false;
        isLoading = false;
        projects.length = 0;

        render();
        message.textContent =
            'The server returned an unreadable project response.';
        return false;
    }

    if (!isValidProjectArray(data)) {
        hasLoaded = false;
        isLoading = false;
        projects.length = 0;

        render();
        message.textContent =
            'The server returned invalid project data.';
        return false;
    }

    // Replace the temporary collection with the API results.
    projects.splice(0, projects.length, ...data);

    hasLoaded = true;
    isLoading = false;

    render();

    // Important: clear stale loading or error feedback after success.
    message.textContent = '';

    return true;
}

// Return the form to Add mode.
function resetForm() {
    editingId = null;
    form.reset();
    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;
}

// Handle Edit and Delete actions using stable server IDs.
projectList.addEventListener('click', async event => {
    if (isBusy || !hasLoaded) {
        return;
    }

    const button = event.target.closest('button[data-action]');

    if (!button || !projectList.contains(button)) {
        return;
    }

    const id = Number(button.dataset.id);
    const project = projects.find(item => item.id === id);

    if (!project) {
        return;
    }

    if (button.dataset.action === 'edit') {
        editingId = project.id;
        nameInput.value = project.name;
        statusInput.value = project.status;

        saveButton.textContent = 'Save changes';
        cancelButton.hidden = false;
        message.textContent = '';

        nameInput.focus();
        return;
    }

    if (button.dataset.action !== 'delete') {
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}"?`
    );

    // Cancelled deletion sends no request.
    if (!confirmed) {
        return;
    }

    isBusy = true;
    message.textContent = 'Deleting project...';
    updateControls();

    try {
        const response = await fetch(
            `/api/projects/${encodeURIComponent(project.id)}`,
            { method: 'DELETE' }
        );

        if (!response.ok) {
            message.textContent =
                `Could not delete project: ${await getApiErrorMessage(response)}`;
            return;
        }

        // Reset edit mode if the deleted record was being edited.
        if (editingId === id) {
            resetForm();
        }

        if (await loadProjects()) {
            message.textContent = 'Project deleted successfully.';
        }
    } catch (error) {
        message.textContent =
            'Could not connect to the server. The deletion could not be confirmed.';
    } finally {
        isBusy = false;
        updateControls();
    }
});

// One submit listener handles both Add and Edit.
form.addEventListener('submit', async event => {
    event.preventDefault();

    if (isBusy || !hasLoaded) {
        return;
    }

    const name = nameInput.value.trim();
    const status = statusInput.value;

    if (name === '') {
        message.textContent = 'Please enter a project name.';
        nameInput.focus();
        return;
    }

    if (name.length > 80 || !validStatuses.includes(status)) {
        message.textContent =
            'Use a project name of 1-80 characters and a valid status.';
        return;
    }

    const wasEditing = editingId !== null;
    const selectedId = editingId;

    const url = wasEditing
        ? `/api/projects/${encodeURIComponent(selectedId)}`
        : '/api/projects';

    const method = wasEditing ? 'PUT' : 'POST';

    isBusy = true;
    message.textContent = wasEditing
        ? 'Saving project changes...'
        : 'Saving new project...';
    updateControls();

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, status })
        });

        if (!response.ok) {
            const errorMessage = await getApiErrorMessage(response);

            message.textContent = wasEditing
                ? `Could not update project: ${errorMessage}`
                : `Could not add project: ${errorMessage}`;

            // Keep the form values and edit state after a failed save.
            return;
        }

        // The mutation succeeded. Return the form to Add mode.
        resetForm();

        // Fetch the server's current collection.
        if (await loadProjects()) {
            message.textContent = wasEditing
                ? 'Project updated successfully.'
                : 'Project added successfully.';
        }
    } catch (error) {
        message.textContent =
            'Could not connect to the server. Your changes could not be confirmed.';
    } finally {
        // Always restore controls after success or failure.
        isBusy = false;
        updateControls();
    }
});

// Cancel editing without sending a request.
cancelButton.addEventListener('click', () => {
    if (isBusy || !hasLoaded) {
        return;
    }

    resetForm();
    message.textContent = 'Edit cancelled.';
});

// Search input listener (live filtering)
if (searchInput) {
    searchInput.addEventListener('input', event => {
        searchQuery = event.target.value;
        render();
    });
}

// Sort dropdown listener
if (sortSelect) {
    sortSelect.addEventListener('change', event => {
        sortBy = event.target.value;
        render();
    });
}

// Filter pills click listener
filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
        if (isBusy || !hasLoaded) {
            return;
        }

        activeFilter = pill.dataset.filter;

        filterPills.forEach(btn => {
            const isActive = btn === pill;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        render();
    });
});

// Load the collection when the page starts.
async function start() {
    message.textContent = 'Loading projects...';
    await loadProjects();
}

start();
