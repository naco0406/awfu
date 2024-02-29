import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Provider } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { StyleReset, ThemeProvider } from 'atomize';

const root = ReactDOM.createRoot(document.getElementById('root'));
const engine = new Styletron();

root.render(
  <React.StrictMode>
    <Provider value={engine}>
      <StyleReset />
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
