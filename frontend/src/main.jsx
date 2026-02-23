import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App.jsx';
import './styles/App.css';

// Amplify configuration
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_9lv5KD19a',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '58gb77sepf6c361n03m6mapuf3',
      region: import.meta.env.VITE_REGION || import.meta.env.VITE_AWS_REGION || 'ap-south-1'
    }
  }
});

// Only log in development
if (import.meta.env.MODE === 'development') {
  console.log('🚀 Inventory Dashboard Started (Development Mode)');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
