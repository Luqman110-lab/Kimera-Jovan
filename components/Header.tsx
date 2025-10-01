
import React from 'react';
import { Page } from '../types';
import { HomeIcon, ClipboardIcon, BookOpenIcon, ChartBarIcon, UserGroupIcon, SettingsIcon } from './Icons';

interface HeaderProps {
  setPage: (page: Page) => void;
  currentPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ setPage, currentPage }) => {
  const navItems = [
    { page: Page.DASHBOARD, label: 'Dashboard', icon: <HomeIcon className="w-5 h-5 mr-2" /> },
    { page: Page.TEACHERS, label: 'Teachers', icon: <UserGroupIcon className="w-5 h-5 mr-2" /> },
    { page: Page.SUPERVISION, label: 'Supervision', icon: <ClipboardIcon className="w-5 h-5 mr-2" /> },
    { page: Page.BOOK_CHECKING, label: 'Book Checking', icon: <BookOpenIcon className="w-5 h-5 mr-2" /> },
    { page: Page.WORK_COVERAGE, label: 'Work Coverage', icon: <ChartBarIcon className="w-5 h-5 mr-2" /> },
    { page: Page.SETTINGS, label: 'Settings', icon: <SettingsIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Teacher Monitor</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  currentPage === item.page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
           <div className="md:hidden">
              <select 
                onChange={(e) => setPage(e.target.value as Page)}
                value={currentPage}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {navItems.map(item => <option key={item.page} value={item.page}>{item.label}</option>)}
              </select>
           </div>
        </div>
      </div>
    </header>
  );
};
