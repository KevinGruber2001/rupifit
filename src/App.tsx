import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Record from './pages/Record'
import BeReal from './pages/BeReal'
import Search from './pages/Search'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route
        element={
  <div className="relative min-h-screen">
    {/* Logo */}
    <img
      src="/DieMacherLogo.png"
      alt="Logo"
      className="absolute top-17 right-4 h-18 w-auto"
    />

    {/* Content */}
    <main className="pt-16 pb-20">
      <Outlet />
    </main>

    <BottomNav />
  </div>
}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/record" element={<Record />} />
            <Route path="/bereal" element={<BeReal />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App