
import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  Trophy
} from 'lucide-react';

const lessons = [
  {
    id: 1,
    title: "Prompt Engineering Basics",
    description: "Master the fundamentals",
    progress: 100,
    completed: true,
    icon: BookOpen,
    lessons: 4
  },
  {
    id: 2,
    title: "Full-Stack Development",
    description: "React, Node.js, and more",
    progress: 65,
    completed: false,
    icon: Code,
    lessons: 8
  },
  {
    id: 3,
    title: "AI-Powered Coding",
    description: "Leverage AI for productivity",
    progress: 20,
    completed: false,
    icon: Sparkles,
    lessons: 6
  },
  {
    id: 4,
    title: "Advanced Patterns",
    description: "Complex problem solving",
    progress: 0,
    completed: false,
    icon: Target,
    lessons: 10
  }
];

export const LessonNavigation = () => {
  const [activeLesson, setActiveLesson] = useState(2);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Learning Path</h2>
        <div className="flex items-center space-x-1 bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
          <Trophy className="w-3 h-3" />
          <span>Level 3</span>
        </div>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const Icon = lesson.icon;
          const isActive = lesson.id === activeLesson;
          
          return (
            <div
              key={lesson.id}
              onClick={() => setActiveLesson(lesson.id)}
              className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  lesson.completed 
                    ? 'bg-green-500/20 text-green-400' 
                    : isActive 
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {lesson.completed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-sm">{lesson.title}</h3>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                      isActive ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{lesson.description}</p>
                  <div className="text-xs text-gray-500 mt-2">{lesson.lessons} lessons</div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{lesson.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          lesson.completed 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                            : 'bg-gradient-to-r from-purple-400 to-blue-500'
                        }`}
                        style={{ width: `${lesson.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Daily Streak</span>
        </div>
        <p className="text-xs text-gray-300">7 days in a row! Keep it up! 🔥</p>
      </div>
    </div>
  );
};
