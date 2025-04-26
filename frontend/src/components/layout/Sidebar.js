import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  FaceSmileIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Nếu chưa đăng nhập hoặc đang ở trang đăng nhập/đăng ký thì không hiển thị sidebar
  if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const navItems = [
    { name: 'Trang chủ', icon: HomeIcon, path: '/' },
    { name: 'Lịch', icon: CalendarIcon, path: '/calendar' },
    { name: 'Thống kê', icon: ChartBarIcon, path: '/stats' },
    { name: 'Tâm trạng', icon: FaceSmileIcon, path: '/mood' },
    { name: 'Cài đặt', icon: Cog6ToothIcon, path: '/settings' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="hidden sm:block w-64 bg-white shadow-sm">
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? 'bg-primary-light/10 text-primary'
                    : 'text-neutral-dark hover:bg-neutral-lightest'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    isActive(item.path) ? 'text-primary' : 'text-neutral'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;