
import React, { useState } from 'react';
import { Play, Download, Share, Eye, Code, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sampleCode = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        // React component code goes here
    </script>
</body>
</html>`,
  
  react: `function TodoApp() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build awesome apps', completed: false }
  ]);
  const [inputValue, setInputValue] = React.useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo App</h1>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a new todo..."
        />
        <button
          onClick={addTodo}
          className="px-6 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="mr-3"
              />
              <span className={\`\${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}\`}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.render(<TodoApp />, document.getElementById('root'));`,

  css: `.todo-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.todo-item {
  transition: all 0.2s ease-in-out;
}

.todo-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.completed {
  opacity: 0.6;
}

@media (max-width: 768px) {
  .todo-app {
    padding: 1rem;
  }
}`
};

export const CodePreview = () => {
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeCode, setActiveCode] = useState<'react' | 'html' | 'css'>('react');

  const getPreviewWidth = () => {
    switch (activeView) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Live Preview</h2>
        
        <div className="flex items-center space-x-4">
          {/* Responsive View Controls */}
          <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <Button
              size="sm"
              variant={activeView === 'desktop' ? 'secondary' : 'ghost'}
              onClick={() => setActiveView('desktop')}
              className="h-8 w-8 p-0"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeView === 'tablet' ? 'secondary' : 'ghost'}
              onClick={() => setActiveView('tablet')}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeView === 'mobile' ? 'secondary' : 'ghost'}
              onClick={() => setActiveView('mobile')}
              className="h-8 w-8 p-0"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:text-white">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview Panel */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">Preview</h3>
            <div className="text-xs text-gray-400">
              {activeView === 'desktop' ? '1200px' : activeView === 'tablet' ? '768px' : '375px'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <div className={`mx-auto h-full overflow-auto ${getPreviewWidth()}`}>
              <iframe
                srcDoc={`
                  ${sampleCode.html.replace('// React component code goes here', sampleCode.react)}
                  <style>${sampleCode.css}</style>
                `}
                className="w-full h-full border-0"
                title="Code Preview"
              />
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <Tabs value={activeCode} onValueChange={(value) => setActiveCode(value as any)}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <TabsList className="bg-transparent">
                <TabsTrigger value="react" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-400">
                  React
                </TabsTrigger>
                <TabsTrigger value="html" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-400">
                  HTML
                </TabsTrigger>
                <TabsTrigger value="css" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-400">
                  CSS
                </TabsTrigger>
              </TabsList>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(sampleCode[activeCode])}
                className="text-gray-400 hover:text-white"
              >
                <Code className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-[400px] overflow-auto">
              <TabsContent value="react" className="m-0 h-full">
                <pre className="p-4 text-sm text-gray-100 h-full overflow-auto">
                  <code>{sampleCode.react}</code>
                </pre>
              </TabsContent>
              <TabsContent value="html" className="m-0 h-full">
                <pre className="p-4 text-sm text-gray-100 h-full overflow-auto">
                  <code>{sampleCode.html}</code>
                </pre>
              </TabsContent>
              <TabsContent value="css" className="m-0 h-full">
                <pre className="p-4 text-sm text-gray-100 h-full overflow-auto">
                  <code>{sampleCode.css}</code>
                </pre>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
