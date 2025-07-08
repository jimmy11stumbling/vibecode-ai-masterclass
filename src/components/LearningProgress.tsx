
import React, { useState } from 'react';
import { Trophy, Target, Clock, Star, TrendingUp, Award, BookOpen, Code2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  category: string;
  experience: number;
  maxExperience: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const LearningProgress: React.FC = () => {
  const [skills] = useState<Skill[]>([
    {
      id: '1',
      name: 'React',
      level: 5,
      maxLevel: 10,
      category: 'Frontend',
      experience: 750,
      maxExperience: 1000
    },
    {
      id: '2',
      name: 'TypeScript',
      level: 4,
      maxLevel: 10,
      category: 'Language',
      experience: 600,
      maxExperience: 800
    },
    {
      id: '3',
      name: 'Node.js',
      level: 3,
      maxLevel: 10,
      category: 'Backend',
      experience: 400,
      maxExperience: 600
    },
    {
      id: '4',
      name: 'Database Design',
      level: 2,
      maxLevel: 10,
      category: 'Backend',
      experience: 150,
      maxExperience: 400
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: <Star className="w-4 h-4" />,
      unlocked: true,
      unlockedAt: new Date('2024-01-01'),
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Code Warrior',
      description: 'Write 1000 lines of code',
      icon: <Code2 className="w-4 h-4" />,
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Quick Learner',
      description: 'Complete 5 lessons in one day',
      icon: <TrendingUp className="w-4 h-4" />,
      unlocked: true,
      unlockedAt: new Date('2024-01-20'),
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Master Builder',
      description: 'Build and deploy 10 projects',
      icon: <Trophy className="w-4 h-4" />,
      unlocked: false,
      rarity: 'legendary'
    }
  ]);

  const [stats] = useState({
    totalLessons: 45,
    completedLessons: 32,
    studyStreak: 12,
    totalHours: 89,
    projectsBuilt: 7,
    skillPoints: 2150
  });

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend': return 'bg-blue-500/20 text-blue-400';
      case 'backend': return 'bg-green-500/20 text-green-400';
      case 'language': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Learning Progress</h3>
        </div>
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
          Level {Math.floor(stats.skillPoints / 500) + 1}
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Lessons</span>
              </div>
              <div className="mt-1">
                <div className="text-lg font-bold text-white">{stats.completedLessons}</div>
                <div className="text-xs text-slate-400">of {stats.totalLessons}</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Streak</span>
              </div>
              <div className="mt-1">
                <div className="text-lg font-bold text-white">{stats.studyStreak}</div>
                <div className="text-xs text-slate-400">days</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400">Hours</span>
              </div>
              <div className="mt-1">
                <div className="text-lg font-bold text-white">{stats.totalHours}</div>
                <div className="text-xs text-slate-400">studied</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Code2 className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">Projects</span>
              </div>
              <div className="mt-1">
                <div className="text-lg font-bold text-white">{stats.projectsBuilt}</div>
                <div className="text-xs text-slate-400">built</div>
              </div>
            </div>
          </div>

          {/* Skills Progress */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
              Skills Progress
            </h4>
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">{skill.name}</span>
                      <Badge className={`text-xs ${getCategoryColor(skill.category)}`}>
                        {skill.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      Level {skill.level}/{skill.maxLevel}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={(skill.level / skill.maxLevel) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{skill.experience} XP</span>
                      <span>{skill.maxExperience} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-400" />
              Achievements
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`bg-slate-800 rounded-lg p-3 flex items-center space-x-3 ${
                    achievement.unlocked ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="text-sm font-medium text-white truncate">
                        {achievement.title}
                      </h5>
                      <Badge 
                        className={`text-xs ${getRarityColor(achievement.rarity)} text-white`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-green-400 mt-1">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Progress */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Overall Progress</h4>
              <span className="text-xs text-slate-400">
                {stats.skillPoints} XP
              </span>
            </div>
            
            <Progress 
              value={(stats.completedLessons / stats.totalLessons) * 100} 
              className="h-3 mb-2"
            />
            
            <div className="flex justify-between text-xs text-slate-400">
              <span>{Math.round((stats.completedLessons / stats.totalLessons) * 100)}% Complete</span>
              <span>{stats.totalLessons - stats.completedLessons} lessons remaining</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
