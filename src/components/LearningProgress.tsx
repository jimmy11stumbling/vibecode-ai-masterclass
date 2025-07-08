
import React, { useState } from 'react';
import { Trophy, Target, CheckCircle2, Clock, Star, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  date?: Date;
  points: number;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  category: string;
  deadline?: Date;
}

export const LearningProgress = () => {
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Completed your first coding lesson',
      icon: Star,
      unlocked: true,
      date: new Date('2024-01-15'),
      points: 100
    },
    {
      id: '2',
      title: 'React Master',
      description: 'Built 10 React components',
      icon: Trophy,
      unlocked: true,
      date: new Date('2024-01-20'),
      points: 500
    },
    {
      id: '3',
      title: 'API Expert',
      description: 'Created 5 RESTful APIs',
      icon: Award,
      unlocked: false,
      points: 750
    },
    {
      id: '4',
      title: 'Full Stack Hero',
      description: 'Complete a full-stack project',
      icon: Target,
      unlocked: false,
      points: 1000
    }
  ]);

  const [goals] = useState<LearningGoal[]>([
    {
      id: '1',
      title: 'Master React Hooks',
      description: 'Learn and implement all React hooks',
      progress: 7,
      target: 10,
      category: 'Frontend'
    },
    {
      id: '2',
      title: 'Database Design',
      description: 'Complete database design course',
      progress: 3,
      target: 8,
      category: 'Backend',
      deadline: new Date('2024-02-15')
    },
    {
      id: '3',
      title: 'Build Portfolio',
      description: 'Create 5 showcase projects',
      progress: 2,
      target: 5,
      category: 'Projects'
    }
  ]);

  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const overallProgress = (achievements.filter(a => a.unlocked).length / achievements.length) * 100;

  const getCategoryColor = (category: string) => {
    const colors = {
      Frontend: 'bg-blue-500',
      Backend: 'bg-green-500',
      Projects: 'bg-purple-500',
      Database: 'bg-yellow-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Learning Progress</h2>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{totalPoints} XP</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Overall Progress</span>
            <span className="text-white font-semibold">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Current Goals */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-400" />
          Current Goals
        </h3>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-white">{goal.title}</h4>
                  <Badge variant="secondary" className={`${getCategoryColor(goal.category)} text-white text-xs`}>
                    {goal.category}
                  </Badge>
                </div>
                <span className="text-sm text-slate-300">
                  {goal.progress}/{goal.target}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-3">{goal.description}</p>
              <div className="flex items-center justify-between">
                <Progress value={(goal.progress / goal.target) * 100} className="flex-1 h-2 mr-4" />
                {goal.deadline && (
                  <div className="flex items-center text-xs text-slate-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {goal.deadline.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-400" />
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                    : 'bg-slate-800 border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-yellow-500' : 'bg-slate-600'
                  }`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-slate-400'}`}>
                        {achievement.title}
                      </h4>
                      <span className={`text-sm font-semibold ${
                        achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'
                      }`}>
                        +{achievement.points} XP
                      </span>
                    </div>
                    <p className={`text-sm ${achievement.unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.date && (
                      <p className="text-xs text-slate-400 mt-1">
                        Unlocked {achievement.date.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {achievement.unlocked && (
                  <div className="mt-3 flex justify-end">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">24</div>
          <div className="text-sm text-slate-400">Lessons Completed</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">18h</div>
          <div className="text-sm text-slate-400">Study Time</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">7</div>
          <div className="text-sm text-slate-400">Projects Built</div>
        </div>
      </div>
    </div>
  );
};
