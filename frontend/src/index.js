import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import './i18n/i18n';
import './styles/index.css';
import { testRegister } from './utils/testAuth';

// Configure axios - removing baseURL since we use proxy in package.json
// axios.defaults.baseURL = 'http://localhost:5000';

// Add test functions to window for console debugging
window.testRegister = testRegister;
window.axios = axios; // Make axios available for testing

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
); 