
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play,
  Save,
  Download,
  Terminal as TerminalIcon, 
  Layout,
  Maximize2,
  Settings
} from 'lucide-react';

interface IDEToolbarProps {
  onToggleTerminal: () => void;
  onToggleLayout: () => void;
  layout: string;
}

export const IDEToolbar: React.FC<IDEToolbarProps> = ({ 
  onToggleTerminal, 
  onToggleLayout, 
  layout 
}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold">Vibecode IDE</h1>
          <div className="flex items-center space-x-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="border-slate-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-slate-400"
            onClick={onToggleTerminal}
          >
            <TerminalIcon className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-slate-400"
            onClick={onToggleLayout}
          >
            <Layout className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-400">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
