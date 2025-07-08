
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Target, Calendar, Activity, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  averageTime: string;
  totalLessons: number;
  completedLessons: number;
  skillProgress: Array<{
    skill: string;
    progress: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  weeklyActivity: Array<{
    day: string;
    hours: number;
    lessons: number;
  }>;
  achievements: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [data] = useState<AnalyticsData>({
    totalUsers: 12580,
    activeUsers: 8945,
    completionRate: 78,
    averageTime: '2h 45m',
    totalLessons: 45,
    completedLessons: 32,
    skillProgress: [
      { skill: 'React', progress: 85, trend: 'up' },
      { skill: 'TypeScript', progress: 72, trend: 'up' },
      { skill: 'Node.js', progress: 68, trend: 'stable' },
      { skill: 'CSS', progress: 90, trend: 'up' },
      { skill: 'Database', progress: 45, trend: 'down' }
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 3.2, lessons: 4 },
      { day: 'Tue', hours: 2.8, lessons: 3 },
      { day: 'Wed', hours: 4.1, lessons: 5 },
      { day: 'Thu', hours: 3.6, lessons: 4 },
      { day: 'Fri', hours: 2.4, lessons: 2 },
      { day: 'Sat', hours: 1.8, lessons: 2 },
      { day: 'Sun', hours: 2.1, lessons: 3 }
    ],
    achievements: [
      { name: 'First Steps', count: 1250, percentage: 89 },
      { name: 'Code Warrior', count: 890, percentage: 63 },
      { name: 'Quick Learner', count: 567, percentage: 40 },
      { name: 'Master Builder', count: 234, percentage: 17 }
    ]
  });

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      case 'stable': return <Activity className="w-3 h-3 text-yellow-400" />;
    }
  };

  const maxHours = Math.max(...data.weeklyActivity.map(d => d.hours));

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Analytics Dashboard</h2>
          </div>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="week" className="data-[state=active]:bg-white/20">Week</TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-white/20">Month</TabsTrigger>
              <TabsTrigger value="year" className="data-[state=active]:bg-white/20">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  +12%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{data.totalUsers.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Users</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  +8%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{data.activeUsers.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Active Users</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-purple-400" />
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  +5%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{data.completionRate}%</div>
              <div className="text-xs text-gray-400">Completion Rate</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                  +15%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{data.averageTime}</div>
              <div className="text-xs text-gray-400">Avg. Study Time</div>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Learning Progress</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Overall Progress</span>
                  <span className="text-sm text-gray-300">
                    {data.completedLessons}/{data.totalLessons} lessons
                  </span>
                </div>
                <Progress value={(data.completedLessons / data.totalLessons) * 100} className="h-3 mb-4" />
                
                <div className="space-y-3">
                  {data.skillProgress.map((skill) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white">{skill.skill}</span>
                        {getTrendIcon(skill.trend)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={skill.progress} className="w-20 h-2" />
                        <span className="text-xs text-gray-400 w-8">{skill.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-3">Weekly Activity</h4>
                <div className="space-y-2">
                  {data.weeklyActivity.map((activity) => (
                    <div key={activity.day} className="flex items-center space-x-3">
                      <span className="text-xs text-gray-400 w-8">{activity.day}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-2 relative">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${(activity.hours / maxHours) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300 w-12">{activity.hours}h</span>
                      <span className="text-xs text-gray-400 w-8">{activity.lessons}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-400" />
              Achievement Statistics
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.achievements.map((achievement) => (
                <div key={achievement.name} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{achievement.name}</h4>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      {achievement.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{achievement.count} users</span>
                    <span>unlocked</span>
                  </div>
                  <Progress value={achievement.percentage} className="h-2 mt-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { time: '2 hours ago', action: 'Completed React Hooks lesson', user: 'john_dev' },
                { time: '4 hours ago', action: 'Started TypeScript course', user: 'sarah_codes' },
                { time: '6 hours ago', action: 'Achieved Code Warrior badge', user: 'mike_frontend' },
                { time: '8 hours ago', action: 'Built first React component', user: 'anna_learns' },
                { time: '1 day ago', action: 'Completed CSS Grid tutorial', user: 'dev_master' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                  <div>
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
