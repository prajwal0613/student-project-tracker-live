# Student Project Tracker

A simple full-stack web application to manage student projects. Users can create, view, edit, and delete projects while tracking their current status.

## 🚀 Features

- **Add Projects** — Create a project with a name and status.
- **View Projects** — Display all saved projects.
- **Edit Projects** — Update project details without changing the project ID.
- **Delete Projects** — Remove projects after confirmation.
- **Project Status** — Track projects as Planned, In Progress, or Completed.
- **Input Validation** — Reject invalid project names and statuses.
- **Persistent Storage** — Store project data in a database.
- **API Integration** — Communicate with the backend using REST API endpoints.
- **Error Handling** — Display useful feedback when requests fail.
- **Responsive UI** — Support desktop and mobile screen sizes.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Testing:** Automated API tests with Node.js test tooling

## 📁 Project Structure

```text
student-project-tracker/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── test/
│   └── crud.test.js
├── app.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

*Note: The exact structure may vary depending on your current project files and database setup.*

## ⚙️ Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)

## 📦 Installation

1. Clone the repository or download the project.
2. Open the project folder in VS Code.
3. Open the terminal in the project root.
4. Install the dependencies:

```bash
npm install
```

## ▶️ Run the Application

Start the server using the command configured in your `package.json`. If your project uses `server.js` directly, run:

```bash
node server.js
```

Open the application in your browser:

http://localhost:3000

Keep the terminal running while using the application.

## 🔌 API Endpoints

The backend exposes the following project-management endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/projects` | Retrieve all projects |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update an existing project |
| DELETE | `/api/projects/:id` | Delete a project |

### Example: Create a Project

**Request:** `POST /api/projects`

```json
{
  "name": "Student Attendance System",
  "status": "In Progress"
}
```

A successful creation returns HTTP status `201 Created`.

### Valid Project Statuses

- `Planned`
- `In Progress`
- `Completed`

Project names must contain between 1 and 80 characters after trimming whitespace.

## 🧪 Run Tests

Run the automated API test suite from the project root:

```powershell
npm.cmd test
```

The API tests check backend behaviour. They do not replace browser testing of the frontend.

### Manual Browser Testing

- Create two different projects.
- Edit a project and verify its ID remains unchanged.
- Cancel an edit and confirm the original details remain.
- Delete a project after confirmation.
- Refresh the page and verify saved projects remain.
- Restart the server and verify database persistence.
- Test blank or whitespace-only project names.
- Stop the server and check whether errors are displayed correctly.
- Restart the server and verify the application can recover.
- Check keyboard accessibility and a mobile-width viewport.

## 🎯 Learning Objectives

This project helps demonstrate practical understanding of:

- Frontend and backend integration
- REST API development
- CRUD operations
- Request validation and error handling
- Database persistence
- Asynchronous JavaScript and `fetch()`
- Automated API testing
- Responsive web design

## 🔮 Future Improvements

- Search and filter projects
- Add project deadlines and descriptions
- Track project progress
- Add user authentication
- Introduce project categories
- Deploy the application online

## 👨‍💻 Author

**Prajwal Ramatirth**

Built as a hands-on full-stack web development learning project.

## 📄 License

This project is intended for educational and learning purposes. Add a specific open-source license if you plan to distribute it publicly.