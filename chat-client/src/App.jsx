import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/chat';
import Login from './pages/Login';
// import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/chat" element={<Chat />} /> */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="*" element={<NotFound />} /> Handles unknown routes */}
      </Routes>
    </Router>
  );
};

export default App;
