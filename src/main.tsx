import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { installMockApiIfNeeded } from "./lib/mockApi";
import "./index.css";

// Falls back to an in-browser demo API (localStorage-backed, seeded with sample
// data) when window.api isn't present — i.e. when this page is opened directly
// in a browser instead of running inside Electron. See src/lib/mockApi.ts.
installMockApiIfNeeded();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
