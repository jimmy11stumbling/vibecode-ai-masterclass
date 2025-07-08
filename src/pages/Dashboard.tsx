
import React, { useState } from 'react';
import { 
  Code2, 
  BookOpen, 
  Trophy, 
  Users, 
  TrendingUp, 
  Calendar,
  Play,
  Star,
  Clock,
  Target,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [activeProjects] = useState([
    {
      id: 1,
      name: 'E-commerce React App',
      progress: 75,
      lastWorked: '2 hours ago',
      tech: ['React', 'TypeScript', 'Tailwind']
    },
    {
      id: 2,
      name: 'Node.js API Server',
      progress: 40,
      lastWorked: '1 day ago',
      tech: ['Node.js', 'Express', 'MongoDB']
    },
    {
      id: 3,
      name: 'Portfolio Website',
      progress: 90,
      lastWorked: '3 days ago',
      tech: ['Next.js', 'Framer Motion']
    }
  ]);

  const [recentLessons] = useState([
    {
      id: 1,
      title: 'Advanced React Hooks',
      category: 'Frontend',
      completed: true,
      duration: '45 min'
    },
    {
      id: 2,
      title: 'Database Design Patterns',
      category: 'Backend',
      completed: false,
      duration: '60 min'
    },
    {
      id: 3,
      title: 'RESTful API Design',
      category: 'Backend',
      completed: true,
      duration: '30 min'
    }
  ]);

  const stats = {
    totalProjects: 12,
    completedLessons: 24,
    studyHours: 156,
    currentStreak: 7
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Developer! 👋</h1>
          <p className="text-gray-300">Continue your learning journey and build amazing projects.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Projects</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
              <Code2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Lessons Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedLessons}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Study Hours</p>
                <p className="text-2xl font-bold text-white">{stats.studyHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-white">{stats.currentStreak} days</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Active Projects</h2>
                <Link to="/ide">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-white mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-400">Last worked: {project.lastWorked}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-white">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {project.tech.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs bg-white/20 text-gray-300">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Lessons & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Lessons */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Lessons</h2>
              <div className="space-y-3">
                {recentLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{lesson.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                          {lesson.category}
                        </Badge>
                        <span className="text-xs text-gray-400">{lesson.duration}</span>
                      </div>
                    </div>
                    <div className="ml-2">
                      {lesson.completed ? (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      ) : (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-blue-400">
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/ide" className="block">
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-white/10">
                    <Code2 className="w-4 h-4 mr-3" />
                    Open IDE
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
                
                <Link to="/lessons" className="block">
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-white/10">
                    <BookOpen className="w-4 h-4 mr-3" />
                    Browse Lessons
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>

                <Link to="/progress" className="block">
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-white/10">
                    <Trophy className="w-4 h-4 mr-3" />
                    View Progress
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>

                <Link to="/community" className="block">
                  <Button variant="ghost" className="w-full justify-start text-left hover:bg-white/10">
                    <Users className="w-4 h-4 mr-3" />
                    Join Community
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
