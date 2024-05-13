import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.externalDB';
import { externalStore } from './store/externalDB';
import './stylesheets/index.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={externalStore}>
      <App />
    </Provider>
  </React.StrictMode>,
)
