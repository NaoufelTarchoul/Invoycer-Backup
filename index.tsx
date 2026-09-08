import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { NotificationProvider } from './contexts/NotificationContext';
import { BrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
        <NotificationProvider>
            <App />
        </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);