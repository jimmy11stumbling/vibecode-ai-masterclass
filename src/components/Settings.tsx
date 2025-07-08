
import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Code, Shield, Download, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoSave: true,
    codeCompletion: true,
    fontSize: 'medium',
    editorTheme: 'dark',
    language: 'english',
    privacyMode: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Settings</h2>
        </div>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
          v2.1.0
        </Badge>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-white/10">
          <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="general" className="data-[state=active]:bg-white/20">General</TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-white/20">Editor</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20">Notifications</TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-white/20">Privacy</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 p-6">
          <TabsContent value="general" className="mt-0 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">General Preferences</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Theme</label>
                  <p className="text-xs text-gray-400">Choose your preferred theme</p>
                </div>
                <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Language</label>
                  <p className="text-xs text-gray-400">Interface language</p>
                </div>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Auto Save</label>
                  <p className="text-xs text-gray-400">Automatically save your work</p>
                </div>
                <Switch 
                  checked={settings.autoSave} 
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h4 className="text-sm font-medium text-white mb-3">Data Management</h4>
              <div className="flex space-x-3">
                <Button size="sm" variant="outline" className="border-white/20">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm" variant="outline" className="border-white/20">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
                <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="mt-0 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Editor Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Font Size</label>
                  <p className="text-xs text-gray-400">Editor font size</p>
                </div>
                <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Editor Theme</label>
                  <p className="text-xs text-gray-400">Code editor appearance</p>
                </div>
                <Select value={settings.editorTheme} onValueChange={(value) => updateSetting('editorTheme', value)}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="monokai">Monokai</SelectItem>
                    <SelectItem value="solarized">Solarized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Code Completion</label>
                  <p className="text-xs text-gray-400">Enable auto-completion</p>
                </div>
                <Switch 
                  checked={settings.codeCompletion} 
                  onCheckedChange={(checked) => updateSetting('codeCompletion', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Notification Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Push Notifications</label>
                  <p className="text-xs text-gray-400">Receive notifications</p>
                </div>
                <Switch 
                  checked={settings.notifications} 
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Lesson reminders</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Achievement alerts</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Weekly progress</span>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="mt-0 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Privacy & Security</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Privacy Mode</label>
                  <p className="text-xs text-gray-400">Enhanced privacy protection</p>
                </div>
                <Switch 
                  checked={settings.privacyMode} 
                  onCheckedChange={(checked) => updateSetting('privacyMode', checked)}
                />
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Data Protection</h4>
                    <p className="text-xs text-gray-400">Your data is encrypted and stored securely. We never share personal information with third parties.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>

        <div className="p-6 border-t border-white/10">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Last saved: {new Date().toLocaleString()}
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Save Changes
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
};
