import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
// Import other providers and components as needed

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        {/* Other providers and app content */}
        <div className="app">
          {/* Your routes and main application content go here */}
        </div>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <AppRoutes />
        </main>
        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Immigration Helper Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;

