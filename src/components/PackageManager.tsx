
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Download, 
  Trash2, 
  Search, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  installed: boolean;
  category: 'dependency' | 'devDependency';
  size?: string;
  license?: string;
  homepage?: string;
  latest?: string;
  outdated?: boolean;
}

interface PackageManagerProps {
  onInstallPackage?: (packageName: string, isDev: boolean) => void;
  onUninstallPackage?: (packageName: string) => void;
  onUpdatePackage?: (packageName: string) => void;
}

export const PackageManager: React.FC<PackageManagerProps> = ({
  onInstallPackage,
  onUninstallPackage,
  onUpdatePackage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('installed');
  const [isLoading, setIsLoading] = useState(false);

  const [packages] = useState<PackageInfo[]>([
    {
      name: 'react',
      version: '18.3.1',
      description: 'React is a JavaScript library for building user interfaces',
      installed: true,
      category: 'dependency',
      size: '2.3MB',
      license: 'MIT',
      homepage: 'https://reactjs.org',
      latest: '18.3.1'
    },
    {
      name: 'typescript',
      version: '5.0.0',
      description: 'TypeScript is a language for application scale JavaScript',
      installed: true,
      category: 'devDependency',
      size: '45.2MB',
      license: 'Apache-2.0',
      homepage: 'https://typescriptlang.org',
      latest: '5.3.2',
      outdated: true
    },
    {
      name: 'tailwindcss',
      version: '3.4.0',
      description: 'A utility-first CSS framework for rapid UI development',
      installed: true,
      category: 'devDependency',
      size: '15.8MB',
      license: 'MIT',
      homepage: 'https://tailwindcss.com',
      latest: '3.4.0'
    },
    {
      name: 'lodash',
      version: '',
      description: 'A modern JavaScript utility library delivering modularity',
      installed: false,
      category: 'dependency',
      size: '1.4MB',
      license: 'MIT',
      homepage: 'https://lodash.com',
      latest: '4.17.21'
    },
    {
      name: 'axios',
      version: '',
      description: 'Promise based HTTP client for the browser and node.js',
      installed: false,
      category: 'dependency',
      size: '485KB',
      license: 'MIT',
      homepage: 'https://axios-http.com',
      latest: '1.6.2'
    }
  ]);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'installed':
        return pkg.installed && matchesSearch;
      case 'available':
        return !pkg.installed && matchesSearch;
      case 'outdated':
        return pkg.installed && pkg.outdated && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const handleInstall = async (packageName: string, isDev: boolean = false) => {
    setIsLoading(true);
    try {
      await onInstallPackage?.(packageName, isDev);
      // Update package state
    } catch (error) {
      console.error('Failed to install package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstall = async (packageName: string) => {
    setIsLoading(true);
    try {
      await onUninstallPackage?.(packageName);
      // Update package state
    } catch (error) {
      console.error('Failed to uninstall package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (packageName: string) => {
    setIsLoading(true);
    try {
      await onUpdatePackage?.(packageName);
      // Update package state
    } catch (error) {
      console.error('Failed to update package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const installedCount = packages.filter(p => p.installed).length;
  const outdatedCount = packages.filter(p => p.installed && p.outdated).length;
  const availableCount = packages.filter(p => !p.installed).length;

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Package Manager</h3>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.location.reload()}
          disabled={isLoading}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages..."
            className="pl-10 bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4 py-2">
          <TabsList className="bg-slate-800 w-full">
            <TabsTrigger value="installed" className="data-[state=active]:bg-slate-700">
              Installed ({installedCount})
            </TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-slate-700">
              Available ({availableCount})
            </TabsTrigger>
            <TabsTrigger value="outdated" className="data-[state=active]:bg-slate-700">
              Outdated ({outdatedCount})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value={activeTab} className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {filteredPackages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No packages found</p>
                  </div>
                ) : (
                  filteredPackages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-semibold text-white">{pkg.name}</h4>
                            
                            {pkg.installed && (
                              <Badge variant="default" className="text-xs">
                                v{pkg.version}
                              </Badge>
                            )}
                            
                            {pkg.outdated && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Outdated
                              </Badge>
                            )}
                            
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                pkg.category === 'devDependency' 
                                  ? 'text-yellow-400 border-yellow-400' 
                                  : 'text-blue-400 border-blue-400'
                              }`}
                            >
                              {pkg.category === 'devDependency' ? 'Dev' : 'Prod'}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {pkg.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            {pkg.size && <span>Size: {pkg.size}</span>}
                            {pkg.license && <span>License: {pkg.license}</span>}
                            {pkg.latest && !pkg.installed && <span>Latest: v{pkg.latest}</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {pkg.homepage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(pkg.homepage, '_blank')}
                              className="text-slate-400 hover:text-white h-8 w-8 p-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                          
                          {pkg.installed ? (
                            <div className="flex items-center space-x-1">
                              {pkg.outdated && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdate(pkg.name)}
                                  disabled={isLoading}
                                  className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                                >
                                  Update
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUninstall(pkg.name)}
                                disabled={isLoading}
                                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white text-xs h-8"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleInstall(pkg.name, false)}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700 text-xs h-8"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Install
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
