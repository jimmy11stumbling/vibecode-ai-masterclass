import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Package, Plus, Trash2, Search, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  installed: boolean;
  latest?: string;
  type: 'dependency' | 'devDependency';
}

export const PackageManager: React.FC = () => {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPackage, setNewPackage] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock package data - in a real app, this would come from package.json
  const defaultPackages: PackageInfo[] = [
    {
      name: 'react',
      version: '^18.3.1',
      description: 'A JavaScript library for building user interfaces',
      installed: true,
      latest: '18.3.1',
      type: 'dependency'
    },
    {
      name: 'typescript',
      version: '^5.5.3',
      description: 'TypeScript is a language for application scale JavaScript',
      installed: true,
      latest: '5.5.4',
      type: 'devDependency'
    },
    {
      name: 'vite',
      version: '^5.4.2',
      description: 'Next generation frontend tooling',
      installed: true,
      latest: '5.4.8',
      type: 'devDependency'
    },
    {
      name: 'tailwindcss',
      version: '^3.4.1',
      description: 'A utility-first CSS framework',
      installed: true,
      latest: '3.4.14',
      type: 'devDependency'
    },
    {
      name: 'lucide-react',
      version: '^0.462.0',
      description: 'Beautiful & consistent icons',
      installed: true,
      latest: '0.462.0',
      type: 'dependency'
    }
  ];

  useEffect(() => {
    // Simulate loading packages
    setTimeout(() => {
      setPackages(defaultPackages);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInstallPackage = async (packageName: string) => {
    if (!packageName.trim()) return;

    setIsInstalling(true);
    try {
      // Simulate package installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPkg: PackageInfo = {
        name: packageName,
        version: '^1.0.0',
        description: `Package ${packageName}`,
        installed: true,
        latest: '1.0.0',
        type: 'dependency'
      };

      setPackages(prev => [...prev, newPkg]);
      setNewPackage('');
      
      toast({
        title: "Package installed",
        description: `${packageName} has been successfully installed`,
      });
    } catch (error) {
      toast({
        title: "Installation failed",
        description: `Failed to install ${packageName}`,
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUninstallPackage = async (packageName: string) => {
    try {
      // Simulate package uninstallation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPackages(prev => prev.filter(pkg => pkg.name !== packageName));
      
      toast({
        title: "Package uninstalled",
        description: `${packageName} has been removed`,
      });
    } catch (error) {
      toast({
        title: "Uninstallation failed",
        description: `Failed to remove ${packageName}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePackage = async (packageName: string) => {
    try {
      // Simulate package update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPackages(prev => prev.map(pkg => 
        pkg.name === packageName 
          ? { ...pkg, version: pkg.latest || pkg.version }
          : pkg
      ));
      
      toast({
        title: "Package updated",
        description: `${packageName} has been updated to the latest version`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: `Failed to update ${packageName}`,
        variant: "destructive",
      });
    }
  };

  const getPackageIcon = (type: PackageInfo['type']) => {
    return type === 'devDependency' ? (
      <Package className="h-4 w-4 text-orange-500" />
    ) : (
      <Package className="h-4 w-4 text-blue-500" />
    );
  };

  const hasUpdates = packages.some(pkg => pkg.installed && pkg.latest && pkg.version !== pkg.latest);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 animate-spin" />
          <span>Loading packages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <h3 className="font-semibold">Package Manager</h3>
            {hasUpdates && (
              <Badge variant="secondary" className="text-xs">
                Updates Available
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {packages.filter(p => p.installed).length} installed
          </div>
        </div>

        {/* Install New Package */}
        <div className="flex space-x-2 mb-4">
          <Input
            value={newPackage}
            onChange={(e) => setNewPackage(e.target.value)}
            placeholder="Package name (e.g., lodash, axios)"
            onKeyPress={(e) => e.key === 'Enter' && handleInstallPackage(newPackage)}
          />
          <Button 
            onClick={() => handleInstallPackage(newPackage)}
            disabled={isInstalling || !newPackage.trim()}
          >
            {isInstalling ? (
              <Download className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Install
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search packages..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Package List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <Card key={pkg.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getPackageIcon(pkg.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium truncate">{pkg.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {pkg.version}
                        </Badge>
                        {pkg.latest && pkg.version !== pkg.latest && (
                          <Badge variant="secondary" className="text-xs">
                            {pkg.latest} available
                          </Badge>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {pkg.latest && pkg.version !== pkg.latest && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdatePackage(pkg.name)}
                      >
                        Update
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUninstallPackage(pkg.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No packages found</p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};