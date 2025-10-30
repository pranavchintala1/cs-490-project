import React from 'react';
import ReactDOM from 'react-dom/client';
import { FlashProvider } from "../src/context/flashContext";
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google'
import { msalConfig } from "./tools/msal";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";


const PCA = new PublicClientApplication(msalConfig);

const clientId = process.env.VITE_GOOGLE_CLIENT_ID; // from .env

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FlashProvider>
      <GoogleOAuthProvider clientId={clientId}>
       <MsalProvider instance={PCA}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        </MsalProvider>
      </GoogleOAuthProvider>
    </FlashProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
