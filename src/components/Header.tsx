
import React from 'react';
import { Code2, User, Settings, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Vibecode</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive('/') ? 'text-white' : 'text-gray-300'
              }`}
            >
              Learn
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive('/dashboard') ? 'text-white' : 'text-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/ide"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive('/ide') ? 'text-white' : 'text-gray-300'
              }`}
            >
              IDE
            </Link>
            <a
              href="#community"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Community
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button
              size="sm"
              variant="ghost" 
              className="text-gray-300 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Profile Dropdown */}
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-300 hover:text-white flex items-center space-x-2"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm">Developer</span>
              </Button>
            </div>

            {/* Logout */}
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
