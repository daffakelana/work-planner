import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthProvider";
import { WorkoutsProvider } from "./store/workouts";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WorkoutsProvider>
          <App />
        </WorkoutsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
