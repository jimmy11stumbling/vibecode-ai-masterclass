
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Database,
  Zap,
  Shield,
  Palette,
  Code,
  Bell,
  User,
  Server,
  Brain,
  Key,
  Monitor,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // AI Settings
    deepseekApiKey: '',
    aiModel: 'deepseek-reasoner',
    temperature: 0.7,
    maxTokens: 4000,
    
    // IDE Settings
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    autoSave: true,
    
    // MCP Settings
    mcpEnabled: true,
    maxAgents: 10,
    agentTimeout: 30000,
    
    // RAG Settings
    ragEnabled: true,
    embeddingModel: 'text-embedding-ada-002',
    maxResults: 10,
    similarityThreshold: 0.7,
    
    // Notification Settings
    enableNotifications: true,
    soundEnabled: true,
    emailNotifications: false,
    
    // Privacy Settings
    analyticsEnabled: true,
    errorReporting: true,
    usageStats: true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('sovereign-ai-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  };

  const saveSettings = () => {
    localStorage.setItem('sovereign-ai-settings', JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const resetSettings = () => {
    const defaultSettings = {
      deepseekApiKey: '',
      aiModel: 'deepseek-reasoner',
      temperature: 0.7,
      maxTokens: 4000,
      theme: 'dark',
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: true,
      autoSave: true,
      mcpEnabled: true,
      maxAgents: 10,
      agentTimeout: 30000,
      ragEnabled: true,
      embeddingModel: 'text-embedding-ada-002',
      maxResults: 10,
      similarityThreshold: 0.7,
      enableNotifications: true,
      soundEnabled: true,
      emailNotifications: false,
      analyticsEnabled: true,
      errorReporting: true,
      usageStats: true,
    };
    setSettings(defaultSettings);
    setHasChanges(true);
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-300">Configure your Sovereign AI IDE experience</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <Badge variant="outline" className="text-amber-400 border-amber-400">
                Unsaved changes
              </Badge>
            )}
            <Button onClick={resetSettings} variant="outline" className="border-slate-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveSettings} disabled={!hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="ide" className="data-[state=active]:bg-purple-600">
              <Code className="w-4 h-4 mr-2" />
              IDE
            </TabsTrigger>
            <TabsTrigger value="mcp" className="data-[state=active]:bg-purple-600">
              <Server className="w-4 h-4 mr-2" />
              MCP
            </TabsTrigger>
            <TabsTrigger value="rag" className="data-[state=active]:bg-purple-600">
              <Database className="w-4 h-4 mr-2" />
              RAG
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-purple-600">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* AI Settings */}
          <TabsContent value="ai">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deepseek-key" className="text-white">DeepSeek API Key</Label>
                  <Input
                    id="deepseek-key"
                    type="password"
                    value={settings.deepseekApiKey}
                    onChange={(e) => updateSetting('deepseekApiKey', e.target.value)}
                    placeholder="Enter your DeepSeek API key"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-model" className="text-white">AI Model</Label>
                  <Select 
                    value={settings.aiModel} 
                    onValueChange={(value) => updateSetting('aiModel', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek-reasoner">DeepSeek Reasoner</SelectItem>
                      <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                      <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-white">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens" className="text-white">Max Tokens</Label>
                    <Input
                      id="max-tokens"
                      type="number"
                      min="100"
                      max="8000"
                      value={settings.maxTokens}
                      onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IDE Settings */}
          <TabsContent value="ide">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="w-5 h-5 mr-2 text-blue-400" />
                  IDE Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-white">Theme</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value) => updateSetting('theme', value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-size" className="text-white">Font Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      min="10"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="word-wrap" className="text-white">Word Wrap</Label>
                    <Switch
                      id="word-wrap"
                      checked={settings.wordWrap}
                      onCheckedChange={(checked) => updateSetting('wordWrap', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minimap" className="text-white">Show Minimap</Label>
                    <Switch
                      id="minimap"
                      checked={settings.minimap}
                      onCheckedChange={(checked) => updateSetting('minimap', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save" className="text-white">Auto Save</Label>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MCP Settings */}
          <TabsContent value="mcp">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Server className="w-5 h-5 mr-2 text-green-400" />
                  MCP Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable MCP</Label>
                    <p className="text-slate-400 text-sm">Model Context Protocol for agent communication</p>
                  </div>
                  <Switch
                    checked={settings.mcpEnabled}
                    onCheckedChange={(checked) => updateSetting('mcpEnabled', checked)}
                  />
                </div>

                <Separator className="bg-slate-600" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-agents" className="text-white">Max Agents</Label>
                    <Input
                      id="max-agents"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.maxAgents}
                      onChange={(e) => updateSetting('maxAgents', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-timeout" className="text-white">Agent Timeout (ms)</Label>
                    <Input
                      id="agent-timeout"
                      type="number"
                      min="1000"
                      max="300000"
                      value={settings.agentTimeout}
                      onChange={(e) => updateSetting('agentTimeout', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RAG Settings */}
          <TabsContent value="rag">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="w-5 h-5 mr-2 text-cyan-400" />
                  RAG 2.0 Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable RAG</Label>
                    <p className="text-slate-400 text-sm">Retrieval-Augmented Generation for knowledge queries</p>
                  </div>
                  <Switch
                    checked={settings.ragEnabled}
                    onCheckedChange={(checked) => updateSetting('ragEnabled', checked)}
                  />
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-2">
                  <Label htmlFor="embedding-model" className="text-white">Embedding Model</Label>
                  <Select 
                    value={settings.embeddingModel} 
                    onValueChange={(value) => updateSetting('embeddingModel', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-embedding-ada-002">OpenAI Ada 002</SelectItem>
                      <SelectItem value="text-embedding-3-small">OpenAI 3 Small</SelectItem>
                      <SelectItem value="text-embedding-3-large">OpenAI 3 Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-results" className="text-white">Max Results</Label>
                    <Input
                      id="max-results"
                      type="number"
                      min="1"
                      max="50"
                      value={settings.maxResults}
                      onChange={(e) => updateSetting('maxResults', parseInt(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="similarity-threshold" className="text-white">Similarity Threshold</Label>
                    <Input
                      id="similarity-threshold"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.similarityThreshold}
                      onChange={(e) => updateSetting('similarityThreshold', parseFloat(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-yellow-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable Notifications</Label>
                      <p className="text-slate-400 text-sm">Receive notifications for important events</p>
                    </div>
                    <Switch
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Sound Notifications</Label>
                      <p className="text-slate-400 text-sm">Play sound for notifications</p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-slate-400 text-sm">Receive email notifications</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-400" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Analytics</Label>
                      <p className="text-slate-400 text-sm">Help improve the IDE by sharing usage analytics</p>
                    </div>
                    <Switch
                      checked={settings.analyticsEnabled}
                      onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Error Reporting</Label>
                      <p className="text-slate-400 text-sm">Automatically report errors to help fix bugs</p>
                    </div>
                    <Switch
                      checked={settings.errorReporting}
                      onCheckedChange={(checked) => updateSetting('errorReporting', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Usage Statistics</Label>
                      <p className="text-slate-400 text-sm">Collect usage statistics for feature improvements</p>
                    </div>
                    <Switch
                      checked={settings.usageStats}
                      onCheckedChange={(checked) => updateSetting('usageStats', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
