# Lawfully

A full-stack web application for an immigration platform with a forum and integrated ChatGPT Q&A. Built with **React** (frontend) and **Node.js/Express** (backend) in a single repository structure.

## Table of Contents

1. [Overview](#overview)  
2. [Folder Structure](#folder-structure)  
3. [Technologies Used](#technologies-used)  
4. [Contributing](#contributing)  
5. [License](#license)

---

## Overview

- **Purpose**: A comprehensive platform for immigration-related services, including forum discussions, legal Q&A powered by ChatGPT, administrative controls, and advanced analytics.
- **Features**:
  - **Analytics Dashboard**: Visualize immigration trends and generate reports with interactive charts.
  - **Notification System**: Real-time updates with mark as read and mark all as read functionality.
  - **Admin Dashboard**: Manage users, content, and system settings with ease.
  - **Forum Integration**: Engage in discussions with other users and experts.
  - **ChatGPT Q&A**: Get instant answers to immigration-related questions using AI.

---

## Folder Structure

```
my-immigration-platform/
  ├─ .gitignore
  ├─ README.md              
  ├─ package.json           
  ├─ frontend/
  │   ├─ package.json
  │   ├─ public/
  │   └─ src/
  │       ├─ components/
  │       ├─ pages/
  │       ├─ App.js
  │       └─ index.js
  └─ backend/
      ├─ package.json
      └─ src/
          ├─ server.js
          ├─ routes/
          ├─ controllers/
          └─ services/
```

- **frontend/**  
  - Contains the React application code (`create-react-app` structure).
  - `public/`: Static files and the main HTML template.  
  - `src/`: All source code (components, pages, etc.).

- **backend/**  
  - Contains the Node.js/Express server application.  
  - `src/server.js`: Entry point for the Express server.  
  - `routes/`: Defines routes for forum features, ChatGPT Q&A, etc.  
  - `controllers/` and `services/`: For separating business logic from route definitions (optional but recommended).

---

## Technologies Used
- **Frontend**  
  - [React](https://reactjs.org/)  
  - [react-scripts](https://www.npmjs.com/package/react-scripts)
  - [Chart.js](https://www.chartjs.org/) (for data visualization)
  - [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) (real-time notifications)

- **Frontend**  
  - [React](https://reactjs.org/)  
  - [react-scripts](https://www.npmjs.com/package/react-scripts)

- **Backend**  
  - [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/)  
  - [cors](https://www.npmjs.com/package/cors) (handles cross-origin requests)  
  - [dotenv](https://www.npmjs.com/package/dotenv) (loads environment variables)  
  - [OpenAI Node.js library](https://www.npmjs.com/package/openai) (for ChatGPT API calls)

- **Database** (depending on your setup)  
  - MongoDB with [Mongoose](https://mongoosejs.com/) or PostgreSQL with [Sequelize](https://sequelize.org/)

---

## Contributing

1. **Clone** the project.  
2. **Create a feature branch** (`git checkout -b feature/awesome-feature`).  
3. **Commit your changes** (`git commit -am 'Add awesome feature'`).  
4. **Push** to the branch (`git push origin feature/awesome-feature`).  
5. **Open a Pull Request** and @Lylah Liu on slack for code review

---

## License

This project is licensed under the [MIT License](LICENSE.md).
---