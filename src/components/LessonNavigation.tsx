
import React, { useState } from 'react';
import { Star, BookOpen, Play } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useLessons } from '@/hooks/useLessons';
import { LessonProgress } from './LessonProgress';
import { LessonCard } from './LessonCard';
import { Tutorial } from './Tutorial';

export const LessonNavigation = () => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'tutorial'>('lessons');
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
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-full flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'lessons' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 ${
              activeTab === 'lessons'
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Lessons
          </Button>
          <Button
            variant={activeTab === 'tutorial' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tutorial')}
            className={`flex-1 ${
              activeTab === 'tutorial'
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Play className="w-4 h-4 mr-2" />
            Tutorial
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'lessons' ? (
          <div className="h-full flex flex-col">
            <LessonProgress 
              completedLessons={completedLessons}
              totalLessons={totalLessons}
              progressPercentage={progressPercentage}
            />

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
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
            </div>

            <div className="p-6 border-t border-white/10 flex-shrink-0">
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
        ) : (
          <Tutorial />
        )}
      </div>
    </div>
  );
};
