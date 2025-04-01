import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Chat from './pages/chat';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:receiverId" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="*" element={<NotFound />} /> Handles unknown routes */}
      </Routes>
    </Router>
  );
};

export default App;
