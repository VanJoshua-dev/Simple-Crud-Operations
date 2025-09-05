import './App.css'
import React from 'react'
import AdminPanel from './pages/AdminPanel'
import {Route, Routes} from 'react-router-dom'
import UserPage from './pages/UserPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './ProtectPages'
import PageNotFound from './PageNotFound/PageNotFound'

function App() {
  return (
   <Routes>
    <Route path='/' element={<LoginPage />} />

    <Route
      path='/userPage'
      element={
        <ProtectedRoute role="user">
          <UserPage />
        </ProtectedRoute>
      }
    />

    <Route
      path='/adminPage'
      element={
        <ProtectedRoute role="admin">
          <AdminPanel />
        </ProtectedRoute>
      }
    />

    <Route path='*' element={<PageNotFound />} />
   </Routes>
  )
}

export default App
