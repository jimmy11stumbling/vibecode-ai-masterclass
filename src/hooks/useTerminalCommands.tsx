
import { useState } from 'react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export const useTerminalCommands = () => {
  const [currentPath, setCurrentPath] = useState('~/vibecode');

  const addLine = (
    lines: TerminalLine[], 
    setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>, 
    type: TerminalLine['type'], 
    content: string
  ) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeCommand = (
    command: string, 
    lines: TerminalLine[], 
    setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>
  ) => {
    // Add command line
    addLine(lines, setLines, 'command', `${currentPath} $ ${command}`);
    
    // Process command
    const [cmd, ...args] = command.trim().split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'help':
        addLine(lines, setLines, 'output', 'Available commands:');
        addLine(lines, setLines, 'output', '  help      - Show this help message');
        addLine(lines, setLines, 'output', '  clear     - Clear terminal');
        addLine(lines, setLines, 'output', '  ls        - List files');
        addLine(lines, setLines, 'output', '  pwd       - Print working directory');
        addLine(lines, setLines, 'output', '  echo      - Echo text');
        addLine(lines, setLines, 'output', '  npm       - Node package manager');
        addLine(lines, setLines, 'output', '  git       - Git commands (simulated)');
        addLine(lines, setLines, 'output', '  build     - Build project');
        addLine(lines, setLines, 'output', '  dev       - Start development server');
        break;
        
      case 'clear':
        setLines([]);
        break;
        
      case 'ls':
        addLine(lines, setLines, 'output', 'src/');
        addLine(lines, setLines, 'output', 'public/');
        addLine(lines, setLines, 'output', 'package.json');
        addLine(lines, setLines, 'output', 'tailwind.config.ts');
        addLine(lines, setLines, 'output', 'vite.config.ts');
        addLine(lines, setLines, 'output', 'README.md');
        break;
        
      case 'pwd':
        addLine(lines, setLines, 'output', currentPath);
        break;
        
      case 'echo':
        addLine(lines, setLines, 'output', args.join(' '));
        break;
        
      case 'npm':
        if (args[0] === 'install') {
          addLine(lines, setLines, 'output', 'Installing dependencies...');
          setTimeout(() => {
            addLine(lines, setLines, 'output', '✓ Dependencies installed successfully');
          }, 1000);
        } else if (args[0] === 'run' && args[1] === 'dev') {
          addLine(lines, setLines, 'output', 'Starting development server...');
          addLine(lines, setLines, 'output', '  Local:   http://localhost:5173/');
          addLine(lines, setLines, 'output', '  ready in 1.2s');
        } else {
          addLine(lines, setLines, 'output', `npm ${args.join(' ')}`);
        }
        break;
        
      case 'git':
        if (args[0] === 'status') {
          addLine(lines, setLines, 'output', 'On branch main');
          addLine(lines, setLines, 'output', 'Your branch is up to date with \'origin/main\'.');
          addLine(lines, setLines, 'output', 'nothing to commit, working tree clean');
        } else if (args[0] === 'add') {
          addLine(lines, setLines, 'output', `Added ${args.slice(1).join(' ') || '.'} to staging`);
        } else if (args[0] === 'commit') {
          addLine(lines, setLines, 'output', '[main abc123] Your commit message');
          addLine(lines, setLines, 'output', '1 file changed, 5 insertions(+)');
        } else {
          addLine(lines, setLines, 'output', `git ${args.join(' ')}`);
        }
        break;
        
      case 'build':
        addLine(lines, setLines, 'output', 'Building for production...');
        setTimeout(() => {
          addLine(lines, setLines, 'output', '✓ Build complete in 3.2s');
          addLine(lines, setLines, 'output', 'dist/ folder created');
        }, 1500);
        break;
        
      case 'dev':
        addLine(lines, setLines, 'output', 'Starting Vite dev server...');
        addLine(lines, setLines, 'output', '  Local:   http://localhost:5173/');
        addLine(lines, setLines, 'output', '  Network: use --host to expose');
        break;
        
      case '':
        // Empty command, just add prompt
        break;
        
      default:
        addLine(lines, setLines, 'error', `Command not found: ${cmd}`);
        addLine(lines, setLines, 'output', 'Type "help" for available commands.');
        break;
    }
  };

  return {
    currentPath,
    executeCommand
  };
};
