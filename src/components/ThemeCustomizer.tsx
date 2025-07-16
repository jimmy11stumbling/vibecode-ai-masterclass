

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Type, 
  Layout, 
  Zap,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    destructive: string;
    warning: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: 'hsl(222.2, 84%, 4.9%)',
    secondary: 'hsl(210, 40%, 96%)',
    accent: 'hsl(210, 40%, 94%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(210, 40%, 96%)',
    border: 'hsl(214.3, 31.8%, 91.4%)',
    destructive: 'hsl(0, 84.2%, 60.2%)',
    warning: 'hsl(38, 92%, 50%)',
    success: 'hsl(142, 76%, 36%)',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
};

const darkTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: 'hsl(210, 40%, 98%)',
    background: 'hsl(222.2, 84%, 4.9%)',
    foreground: 'hsl(210, 40%, 98%)',
    muted: 'hsl(217.2, 32.6%, 17.5%)',
    border: 'hsl(217.2, 32.6%, 17.5%)',
  },
};

const blueTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: 'hsl(221.2, 83.2%, 53.3%)',
    accent: 'hsl(221.2, 83.2%, 93%)',
  },
};

const greenTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: 'hsl(142, 76%, 36%)',
    accent: 'hsl(142, 76%, 93%)',
  },
};

const purpleTheme: ThemeConfig = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: 'hsl(262.1, 83.3%, 57.8%)',
    accent: 'hsl(262.1, 83.3%, 93%)',
  },
};

const presetThemes: Record<string, ThemeConfig> = {
  default: defaultTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
  purple: purpleTheme,
};

export const ThemeCustomizer: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultTheme);
  const [selectedPreset, setSelectedPreset] = useState<string>('default');
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const { toast } = useToast();

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  const applyThemeToDocument = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    root.style.setProperty('--font-family', theme.typography.fontFamily);
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  const handleTypographyChange = (section: string, key: string, value: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [section]: {
          ...prev.typography[section as keyof typeof prev.typography],
          [key]: value
        }
      }
    }));
  };

  const handleSpacingChange = (key: string, value: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value
      }
    }));
  };

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const selectedTheme = presetThemes[presetName];
    if (selectedTheme) {
      setCurrentTheme(selectedTheme);
      toast({
        title: "Theme Applied",
        description: `${presetName} theme has been applied`,
      });
    }
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(currentTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Theme Exported",
      description: "Theme configuration downloaded as JSON",
    });
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string);
          setCurrentTheme(themeData);
          setSelectedPreset('custom');
          toast({
            title: "Theme Imported",
            description: "Theme configuration has been loaded",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid theme configuration file",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const resetTheme = () => {
    setCurrentTheme(defaultTheme);
    setSelectedPreset('default');
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to default",
    });
  };

  const generateCSSVariables = () => {
    let css = ':root {\n';
    
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`;
    });
    
    Object.entries(currentTheme.typography.fontSize).forEach(([key, value]) => {
      css += `  --font-size-${key}: ${value};\n`;
    });
    
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });
    
    css += `  --font-family: ${currentTheme.typography.fontFamily};\n`;
    css += '}';
    
    navigator.clipboard.writeText(css);
    toast({
      title: "CSS Generated",
      description: "CSS variables copied to clipboard",
    });
  };

  return (
    <div className="h-full bg-slate-900 flex">
      {/* Theme Controls */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Theme Editor</h2>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={exportTheme}>
              <Download className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={resetTheme}>
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Preset Themes */}
        <Card className="bg-slate-700 border-slate-600 mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Preset Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(presetThemes).map((presetName) => (
                <Button
                  key={presetName}
                  size="sm"
                  variant={selectedPreset === presetName ? "default" : "outline"}
                  onClick={() => handlePresetChange(presetName)}
                  className="capitalize"
                >
                  {presetName}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex space-x-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="w-3 h-3 mr-1" />
                    Import
                  </span>
                </Button>
              </label>
              <Button size="sm" variant="outline" onClick={generateCSSVariables}>
                Export CSS
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
            <TabsTrigger value="typography" className="text-xs">Type</TabsTrigger>
            <TabsTrigger value="spacing" className="text-xs">Space</TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-280px)] mt-4">
            <TabsContent value="colors" className="space-y-4">
              {Object.entries(currentTheme.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-white text-sm capitalize">{key}</Label>
                  <div className="flex space-x-2">
                    <div 
                      className="w-8 h-8 rounded border border-slate-600"
                      style={{ backgroundColor: value }}
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white flex-1"
                      placeholder="hsl(0, 0%, 0%)"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white text-sm">Font Family</Label>
                <Select 
                  value={currentTheme.typography.fontFamily}
                  onValueChange={(value) => handleTypographyChange('fontFamily', '', value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                    <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                    <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                    <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                    <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-white font-medium">Font Sizes</h4>
                {Object.entries(currentTheme.typography.fontSize).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-white text-sm">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => handleTypographyChange('fontSize', key, e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white w-20"
                    />
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-white font-medium">Font Weights</h4>
                {Object.entries(currentTheme.typography.fontWeight).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-white text-sm">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => handleTypographyChange('fontWeight', key, e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white w-20"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4">
              {Object.entries(currentTheme.spacing).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-white text-sm">{key}</Label>
                  <Input
                    value={value}
                    onChange={(e) => handleSpacingChange(key, e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white w-24"
                  />
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-white font-medium">Border Radius</h4>
                {Object.entries(currentTheme.borderRadius).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-white text-sm">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => setCurrentTheme(prev => ({
                        ...prev,
                        borderRadius: { ...prev.borderRadius, [key]: e.target.value }
                      }))}
                      className="bg-slate-700 border-slate-600 text-white w-24"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-white font-medium">Shadows</h4>
                {Object.entries(currentTheme.shadows).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-white text-sm">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => setCurrentTheme(prev => ({
                        ...prev,
                        shadows: { ...prev.shadows, [key]: e.target.value }
                      }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="text-white font-medium">Animation Duration</h4>
                {Object.entries(currentTheme.animations.duration).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-white text-sm">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => setCurrentTheme(prev => ({
                        ...prev,
                        animations: {
                          ...prev.animations,
                          duration: { ...prev.animations.duration, [key]: e.target.value }
                        }
                      }))}
                      className="bg-slate-700 border-slate-600 text-white w-20"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Live Preview */}
      <div className="flex-1 bg-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Theme Preview</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4" />
                <Switch 
                  checked={previewMode === 'dark'}
                  onCheckedChange={(checked) => setPreviewMode(checked ? 'dark' : 'light')}
                />
                <Moon className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Preview Components */}
          <div className={`space-y-6 p-6 rounded-lg ${previewMode === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Sample Card</CardTitle>
                <CardDescription>This is how your theme looks on cards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Sample Input</Label>
                  <Input placeholder="Type something..." />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>Toggle switch</Label>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <h1 className="text-4xl font-bold">Heading 1</h1>
                  <h2 className="text-3xl font-semibold">Heading 2</h2>
                  <h3 className="text-2xl font-medium">Heading 3</h3>
                  <p className="text-base">Regular paragraph text</p>
                  <p className="text-sm text-muted-foreground">Muted text</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Colors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentTheme.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: value }}
                        />
                        <span className="text-sm capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

