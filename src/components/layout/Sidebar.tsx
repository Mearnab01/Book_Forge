import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BookPlus, 
  BookCheck, 
  CalendarClock,
  UserCircle,
  LogOut,
  Library,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavLink } from '@/components/NavLinks';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Array<'ADMIN' | 'LIBRARIAN' | 'MEMBER'>;
}

const navItems: NavItem[] = [
  { 
    title: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'LIBRARIAN', 'MEMBER'] 
  },
  { 
    title: 'Books', 
    href: '/books', 
    icon: BookOpen, 
    roles: ['ADMIN', 'LIBRARIAN', 'MEMBER'] 
  },
  { 
    title: 'Members', 
    href: '/members', 
    icon: Users, 
    roles: ['ADMIN', 'LIBRARIAN'] 
  },
  { 
    title: 'Issue Book', 
    href: '/issue', 
    icon: BookPlus, 
    roles: ['ADMIN', 'LIBRARIAN'] 
  },
  { 
    title: 'Return Book', 
    href: '/return', 
    icon: BookCheck, 
    roles: ['ADMIN', 'LIBRARIAN'] 
  },
  { 
    title: 'Reservations', 
    href: '/reservations', 
    icon: CalendarClock, 
    roles: ['ADMIN', 'LIBRARIAN', 'MEMBER'] 
  },
  { 
    title: 'Profile', 
    href: '/profile', 
    icon: UserCircle, 
    roles: ['ADMIN', 'LIBRARIAN', 'MEMBER'] 
  },
];

export function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Library className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-serif text-lg font-bold text-white">
              Book Forge
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-gray-300 hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "text-gray-300 hover:bg-gray-800 hover:text-white",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-blue-600/20 text-white border-l-4 border-blue-500"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-700 p-3">
        {!collapsed && user && (
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-medium text-white">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-400">
              {user.role}
            </p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-gray-300 hover:bg-red-600 hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}