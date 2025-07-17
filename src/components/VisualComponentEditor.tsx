
import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
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

    toast({
      title: "Element Added",
      description: `${type} element has been added to the canvas`,
    });
  }, [toast]);

  const getDefaultProps = (type: ComponentElement['type']): Record<string, any> => {
    switch (type) {
      case 'button':
        return { children: 'Click me', variant: 'default' };
      case 'input':
        return { placeholder: 'Enter text...', type: 'text' };
      case 'text':
        return { children: 'Sample Text', as: 'p' };
      case 'image':
        return { src: '/placeholder.svg', alt: 'Placeholder Image' };
      case 'card':
        return { title: 'Card Title', description: 'Card description goes here' };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: ComponentElement['type']): Record<string, string> => {
    const baseStyles = {
      position: 'absolute',
      cursor: 'move',
      border: '2px solid transparent',
      boxSizing: 'border-box'
    };

    switch (type) {
      case 'button':
        return { 
          ...baseStyles, 
          padding: '8px 16px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer'
        };
      case 'input':
        return { 
          ...baseStyles, 
          padding: '8px 12px', 
          border: '1px solid #d1d5db', 
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white'
        };
      case 'text':
        return { 
          ...baseStyles, 
          color: '#1f2937', 
          fontSize: '16px',
          padding: '4px'
        };
      case 'image':
        return { 
          ...baseStyles, 
          borderRadius: '6px',
          objectFit: 'cover'
        };
      case 'card':
        return { 
          ...baseStyles, 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        };
      case 'grid':
        return { 
          ...baseStyles, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px', 
          padding: '16px',
          backgroundColor: '#f9fafb',
          border: '2px dashed #d1d5db'
        };
      case 'flex':
        return { 
          ...baseStyles, 
          display: 'flex', 
          gap: '16px', 
          padding: '16px',
          backgroundColor: '#f9fafb',
          border: '2px dashed #d1d5db'
        };
      default:
        return { 
          ...baseStyles, 
          backgroundColor: '#f3f4f6', 
          padding: '16px', 
          borderRadius: '6px',
          border: '2px dashed #9ca3af'
        };
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, componentType: ComponentElement['type']) => {
    e.dataTransfer.setData('componentType', componentType);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType') as ComponentElement['type'];
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect && componentType) {
      const position = {
        x: Math.max(0, (e.clientX - rect.left) / editorState.zoom - 100),
        y: Math.max(0, (e.clientY - rect.top) / editorState.zoom - 50)
      };
      createNewElement(componentType, position);
    }
  }, [createNewElement, editorState.zoom]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = editorState.elements.find(el => el.id === elementId);
    if (!element) return;

    setEditorState(prev => ({ ...prev, selectedElement: elementId }));
    setDraggedElement(elementId);
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [editorState.elements]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedElement || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newPosition = {
      x: Math.max(0, (e.clientX - canvasRect.left - dragOffset.x) / editorState.zoom),
      y: Math.max(0, (e.clientY - canvasRect.top - dragOffset.y) / editorState.zoom)
    };

    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === draggedElement ? { ...el, position: newPosition } : el
      )
    }));
  }, [isDragging, draggedElement, dragOffset, editorState.zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const deleteElement = useCallback((elementId: string) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      selectedElement: prev.selectedElement === elementId ? null : prev.selectedElement
    }));
    
    toast({
      title: "Element Deleted",
      description: "Element has been removed from the canvas",
    });
  }, [toast]);

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
      
      toast({
        title: "Element Duplicated",
        description: "Element has been duplicated",
      });
    }
  }, [editorState.elements, toast]);

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
    const code = `import React from 'react';

export const GeneratedComponent = () => {
  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
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
    const styleString = Object.entries(element.styles)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ');
    
    const propsString = Object.entries(element.props)
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const style = `style={{ ${styleString} }}`;

    switch (element.type) {
      case 'button':
        return `${indent}<button ${propsString} ${style}>${element.props.children || 'Button'}</button>`;
      case 'input':
        return `${indent}<input ${propsString} ${style} />`;
      case 'text':
        return `${indent}<${element.props.as || 'p'} ${style}>${element.props.children || 'Text'}</${element.props.as || 'p'}>`;
      case 'image':
        return `${indent}<img ${propsString} ${style} />`;
      case 'card':
        return `${indent}<div ${style}>
${indent}  <h3>${element.props.title || 'Card Title'}</h3>
${indent}  <p>${element.props.description || 'Card description'}</p>
${indent}</div>`;
      default:
        return `${indent}<div ${style}>${element.children.map(child => generateElementCode(child, depth + 1)).join('\n')}</div>`;
    }
  };

  const renderElement = (element: ComponentElement) => {
    const isSelected = editorState.selectedElement === element.id;
    const elementStyle = {
      ...element.styles,
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.size.width}px`,
      height: `${element.size.height}px`,
      border: isSelected ? '2px solid #3b82f6' : element.styles.border || '2px solid transparent',
      zIndex: isSelected ? 1000 : 1
    };

    const commonProps = {
      key: element.id,
      style: elementStyle,
      onMouseDown: (e: React.MouseEvent) => handleElementMouseDown(e, element.id),
      onClick: (e: React.MouseEvent) => e.stopPropagation()
    };

    switch (element.type) {
      case 'button':
        return (
          <button {...commonProps}>
            {element.props.children}
          </button>
        );
      case 'input':
        return (
          <input {...commonProps} {...element.props} />
        );
      case 'text':
        return (
          <div {...commonProps}>
            {element.props.children}
          </div>
        );
      case 'image':
        return (
          <img {...commonProps} {...element.props} />
        );
      case 'card':
        return (
          <div {...commonProps}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              {element.props.title}
            </h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              {element.props.description}
            </p>
          </div>
        );
      default:
        return (
          <div {...commonProps}>
            {element.type === 'grid' ? 'Grid Container' : element.type === 'flex' ? 'Flex Container' : 'Container'}
          </div>
        );
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
                className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg cursor-grab hover:bg-slate-600 transition-colors active:cursor-grabbing"
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
            <Button 
              variant={editorState.viewport === 'desktop' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setEditorState(prev => ({ ...prev, viewport: 'desktop' }))}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button 
              variant={editorState.viewport === 'tablet' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setEditorState(prev => ({ ...prev, viewport: 'tablet' }))}
            >
              <Tablet className="w-4 h-4 mr-2" />
              Tablet
            </Button>
            <Button 
              variant={editorState.viewport === 'mobile' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setEditorState(prev => ({ ...prev, viewport: 'mobile' }))}
            >
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
          <div className="flex justify-center">
            <div 
              ref={canvasRef}
              className="bg-white shadow-lg relative overflow-hidden border-2 border-slate-300"
              style={{
                ...getViewportSize(),
                transform: `scale(${editorState.zoom})`,
                transformOrigin: 'top center'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => setEditorState(prev => ({ ...prev, selectedElement: null }))}
            >
              {editorState.elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg">
                  Drag components here to start building
                </div>
              )}
              
              {editorState.elements.map(renderElement)}
            </div>
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
                <span className="text-white font-medium capitalize">{selectedElement.type}</span>
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
                    <Label className="text-white text-sm capitalize">{key}</Label>
                    <Input
                      value={value?.toString() || ''}
                      onChange={(e) => updateElementProps(selectedElement.id, { [key]: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="styles" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-white text-sm">Background Color</Label>
                  <Input
                    value={selectedElement.styles.backgroundColor || ''}
                    onChange={(e) => updateElementStyles(selectedElement.id, { backgroundColor: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="#ffffff"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-white text-sm">Color</Label>
                  <Input
                    value={selectedElement.styles.color || ''}
                    onChange={(e) => updateElementStyles(selectedElement.id, { color: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="#000000"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-white text-sm">Font Size</Label>
                  <Input
                    value={selectedElement.styles.fontSize || ''}
                    onChange={(e) => updateElementStyles(selectedElement.id, { fontSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="16px"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-white text-sm">Padding</Label>
                  <Input
                    value={selectedElement.styles.padding || ''}
                    onChange={(e) => updateElementStyles(selectedElement.id, { padding: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="8px"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-white text-sm">Border Radius</Label>
                  <Input
                    value={selectedElement.styles.borderRadius || ''}
                    onChange={(e) => updateElementStyles(selectedElement.id, { borderRadius: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="6px"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-slate-400 mt-8">
            <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select an element to edit its properties</p>
            <p className="text-sm mt-2">Drag components from the left panel to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
