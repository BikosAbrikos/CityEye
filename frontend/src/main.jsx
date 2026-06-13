import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth.jsx";
import { ThemeProvider } from "./lib/theme.jsx";
import App from "./App.jsx";
import MapPage from "./pages/MapPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AkimatPage from "./pages/AkimatPage.jsx";
import AkimatProblemPage from "./pages/AkimatProblemPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Портал акимата — отдельные страницы вне общего каркаса */}
            <Route path="/akimat" element={<AkimatPage />} />
            <Route path="/akimat/problem/:id" element={<AkimatProblemPage />} />

            <Route element={<App />}>
              <Route path="/" element={<MapPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
