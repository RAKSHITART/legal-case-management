import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiUser,
  FiBell,
  FiCheckSquare
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen }) => {
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: FiHome },
    { path: '/cases', name: 'Cases', icon: FiBriefcase },
    { path: '/clients', name: 'Clients', icon: FiUsers },
    { path: '/calendar', name: 'Calendar', icon: FiCalendar },
    { path: '/tasks', name: 'Tasks', icon: FiCheckSquare },
    { path: '/notifications', name: 'Notifications', icon: FiBell },
    { path: '/profile', name: 'Profile', icon: FiUser },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-20
        ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors group
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className={`text-xl ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}

                {!sidebarOpen && (
                  <div className="absolute left-20 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;