import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import DashboardPage from './pages/DashboardPage';
import AdminSearchPage from './pages/AdminSearchPage';
import ChatbotPage from './pages/ChatbotPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin-search" element={<AdminSearchPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
      </Routes>
    </Router>
  );
}

export default App;