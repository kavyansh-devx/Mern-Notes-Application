import React from 'react'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/dashboard'
import ThemeToggle from './components/themeToggle'
import MainPage from './pages/main'
import AppErrorBoundary from './components/AppErrorBoundary'
import NotFoundPage from './pages/notFound'

const App = () => {
  return (
    <AppErrorBoundary>
      <div className="min-h-screen">
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AppErrorBoundary>
  )
}

export default App
