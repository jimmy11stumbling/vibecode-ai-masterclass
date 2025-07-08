
import { useState } from 'react';

export interface Lesson {
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

export const useLessons = () => {
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

  const completedLessons = lessons.filter(l => l.completed).length;
  const totalLessons = lessons.length;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  const getDifficultyColor = (difficulty: Lesson['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return {
    lessons,
    selectedLesson,
    setSelectedLesson,
    completedLessons,
    totalLessons,
    progressPercentage,
    getDifficultyColor
  };
};
