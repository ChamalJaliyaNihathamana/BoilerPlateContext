import React from "react";
import { Routes, Route } from "react-router-dom";

const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const HomePage = React.lazy(() => import("../pages/HomePage"));

const MainRoutes = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/home" element={<HomePage />} />
  </Routes>
);

export default MainRoutes;
