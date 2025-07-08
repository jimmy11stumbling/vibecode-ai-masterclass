
import React from 'react';
import { PlayCircle, CheckCircle, Lock, Star, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Lesson } from '@/hooks/useLessons';

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  isSelected: boolean;
  onSelect: (lessonId: string) => void;
  getDifficultyColor: (difficulty: Lesson['difficulty']) => string;
}

export const LessonCard: React.FC<LessonCardProps> = ({ 
  lesson, 
  index, 
  isSelected, 
  onSelect, 
  getDifficultyColor 
}) => {
  return (
    <div
      onClick={() => !lesson.locked && onSelect(lesson.id)}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        lesson.locked
          ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
          : isSelected
          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/50'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {lesson.completed ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : lesson.locked ? (
            <Lock className="w-5 h-5 text-gray-500" />
          ) : (
            <PlayCircle className="w-5 h-5 text-blue-400" />
          )}
        </div>

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

          <div className="mt-2 text-xs text-gray-500">
            {lesson.enrolledCount.toLocaleString()} students enrolled
          </div>
        </div>
      </div>
    </div>
  );
};
