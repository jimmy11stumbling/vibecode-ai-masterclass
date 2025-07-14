
import { useState } from 'react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export const useTerminalCommands = () => {
  const [currentPath, setCurrentPath] = useState('~/project');

  const executeCommand = (
    command: string,
    lines: TerminalLine[],
    setLines: (lines: TerminalLine[]) => void
  ) => {
    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: `${currentPath} $ ${command}`,
      timestamp: new Date()
    };

    const addOutput = (content: string, type: 'output' | 'error' = 'output') => {
      const outputLine: TerminalLine = {
        id: (Date.now() + Math.random()).toString(),
        type,
        content,
        timestamp: new Date()
      };
      setLines([...lines, commandLine, outputLine]);
    };

    const cmd = command.trim().toLowerCase();
    
    if (cmd === 'help') {
      addOutput(`Available commands:
• help - Show this help message
• clear - Clear the terminal
• ls - List files in current directory
• pwd - Show current directory
• cd <path> - Change directory
• npm install - Install dependencies
• npm run dev - Start development server
• npm run build - Build for production
• git status - Show git status
• git add . - Stage all changes
• git commit -m "message" - Commit changes
• ps - Show running processes
• kill <pid> - Kill a process
• whoami - Show current user
• date - Show current date and time
• echo <text> - Print text to terminal`);
    } else if (cmd === 'clear') {
      setLines([]);
    } else if (cmd === 'ls') {
      addOutput(`src/
├── components/
├── hooks/
├── pages/
├── services/
├── integrations/
└── App.tsx
package.json
README.md
tsconfig.json`);
    } else if (cmd === 'pwd') {
      addOutput(currentPath);
    } else if (cmd.startsWith('cd ')) {
      const path = cmd.substring(3).trim();
      if (path === '..') {
        setCurrentPath('~/');
      } else if (path === '~' || path === '/') {
        setCurrentPath('~/');
      } else {
        setCurrentPath(`~/project/${path}`);
      }
      addOutput(`Changed directory to ${path}`);
    } else if (cmd === 'npm install') {
      addOutput('Installing dependencies...');
      setTimeout(() => {
        addOutput('✓ Dependencies installed successfully');
      }, 1000);
    } else if (cmd === 'npm run dev') {
      addOutput('Starting development server...');
      setTimeout(() => {
        addOutput('✓ Development server running at http://localhost:3000');
      }, 1000);
    } else if (cmd === 'npm run build') {
      addOutput('Building for production...');
      setTimeout(() => {
        addOutput('✓ Build completed successfully');
      }, 1500);
    } else if (cmd === 'git status') {
      addOutput(`On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/components/CodeEditor.tsx
  modified:   src/pages/FullIDE.tsx
  
Untracked files:
  src/components/MCPHub.tsx
  src/components/RAGDatabase.tsx`);
    } else if (cmd === 'git add .') {
      addOutput('Changes staged for commit');
    } else if (cmd.startsWith('git commit -m ')) {
      const message = cmd.substring(14).replace(/"/g, '');
      addOutput(`[main ${Math.random().toString(36).substr(2, 7)}] ${message}
 5 files changed, 247 insertions(+), 23 deletions(-)`);
    } else if (cmd === 'ps') {
      addOutput(`PID    COMMAND
1234   node (development server)
5678   vite (build tool)
9012   typescript (type checking)`);
    } else if (cmd.startsWith('kill ')) {
      const pid = cmd.substring(5).trim();
      addOutput(`Process ${pid} killed`);
    } else if (cmd === 'whoami') {
      addOutput('developer');
    } else if (cmd === 'date') {
      addOutput(new Date().toString());
    } else if (cmd.startsWith('echo ')) {
      const text = cmd.substring(5);
      addOutput(text);
    } else if (cmd === '') {
      setLines([...lines, commandLine]);
    } else {
      addOutput(`Command not found: ${command}. Type 'help' for available commands.`, 'error');
    }
  };

  return {
    currentPath,
    executeCommand
  };
};
