
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

// Disable mutation controls while requests are pending
// or when the collection has not loaded successfully.
function updateControls() {
    const disabled = isBusy || !hasLoaded;

    nameInput.disabled = disabled;
    statusInput.disabled = disabled;
    saveButton.disabled = disabled;
    cancelButton.disabled = disabled;

    projectList.querySelectorAll('button[data-action]').forEach(button => {
        button.disabled = disabled;
    });
}

// Display the current collection or the appropriate empty/error state.
function render() {
    projectList.textContent = '';

    if (!hasLoaded) {
        emptyState.textContent = isLoading
            ? 'Loading projects...'
            : 'Projects could not be loaded. Refresh the page to try again.';

        updateControls();
        return;
    }

    projects.forEach(project => {
        const item = document.createElement('li');
        item.dataset.id = project.id;

        const details = document.createElement('span');
        details.textContent = `${project.name} - ${project.status}`;

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

        item.appendChild(details);
        item.appendChild(document.createTextNode(' '));
        item.appendChild(editButton);
        item.appendChild(document.createTextNode(' '));
        item.appendChild(deleteButton);

        projectList.appendChild(item);
    });

    emptyState.textContent = projects.length === 0
        ? 'No projects yet.'
        : '';

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

// Load the collection when the page starts.
async function start() {
    message.textContent = 'Loading projects...';
    await loadProjects();
}

start();
