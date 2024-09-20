import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Any global CSS
import App from './App'; // Ensure the path to App.js is correct

// Get the root container from your HTML (typically it's an element with id="root")
const container = document.getElementById('root');

// Create the root using the new React 18 `createRoot` API
const root = createRoot(container);

// Render the app using the root object
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
