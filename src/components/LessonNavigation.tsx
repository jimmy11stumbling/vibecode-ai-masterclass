
import React, { useState } from 'react';
import { BookOpen, PlayCircle, CheckCircle, Lock, Star, Clock, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  locked: boolean;
  rating: number;
  enrolledCount: number;
  category: string;
}

export const LessonNavigation = () => {
  const [lessons] = useState<Lesson[]>([
    {
      id: '1',
      title: 'Introduction to React',
      description: 'Learn the fundamentals of React including components, JSX, and props.',
      duration: '45 min',
      difficulty: 'beginner',
      completed: true,
      locked: false,
      rating: 4.8,
      enrolledCount: 12500,
      category: 'Frontend'
    },
    {
      id: '2',
      title: 'State Management with Hooks',
      description: 'Master useState, useEffect, and other essential React hooks.',
      duration: '60 min',
      difficulty: 'beginner',
      completed: true,
      locked: false,
      rating: 4.9,
      enrolledCount: 9800,
      category: 'Frontend'
    },
    {
      id: '3',
      title: 'Building Interactive Components',
      description: 'Create dynamic and interactive React components with event handling.',
      duration: '75 min',
      difficulty: 'intermediate',
      completed: false,
      locked: false,
      rating: 4.7,
      enrolledCount: 7200,
      category: 'Frontend'
    },
    {
      id: '4',
      title: 'API Integration & Data Fetching',
      description: 'Learn to fetch and manage data from APIs in React applications.',
      duration: '90 min',
      difficulty: 'intermediate',
      completed: false,
      locked: false,
      rating: 4.6,
      enrolledCount: 5400,
      category: 'Frontend'
    },
    {
      id: '5',
      title: 'Advanced React Patterns',
      description: 'Explore render props, HOCs, and compound component patterns.',
      duration: '120 min',
      difficulty: 'advanced',
      completed: false,
      locked: true,
      rating: 4.9,
      enrolledCount: 3200,
      category: 'Frontend'
    },
    {
      id: '6',
      title: 'TypeScript with React',
      description: 'Add type safety to your React applications with TypeScript.',
      duration: '100 min',
      difficulty: 'intermediate',
      completed: false,
      locked: true,
      rating: 4.8,
      enrolledCount: 4100,
      category: 'Frontend'
    }
  ]);

  const [selectedLesson, setSelectedLesson] = useState<string>('3');

  const getDifficultyColor = (difficulty: Lesson['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const completedLessons = lessons.filter(l => l.completed).length;
  const totalLessons = lessons.length;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Learning Path</h2>
        </div>
        
        {/* Progress Overview */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Progress</span>
            <span>{completedLessons}/{totalLessons} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-white/10" />
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>~8 hours total</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>42K+ students</span>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => !lesson.locked && setSelectedLesson(lesson.id)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                lesson.locked
                  ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                  : selectedLesson === lesson.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {lesson.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : lesson.locked ? (
                    <Lock className="w-5 h-5 text-gray-500" />
                  ) : (
                    <PlayCircle className="w-5 h-5 text-blue-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-400 font-medium">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-medium text-white text-sm truncate">
                      {lesson.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {lesson.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs border ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500">{lesson.duration}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-400">{lesson.rating}</span>
                    </div>
                  </div>

                  {/* Enrollment count */}
                  <div className="mt-2 text-xs text-gray-500">
                    {lesson.enrolledCount.toLocaleString()} students enrolled
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-6 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">
            Complete lessons to unlock advanced content
          </p>
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>4.8 average rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};
