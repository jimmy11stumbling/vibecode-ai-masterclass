
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Layout, 
  Plus, 
  Move, 
  Trash2, 
  Copy, 
  Edit3,
  Eye,
  Code,
  Palette,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComponentElement {
  id: string;
  type: 'div' | 'button' | 'input' | 'text' | 'image' | 'card' | 'grid' | 'flex';
  props: Record<string, any>;
  children: ComponentElement[];
  styles: Record<string, string>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface VisualEditorState {
  elements: ComponentElement[];
  selectedElement: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
}

export const VisualComponentEditor: React.FC = () => {
  const [editorState, setEditorState] = useState<VisualEditorState>({
    elements: [],
    selectedElement: null,
    viewport: 'desktop',
    zoom: 1
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const componentLibrary = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'input', label: 'Input', icon: '📝' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'card', label: 'Card', icon: '📄' },
    { type: 'grid', label: 'Grid', icon: '⚏' },
    { type: 'flex', label: 'Flex', icon: '📏' },
    { type: 'div', label: 'Container', icon: '📦' }
  ];

  const createNewElement = useCallback((type: ComponentElement['type'], position: { x: number; y: number }) => {
    const newElement: ComponentElement = {
      id: `${type}_${Date.now()}`,
      type,
      props: getDefaultProps(type),
      children: [],
      styles: getDefaultStyles(type),
      position,
      size: { width: 200, height: 100 }
    };
    
    setEditorState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElement: newElement.id
    }));
  }, []);

  const getDefaultProps = (type: ComponentElement['type']): Record<string, any> => {
    switch (type) {
      case 'button':
        return { children: 'Button', variant: 'default' };
      case 'input':
        return { placeholder: 'Enter text...', type: 'text' };
      case 'text':
        return { children: 'Sample Text', as: 'p' };
      case 'image':
        return { src: '/placeholder.svg', alt: 'Image' };
      case 'card':
        return { title: 'Card Title', description: 'Card description' };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: ComponentElement['type']): Record<string, string> => {
    const baseStyles = {
      position: 'absolute',
      cursor: 'pointer',
      border: '2px solid transparent'
    };

    switch (type) {
      case 'button':
        return { ...baseStyles, padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px' };
      case 'input':
        return { ...baseStyles, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' };
      case 'text':
        return { ...baseStyles, color: '#1f2937', fontSize: '16px' };
      case 'image':
        return { ...baseStyles, borderRadius: '6px' };
      case 'card':
        return { ...baseStyles, backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
      case 'grid':
        return { ...baseStyles, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px' };
      case 'flex':
        return { ...baseStyles, display: 'flex', gap: '16px', padding: '16px' };
      default:
        return { ...baseStyles, backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '6px' };
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, componentType: ComponentElement['type']) => {
    e.dataTransfer.setData('componentType', componentType);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType') as ComponentElement['type'];
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect) {
      const position = {
        x: (e.clientX - rect.left) / editorState.zoom,
        y: (e.clientY - rect.top) / editorState.zoom
      };
      createNewElement(componentType, position);
    }
  }, [createNewElement, editorState.zoom]);

  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditorState(prev => ({ ...prev, selectedElement: elementId }));
  }, []);

  const handleElementDrag = useCallback((elementId: string, newPosition: { x: number; y: number }) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, position: newPosition } : el
      )
    }));
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      selectedElement: prev.selectedElement === elementId ? null : prev.selectedElement
    }));
  }, []);

  const duplicateElement = useCallback((elementId: string) => {
    const element = editorState.elements.find(el => el.id === elementId);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}_${Date.now()}`,
        position: { x: element.position.x + 20, y: element.position.y + 20 }
      };
      setEditorState(prev => ({
        ...prev,
        elements: [...prev.elements, newElement],
        selectedElement: newElement.id
      }));
    }
  }, [editorState.elements]);

  const updateElementProps = useCallback((elementId: string, props: Record<string, any>) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, props: { ...el.props, ...props } } : el
      )
    }));
  }, []);

  const updateElementStyles = useCallback((elementId: string, styles: Record<string, string>) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, styles: { ...el.styles, ...styles } } : el
      )
    }));
  }, []);

  const getViewportSize = () => {
    switch (editorState.viewport) {
      case 'mobile': return { width: 375, height: 667 };
      case 'tablet': return { width: 768, height: 1024 };
      default: return { width: 1200, height: 800 };
    }
  };

  const selectedElement = editorState.elements.find(el => el.id === editorState.selectedElement);

  const generateCode = () => {
    // Generate React/TypeScript code from the visual components
    const code = `import React from 'react';

export const GeneratedComponent = () => {
  return (
    <div className="relative">
      ${editorState.elements.map(element => generateElementCode(element, 0)).join('\n      ')}
    </div>
  );
};`;

    navigator.clipboard.writeText(code);
    toast({
      title: "Code Generated",
      description: "Component code copied to clipboard",
    });
  };

  const generateElementCode = (element: ComponentElement, depth: number): string => {
    const indent = '  '.repeat(depth + 1);
    const styleProps = Object.entries(element.styles)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ');
    
    const props = Object.entries(element.props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    switch (element.type) {
      case 'button':
        return `${indent}<button ${props} style={{${styleProps}}}>${element.props.children || 'Button'}</button>`;
      case 'input':
        return `${indent}<input ${props} style={{${styleProps}}} />`;
      case 'text':
        return `${indent}<${element.props.as || 'p'} style={{${styleProps}}}>${element.props.children || 'Text'}</${element.props.as || 'p'}>`;
      case 'image':
        return `${indent}<img ${props} style={{${styleProps}}} />`;
      default:
        return `${indent}<div ${props} style={{${styleProps}}}>${element.children.map(child => generateElementCode(child, depth + 1)).join('\n')}</div>`;
    }
  };

  return (
    <div className="h-full bg-slate-900 flex">
      {/* Component Library Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Components</h3>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {componentLibrary.map((component) => (
              <div
                key={component.type}
                draggable
                onDragStart={(e) => handleDragStart(e, component.type as ComponentElement['type'])}
                className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg cursor-grab hover:bg-slate-600 transition-colors"
              >
                <span className="text-2xl">{component.icon}</span>
                <span className="text-white text-sm">{component.label}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => setEditorState(prev => ({ ...prev, viewport: 'desktop' }))}>
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditorState(prev => ({ ...prev, viewport: 'tablet' }))}>
              <Tablet className="w-4 h-4 mr-2" />
              Tablet
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditorState(prev => ({ ...prev, viewport: 'mobile' }))}>
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={generateCode}>
              <Code className="w-4 h-4 mr-2" />
              Generate Code
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label className="text-white">Zoom:</Label>
            <Select 
              value={editorState.zoom.toString()} 
              onValueChange={(value) => setEditorState(prev => ({ ...prev, zoom: parseFloat(value) }))}
            >
              <SelectTrigger className="w-20 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">50%</SelectItem>
                <SelectItem value="0.75">75%</SelectItem>
                <SelectItem value="1">100%</SelectItem>
                <SelectItem value="1.25">125%</SelectItem>
                <SelectItem value="1.5">150%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-slate-100 overflow-auto p-8">
          <div 
            ref={canvasRef}
            className="mx-auto bg-white shadow-lg relative overflow-hidden"
            style={{
              ...getViewportSize(),
              transform: `scale(${editorState.zoom})`,
              transformOrigin: 'top left'
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => setEditorState(prev => ({ ...prev, selectedElement: null }))}
          >
            {editorState.elements.map((element) => (
              <div
                key={element.id}
                className={`absolute ${editorState.selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  ...element.styles,
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size.width,
                  height: element.size.height,
                  border: editorState.selectedElement === element.id ? '2px solid #3b82f6' : element.styles.border
                }}
                onClick={(e) => handleElementClick(element.id, e)}
              >
                {element.type === 'button' && (
                  <button style={{ width: '100%', height: '100%', ...element.styles }}>
                    {element.props.children}
                  </button>
                )}
                {element.type === 'input' && (
                  <input style={{ width: '100%', height: '100%', ...element.styles }} {...element.props} />
                )}
                {element.type === 'text' && (
                  <div style={{ width: '100%', height: '100%', ...element.styles }}>
                    {element.props.children}
                  </div>
                )}
                {element.type === 'image' && (
                  <img style={{ width: '100%', height: '100%', objectFit: 'cover', ...element.styles }} {...element.props} />
                )}
                {element.type === 'div' && (
                  <div style={{ width: '100%', height: '100%', ...element.styles }}>
                    Container
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
        
        {selectedElement ? (
          <Tabs defaultValue="props" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="props">Props</TabsTrigger>
              <TabsTrigger value="styles">Styles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="props" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{selectedElement.type}</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => duplicateElement(selectedElement.id)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteElement(selectedElement.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                {Object.entries(selectedElement.props).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-white text-sm">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateElementProps(selectedElement.id, { [key]: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="styles" className="space-y-4 mt-4">
              <div className="space-y-3">
                {Object.entries(selectedElement.styles)
                  .filter(([key]) => !['position', 'cursor', 'border'].includes(key))
                  .map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-white text-sm">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateElementStyles(selectedElement.id, { [key]: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-slate-400 mt-8">
            <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select an element to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  );
};
