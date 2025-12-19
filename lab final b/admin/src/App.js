import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';


import Navbar from './components/layout/Navbar';
import Login from './components/views/auth/login';
import AuthCheck from './components/views/auth/AuthCheck';

import Dashboard from './components/views/Dashboard';
import Products from './products/Products';



function App() {
  return (

    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <AuthCheck>
              <Navbar />
              <div className="app-container">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />


                </Routes>
              </div>
            </AuthCheck>
          }
        />
      </Routes>
    </Router>

  );
}

export default App;
