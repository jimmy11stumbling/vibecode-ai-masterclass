
import React from 'react';
import { BookOpen, Clock, Users, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LessonProgressProps {
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  completedLessons,
  totalLessons,
  progressPercentage
}) => {
  return (
    <div className="p-6 border-b border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Learning Path</h2>
      </div>
      
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
  );
};
