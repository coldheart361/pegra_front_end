// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import "./index.css";
import Account from "./pages/Account";
import MyAssets from "./pages/MyAssets";
import Trade from "./pages/Trade";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/assets" element={<MyAssets />} />
        <Route path="/trade" element={<Trade />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
