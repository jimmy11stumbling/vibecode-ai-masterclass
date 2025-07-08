
import React from 'react';
import { Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLessons } from '@/hooks/useLessons';
import { LessonProgress } from './LessonProgress';
import { LessonCard } from './LessonCard';

export const LessonNavigation = () => {
  const {
    lessons,
    selectedLesson,
    setSelectedLesson,
    completedLessons,
    totalLessons,
    progressPercentage,
    getDifficultyColor
  } = useLessons();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-full flex flex-col">
      <LessonProgress 
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressPercentage={progressPercentage}
      />

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              isSelected={selectedLesson === lesson.id}
              onSelect={setSelectedLesson}
              getDifficultyColor={getDifficultyColor}
            />
          ))}
        </div>
      </ScrollArea>

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
