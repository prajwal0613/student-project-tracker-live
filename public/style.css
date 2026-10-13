
/* ---------- Base styles ---------- */

* {
    box-sizing: border-box;
}

:root {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
    color: #1f2937;
    background: #f3f6fb;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
}

body {
    margin: 0;
    min-height: 100vh;
    line-height: 1.6;
}

main {
    width: min(100% - 40px, 820px);
    margin: 0 auto;
    padding: 40px 0;
}

/* ---------- Page introduction ---------- */

header {
    margin-bottom: 32px;
}

h1,
h2 {
    line-height: 1.25;
    color: #111827;
}

h1 {
    margin: 0 0 12px;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
}

header p {
    margin: 0;
    color: #4b5563;
    font-size: 1.05rem;
}

/* ---------- Sections ---------- */

section {
    margin-bottom: 28px;
    padding: 24px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
}

h2 {
    margin: 0 0 20px;
    font-size: 1.35rem;
}

/* ---------- Form ---------- */

#project-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

#project-form div {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

label {
    color: #374151;
    font-size: 0.95rem;
    font-weight: 600;
}

input,
select {
    display: block;
    width: 100%;
    min-height: 46px;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    background: #ffffff;
    color: #111827;
    font: inherit;
}

input::placeholder {
    color: #6b7280;
}

input:focus-visible,
select:focus-visible,
button:focus-visible {
    outline: 3px solid #93c5fd;
    outline-offset: 3px;
}

input:focus,
select:focus {
    border-color: #2563eb;
}

/* ---------- Buttons ---------- */

button {
    min-height: 44px;
    padding: 10px 18px;
    border: 1px solid transparent;
    border-radius: 7px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

#save-button {
    align-self: flex-start;
    background: #2563eb;
    color: #ffffff;
}

#save-button:hover {
    background: #1d4ed8;
}

#cancel-button {
    align-self: flex-start;
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #374151;
}

#cancel-button:hover {
    background: #e5e7eb;
}

button:active {
    filter: brightness(0.95);
}

/* Keep hidden controls hidden despite other styles. */
[hidden] {
    display: none !important;
}

/* ---------- Messages and project list ---------- */

#message {
    margin: 16px 0 0;
    color: #166534;
    overflow-wrap: anywhere;
}

#empty-state {
    margin: 0;
    padding: 16px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    color: #6b7280;
    text-align: center;
}

#project-list {
    margin: 16px 0 0;
    padding-left: 24px;
    overflow-wrap: anywhere;
}

/* ---------- Responsive layout ---------- */

@media (max-width: 560px) {
    main {
        width: calc(100% - 24px);
        padding: 24px 0;
    }

    header {
        margin-bottom: 24px;
    }

    section {
        margin-bottom: 20px;
        padding: 18px;
        border-radius: 10px;
    }

    h2 {
        font-size: 1.2rem;
    }

    #project-form {
        gap: 16px;
    }

    #save-button,
    #cancel-button {
        width: 100%;
    }
}

