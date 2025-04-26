import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import { MoodProvider } from './context/MoodContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HabitPage from './pages/HabitPage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import MoodPage from './pages/MoodPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HabitProvider>
          <MoodProvider>
            <Router>
              <div className="min-h-screen bg-neutral-lightest flex flex-col">
                <Header />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 p-4">
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/" element={
                        <ProtectedRoute>
                          <HomePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/habits/:id" element={
                        <ProtectedRoute>
                          <HabitPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/calendar" element={
                        <ProtectedRoute>
                          <CalendarPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/stats" element={
                        <ProtectedRoute>
                          <StatsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/mood" element={
                        <ProtectedRoute>
                          <MoodPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <SettingsPage />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                </div>
                <Footer />
              </div>
            </Router>
          </MoodProvider>
        </HabitProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;