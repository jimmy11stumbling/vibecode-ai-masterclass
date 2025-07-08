
import React from 'react';
import { Clock, Star, Users, Lock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  getDifficultyColor: (difficulty: Lesson['difficulty']) => string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  index,
  isSelected,
  onSelect,
  getDifficultyColor
}) => {
  const handleClick = () => {
    if (!lesson.locked) {
      onSelect(lesson.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-lg border transition-all duration-200 ${
        lesson.locked
          ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/10'
          : isSelected
          ? 'bg-white/20 border-white/30 cursor-pointer'
          : 'bg-white/10 border-white/20 cursor-pointer hover:bg-white/15'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            lesson.completed
              ? 'bg-green-500 text-white'
              : lesson.locked
              ? 'bg-gray-600 text-gray-300'
              : 'bg-blue-500 text-white'
          }`}>
            {lesson.completed ? (
              <CheckCircle className="w-4 h-4" />
            ) : lesson.locked ? (
              <Lock className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white text-sm">{lesson.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{lesson.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <Badge className={`text-xs ${getDifficultyColor(lesson.difficulty)}`}>
          {lesson.difficulty}
        </Badge>
        <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
          {lesson.category}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{lesson.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{lesson.enrolledCount.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span>{lesson.rating}</span>
        </div>
      </div>
    </div>
  );
};
