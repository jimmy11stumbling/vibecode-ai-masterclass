
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Code, Activity, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white/20 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
          
          <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
            <Link to="/ide">
              <Code className="w-4 h-4 mr-2" />
              IDE
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
            <Link to="/dashboard">
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
            <Link to="/learning">
              <BookOpen className="w-4 h-4 mr-2" />
              Learning
            </Link>
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
