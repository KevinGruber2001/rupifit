import { NavLink } from 'react-router'
import { CalendarDays, Camera, Plus, Search, User } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: CalendarDays, label: 'Kalender' },
  { to: '/search', icon: Search, label: 'Search' },
]

const rightItems = [
  { to: '/bereal', icon: Camera, label: 'BeReal' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <div className="fixed bottom-4 left-4 right-4 flex items-center justify-between bg-gray-900 rounded-2xl px-4 h-16 shadow-2xl">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 flex-1 transition-all ${isActive ? 'text-white' : 'text-gray-500'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} />
              {isActive && <span className="text-[10px] font-medium">{label}</span>}
            </>
          )}
        </NavLink>
      ))}

      <div className="flex-1 flex items-center justify-center">
        <NavLink
          to="/record"
          className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/40"
        >
          <Plus size={24} strokeWidth={2.5} className="text-white" />
        </NavLink>
      </div>

      {rightItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 flex-1 transition-all ${isActive ? 'text-white' : 'text-gray-500'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} />
              {isActive && <span className="text-[10px] font-medium">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}