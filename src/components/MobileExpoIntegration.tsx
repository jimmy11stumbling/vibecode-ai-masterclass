
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Play, 
  Square, 
  QrCode, 
  Download,
  Settings,
  Code,
  Eye,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpoProject {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'both';
  status: 'developing' | 'building' | 'ready' | 'error';
  qrCode?: string;
  buildProgress: number;
  preview?: string;
  lastUpdate: Date;
}

interface MobileExpoIntegrationProps {
  projectFiles: any[];
  onProjectUpdate: (files: any[]) => void;
}

export const MobileExpoIntegration: React.FC<MobileExpoIntegrationProps> = ({
  projectFiles,
  onProjectUpdate
}) => {
  const [activeProject, setActiveProject] = useState<ExpoProject | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [buildQueue, setBuildQueue] = useState<ExpoProject[]>([]);
  const { toast } = useToast();

  const expoTemplates = [
    {
      id: 'blank',
      name: 'Blank Template',
      description: 'Start with a minimal React Native app',
      icon: '📱',
      complexity: 'Beginner'
    },
    {
      id: 'navigation',
      name: 'Navigation Template',
      description: 'App with React Navigation setup',
      icon: '🧭',
      complexity: 'Intermediate'
    },
    {
      id: 'tabs',
      name: 'Tabs Template',
      description: 'Bottom tab navigation app',
      icon: '📋',
      complexity: 'Beginner'
    },
    {
      id: 'camera',
      name: 'Camera App',
      description: 'Photo capture and manipulation',
      icon: '📸',
      complexity: 'Advanced'
    }
  ];

  const handleCreateExpoProject = (templateId: string) => {
    const template = expoTemplates.find(t => t.id === templateId);
    
    const newProject: ExpoProject = {
      id: `expo-${Date.now()}`,
      name: `${template?.name.replace(' Template', '')} App`,
      platform: 'both',
      status: 'developing',
      buildProgress: 0,
      lastUpdate: new Date()
    };

    setActiveProject(newProject);
    
    // Generate Expo project files
    const expoFiles = generateExpoProjectFiles(templateId);
    onProjectUpdate([...projectFiles, ...expoFiles]);
    
    toast({
      title: "Expo Project Created",
      description: `${newProject.name} is ready for development`,
    });
  };

  const handleStartPreview = async () => {
    if (!activeProject) return;

    setActiveProject({
      ...activeProject,
      status: 'building',
      buildProgress: 0
    });

    // Simulate build process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveProject(prev => prev ? {
        ...prev,
        buildProgress: i
      } : null);
    }

    // Generate QR code for preview
    const qrCode = generateQRCode();
    
    setActiveProject(prev => prev ? {
      ...prev,
      status: 'ready',
      qrCode,
      buildProgress: 100
    } : null);

    toast({
      title: "Preview Ready",
      description: "Scan the QR code with Expo Go to preview your app",
    });
  };

  const handleStopPreview = () => {
    setActiveProject(prev => prev ? {
      ...prev,
      status: 'developing',
      qrCode: undefined,
      buildProgress: 0
    } : null);

    toast({
      title: "Preview Stopped",
      description: "Development server has been stopped",
    });
  };

  const generateExpoProjectFiles = (templateId: string) => {
    const baseFiles = [
      {
        id: 'app-json',
        name: 'app.json',
        type: 'file' as const,
        content: JSON.stringify({
          expo: {
            name: 'My Expo App',
            slug: 'my-expo-app',
            version: '1.0.0',
            orientation: 'portrait',
            icon: './assets/icon.png',
            splash: {
              image: './assets/splash.png',
              resizeMode: 'contain',
              backgroundColor: '#ffffff'
            },
            platforms: ['ios', 'android', 'web']
          }
        }, null, 2)
      },
      {
        id: 'package-json',
        name: 'package.json',
        type: 'file' as const,
        content: JSON.stringify({
          name: 'my-expo-app',
          version: '1.0.0',
          main: 'node_modules/expo/AppEntry.js',
          scripts: {
            start: 'expo start',
            android: 'expo start --android',
            ios: 'expo start --ios',
            web: 'expo start --web'
          },
          dependencies: {
            'expo': '~49.0.0',
            'react': '18.2.0',
            'react-native': '0.72.6',
            '@react-navigation/native': '^6.0.0',
            '@react-navigation/bottom-tabs': '^6.0.0'
          }
        }, null, 2)
      }
    ];

    const templateFiles = getTemplateSpecificFiles(templateId);
    return [...baseFiles, ...templateFiles];
  };

  const getTemplateSpecificFiles = (templateId: string) => {
    switch (templateId) {
      case 'blank':
        return [
          {
            id: 'app-tsx',
            name: 'App.tsx',
            type: 'file' as const,
            content: `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Hello, Expo!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});`
          }
        ];
      
      case 'navigation':
        return [
          {
            id: 'app-navigation',
            name: 'App.tsx',
            type: 'file' as const,
            content: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`
          }
        ];
      
      default:
        return [];
    }
  };

  const generateQRCode = () => {
    // In a real implementation, this would generate an actual QR code
    return `exp://${Math.random().toString(36).substring(7)}.exp.direct:80`;
  };

  const simulateDeviceConnection = () => {
    setIsConnected(true);
    setDeviceInfo({
      name: 'iPhone 14 Pro',
      platform: 'iOS',
      version: '16.5',
      connected: true
    });

    toast({
      title: "Device Connected",
      description: "iPhone 14 Pro connected via Expo Go",
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-green-400" />
              Mobile Development (Expo)
            </h3>
            <p className="text-sm text-slate-400">Build and preview mobile apps instantly</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">
                <WifiOff className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="develop" className="h-full flex flex-col">
          <div className="border-b border-slate-700 px-4">
            <TabsList className="bg-slate-800">
              <TabsTrigger value="develop" className="data-[state=active]:bg-slate-700">
                Develop
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                Preview
              </TabsTrigger>
              <TabsTrigger value="build" className="data-[state=active]:bg-slate-700">
                Build
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="develop" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {!activeProject ? (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Choose a Template</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {expoTemplates.map(template => (
                        <Card key={template.id} className="bg-slate-800 border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">{template.icon}</div>
                              <div className="flex-1">
                                <h5 className="text-white font-medium">{template.name}</h5>
                                <p className="text-sm text-slate-400 mb-2">{template.description}</p>
                                <div className="flex items-center justify-between">
                                  <Badge className={
                                    template.complexity === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                    template.complexity === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }>
                                    {template.complexity}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => handleCreateExpoProject(template.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Create
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card className="bg-slate-800 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          {activeProject.name}
                          <Badge className={
                            activeProject.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                            activeProject.status === 'building' ? 'bg-yellow-500/20 text-yellow-400' :
                            activeProject.status === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }>
                            {activeProject.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-2">
                          <Button
                            onClick={activeProject.status === 'ready' ? handleStopPreview : handleStartPreview}
                            disabled={activeProject.status === 'building'}
                            className={
                              activeProject.status === 'ready' 
                                ? "bg-red-600 hover:bg-red-700" 
                                : "bg-green-600 hover:bg-green-700"
                            }
                          >
                            {activeProject.status === 'building' ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Building...
                              </>
                            ) : activeProject.status === 'ready' ? (
                              <>
                                <Square className="w-4 h-4 mr-2" />
                                Stop Preview
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Preview
                              </>
                            )}
                          </Button>
                          
                          <Button variant="outline" className="border-slate-600">
                            <Code className="w-4 h-4 mr-2" />
                            View Code
                          </Button>
                        </div>

                        {activeProject.status === 'building' && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-400">Building project...</span>
                              <span className="text-sm text-slate-400">{activeProject.buildProgress}%</span>
                            </div>
                            <Progress value={activeProject.buildProgress} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-slate-800 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">Project Info</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Platform</span>
                              <span className="text-white">iOS & Android</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Last Updated</span>
                              <span className="text-white">{activeProject.lastUpdate.toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Expo SDK</span>
                              <span className="text-white">49.0.0</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white text-sm">Development Tools</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full border-slate-600">
                              <Eye className="w-4 h-4 mr-2" />
                              Web Preview
                            </Button>
                            <Button variant="outline" size="sm" className="w-full border-slate-600">
                              <Settings className="w-4 h-4 mr-2" />
                              Project Settings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0">
            <div className="p-4 h-full">
              {activeProject?.qrCode ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="w-32 h-32 text-black" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Scan with Expo Go</h4>
                    <p className="text-slate-400 text-sm">Open the Expo Go app and scan this QR code to preview your app</p>
                  </div>

                  <div className="space-y-4">
                    <Card className="bg-slate-800 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Preview URL</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-slate-700 px-3 py-2 rounded text-xs text-slate-300 font-mono">
                            {activeProject.qrCode}
                          </code>
                          <Button size="sm" variant="outline" className="border-slate-600">
                            Copy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {!isConnected && (
                      <Card className="bg-slate-800 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm mb-1">No device connected</p>
                              <p className="text-slate-400 text-xs">Connect a device to see live updates</p>
                            </div>
                            <Button size="sm" onClick={simulateDeviceConnection} className="bg-green-600 hover:bg-green-700">
                              Connect Device
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {deviceInfo && (
                      <Card className="bg-slate-800 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-white text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            Connected Device
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Device</span>
                              <span className="text-white">{deviceInfo.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Platform</span>
                              <span className="text-white">{deviceInfo.platform}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Version</span>
                              <span className="text-white">{deviceInfo.version}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-12">
                  <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No preview available</p>
                  <p className="text-sm">Start development server to generate QR code</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="build" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">App Store Builds</h4>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      New Build
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center">
                          <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center mr-2">
                            🍎
                          </div>
                          iOS Build
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="text-slate-400">Status: <span className="text-green-400">Ready to build</span></p>
                            <p className="text-slate-400">Last build: Never</p>
                          </div>
                          <Button size="sm" className="w-full bg-gray-800 hover:bg-gray-700">
                            Build for App Store
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center">
                          <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center mr-2">
                            🤖
                          </div>
                          Android Build
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <p className="text-slate-400">Status: <span className="text-green-400">Ready to build</span></p>
                            <p className="text-slate-400">Last build: Never</p>
                          </div>
                          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                            Build for Play Store
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-slate-800 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Build Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400 block mb-2">App Name</label>
                          <input 
                            type="text" 
                            defaultValue="My Expo App"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 block mb-2">Bundle Identifier</label>
                          <input 
                            type="text" 
                            defaultValue="com.yourcompany.myexpoapp"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 block mb-2">Version</label>
                          <input 
                            type="text" 
                            defaultValue="1.0.0"
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
