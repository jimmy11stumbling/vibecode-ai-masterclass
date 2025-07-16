
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Crown,
  Settings,
  Users
} from 'lucide-react';

import { MinimalSovereignIDE } from '@/components/MinimalSovereignIDE';
import { CodeEditor } from '@/components/CodeEditor';
import { ProjectManager } from '@/components/ProjectManager';

export default function FullIDE() {
  const [showProject, setShowProject] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);

  const handleProjectGenerated = (project: any) => {
    console.log('Project generated:', project);
    setProjectData(project);
    setShowProject(true);
  };

  if (showProject && projectData) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Project Generated</h1>
              <p className="text-xs text-slate-400">Ready for development</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProject(false)}
              className="border-slate-600"
            >
              Back to Generator
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Project View */}
        <div className="flex-1 flex">
          <div className="w-64 bg-slate-800 border-r border-slate-700">
            <ProjectManager 
              onFileSelect={(file) => console.log('File selected:', file)}
              onProjectChange={(files) => console.log('Project changed:', files)}
            />
          </div>
          
          <div className="flex-1">
            <CodeEditor 
              selectedFile={null}
              onCodeChange={(files) => console.log('Code changed:', files)}
              onRun={(code) => console.log('Running code:', code)}
            />
          </div>
        </div>
      </div>
    );
  }

  return <MinimalSovereignIDE onProjectGenerated={handleProjectGenerated} />;
}
