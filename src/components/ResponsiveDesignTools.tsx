
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw,
  Maximize,
  Minimize,
  Eye,
  Code,
  Ruler,
  Grid3X3,
  Move,
  MousePointer
} from 'lucide-react';

interface Breakpoint {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
}

interface ResponsiveState {
  currentBreakpoint: string;
  customWidth: number;
  customHeight: number;
  zoom: number;
  orientation: 'portrait' | 'landscape';
  showGrid: boolean;
  showRulers: boolean;
  showBoundaries: boolean;
}

const defaultBreakpoints: Record<string, Breakpoint> = {
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: <Smartphone className="w-4 h-4" />,
    maxWidth: 767
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: <Tablet className="w-4 h-4" />,
    minWidth: 768,
    maxWidth: 1023
  },
  desktop: {
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: <Monitor className="w-4 h-4" />,
    minWidth: 1024
  },
  'large-desktop': {
    name: 'Large Desktop',
    width: 1920,
    height: 1080,
    icon: <Monitor className="w-4 h-4" />,
    minWidth: 1440
  }
};

export const ResponsiveDesignTools: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ResponsiveState>({
    currentBreakpoint: 'desktop',
    customWidth: 1200,
    customHeight: 800,
    zoom: 1,
    orientation: 'portrait',
    showGrid: false,
    showRulers: false,
    showBoundaries: true
  });

  const [isRotated, setIsRotated] = useState(false);

  const currentBreakpoint = defaultBreakpoints[state.currentBreakpoint];
  
  const getViewportSize = () => {
    if (state.currentBreakpoint === 'custom') {
      return { width: state.customWidth, height: state.customHeight };
    }
    
    const bp = currentBreakpoint;
    if (isRotated && state.orientation === 'landscape') {
      return { width: Math.max(bp.width, bp.height), height: Math.min(bp.width, bp.height) };
    }
    return { width: bp.width, height: bp.height };
  };

  const handleBreakpointChange = (breakpoint: string) => {
    setState(prev => ({
      ...prev,
      currentBreakpoint: breakpoint
    }));
  };

  const handleRotate = () => {
    setIsRotated(!isRotated);
    setState(prev => ({
      ...prev,
      orientation: prev.orientation === 'portrait' ? 'landscape' : 'portrait'
    }));
  };

  const handleZoomChange = (zoom: number[]) => {
    setState(prev => ({ ...prev, zoom: zoom[0] }));
  };

  const viewportSize = getViewportSize();

  const gridOverlay = state.showGrid && (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
    />
  );

  const rulers = state.showRulers && (
    <>
      {/* Horizontal Ruler */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-slate-700 border-b border-slate-600 flex items-end text-xs text-slate-300">
        {Array.from({ length: Math.ceil(viewportSize.width / 50) }, (_, i) => (
          <div key={i} className="relative" style={{ width: '50px' }}>
            <div className="absolute bottom-0 left-0 w-px h-2 bg-slate-400" />
            <span className="absolute bottom-2 left-1 text-xs">{i * 50}</span>
          </div>
        ))}
      </div>
      
      {/* Vertical Ruler */}
      <div className="absolute -left-6 top-0 bottom-0 w-6 bg-slate-700 border-r border-slate-600 flex flex-col justify-start text-xs text-slate-300">
        {Array.from({ length: Math.ceil(viewportSize.height / 50) }, (_, i) => (
          <div key={i} className="relative" style={{ height: '50px' }}>
            <div className="absolute top-0 right-0 h-px w-2 bg-slate-400" />
            <span className="absolute top-1 right-2 text-xs transform -rotate-90 origin-center">{i * 50}</span>
          </div>
        ))}
      </div>
    </>
  );

  const boundaryIndicators = state.showBoundaries && (
    <div className="absolute inset-0 pointer-events-none">
      {/* Breakpoint boundaries */}
      {Object.entries(defaultBreakpoints).map(([key, bp]) => {
        if (bp.minWidth && viewportSize.width >= bp.minWidth && bp.maxWidth && viewportSize.width <= bp.maxWidth) {
          return (
            <div key={key} className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                {bp.name} ({bp.minWidth}px - {bp.maxWidth}px)
              </Badge>
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Responsive Toolbar */}
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* Breakpoint Selector */}
          <div className="flex items-center space-x-2">
            {Object.entries(defaultBreakpoints).map(([key, breakpoint]) => (
              <Button
                key={key}
                variant={state.currentBreakpoint === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleBreakpointChange(key)}
                className="flex items-center space-x-2"
              >
                {breakpoint.icon}
                <span className="hidden md:inline">{breakpoint.name}</span>
              </Button>
            ))}
            <Button
              variant={state.currentBreakpoint === 'custom' ? "default" : "outline"}
              size="sm"
              onClick={() => handleBreakpointChange('custom')}
            >
              Custom
            </Button>
          </div>

          {/* Viewport Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
              className="border-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <div className="text-sm text-white bg-slate-700 px-2 py-1 rounded">
              {viewportSize.width} × {viewportSize.height}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Zoom Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white">Zoom:</span>
            <div className="w-32">
              <Slider
                value={[state.zoom]}
                onValueChange={handleZoomChange}
                min={0.25}
                max={2}
                step={0.25}
                className="cursor-pointer"
              />
            </div>
            <span className="text-sm text-white w-12">{Math.round(state.zoom * 100)}%</span>
          </div>

          {/* View Options */}
          <div className="flex items-center space-x-2">
            <Button
              variant={state.showGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
              className="border-slate-600"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            
            <Button
              variant={state.showRulers ? "default" : "outline"}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showRulers: !prev.showRulers }))}
              className="border-slate-600"
            >
              <Ruler className="w-4 h-4" />
            </Button>
            
            <Button
              variant={state.showBoundaries ? "default" : "outline"}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showBoundaries: !prev.showBoundaries }))}
              className="border-slate-600"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Responsive Preview Area */}
      <div className="flex-1 bg-slate-100 overflow-auto relative">
        <div className="flex items-center justify-center min-h-full p-8 relative">
          {rulers}
          
          <div 
            className="bg-white shadow-2xl relative overflow-hidden border border-slate-300"
            style={{
              width: viewportSize.width,
              height: viewportSize.height,
              transform: `scale(${state.zoom})`,
              transformOrigin: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            {gridOverlay}
            {boundaryIndicators}
            
            {/* Content */}
            <div className="w-full h-full overflow-auto">
              {children}
            </div>
          </div>
        </div>

        {/* Breakpoint Information Panel */}
        <div className="absolute bottom-4 right-4">
          <Card className="bg-slate-800 border-slate-700 w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white flex items-center space-x-2">
                {currentBreakpoint?.icon}
                <span>Current Breakpoint</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Name:</span>
                <span className="text-xs text-white">{currentBreakpoint?.name || 'Custom'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Size:</span>
                <span className="text-xs text-white">{viewportSize.width} × {viewportSize.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Zoom:</span>
                <span className="text-xs text-white">{Math.round(state.zoom * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Orientation:</span>
                <span className="text-xs text-white capitalize">{state.orientation}</span>
              </div>
              
              {currentBreakpoint?.minWidth && (
                <div className="mt-3 p-2 bg-slate-700 rounded">
                  <div className="text-xs text-slate-300">
                    Range: {currentBreakpoint.minWidth}px 
                    {currentBreakpoint.maxWidth && ` - ${currentBreakpoint.maxWidth}px`}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
