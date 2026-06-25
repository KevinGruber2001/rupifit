import { NavLink } from 'react-router'
import { CalendarDays, Camera, LayoutGrid, Plus, User } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: CalendarDays, label: 'Kalender' },
  { to: '/search', icon: LayoutGrid, label: 'Overview' },
]

const rightItems = [
  { to: '/bereal', icon: Camera, label: 'BeReal' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 flex items-center justify-between bg-surface border border-border rounded-card px-4 h-16 shadow-lg shadow-foreground/5">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 flex-1 transition-all ${isActive ? 'text-primary' : 'text-muted'}`
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
          className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Plus size={24} strokeWidth={2.5} className="text-surface" />
        </NavLink>
      </div>

      {rightItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 flex-1 transition-all ${isActive ? 'text-primary' : 'text-muted'}`
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
