
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Plus, Play, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DatabaseTable {
  id: string;
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primary?: boolean;
  }>;
  createdAt: Date;
}

interface DatabaseManagerProps {
  onSchemaChange?: (tables: DatabaseTable[]) => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onSchemaChange }) => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState<Array<{
    id: string;
    query: string;
    timestamp: Date;
    status: 'success' | 'error';
    result?: string;
  }>>([]);
  
  const { toast } = useToast();

  const generateCreateTableSQL = (table: DatabaseTable): string => {
    const columns = table.columns.map(col => {
      let columnDef = `${col.name} ${col.type}`;
      if (col.primary) columnDef += ' PRIMARY KEY';
      if (!col.nullable) columnDef += ' NOT NULL';
      return columnDef;
    }).join(',\n  ');

    return `CREATE TABLE ${table.name} (\n  ${columns}\n);`;
  };

  const commonTableTemplates = [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, primary: true },
        { name: 'email', type: 'TEXT', nullable: false },
        { name: 'password_hash', type: 'TEXT', nullable: false },
        { name: 'full_name', type: 'TEXT', nullable: true },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false },
        { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false }
      ]
    },
    {
      name: 'posts',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, primary: true },
        { name: 'title', type: 'TEXT', nullable: false },
        { name: 'content', type: 'TEXT', nullable: true },
        { name: 'author_id', type: 'UUID', nullable: false },
        { name: 'published', type: 'BOOLEAN', nullable: false },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false }
      ]
    },
    {
      name: 'products',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, primary: true },
        { name: 'name', type: 'TEXT', nullable: false },
        { name: 'description', type: 'TEXT', nullable: true },
        { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
        { name: 'stock_quantity', type: 'INTEGER', nullable: false },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false }
      ]
    }
  ];

  const addTableFromTemplate = (template: typeof commonTableTemplates[0]) => {
    const newTable: DatabaseTable = {
      id: Date.now().toString(),
      name: template.name,
      columns: template.columns,
      createdAt: new Date()
    };

    setTables(prev => [...prev, newTable]);
    onSchemaChange?.([...tables, newTable]);

    toast({
      title: "Table Template Added",
      description: `${template.name} table structure created`,
    });
  };

  const generateCRUDOperations = (table: DatabaseTable): string => {
    const tableName = table.name;
    const primaryKey = table.columns.find(col => col.primary)?.name || 'id';
    
    return `-- CRUD Operations for ${tableName}

-- Create
INSERT INTO ${tableName} (${table.columns.filter(col => !col.primary).map(col => col.name).join(', ')})
VALUES (/* values here */);

-- Read All
SELECT * FROM ${tableName}
ORDER BY created_at DESC;

-- Read One
SELECT * FROM ${tableName}
WHERE ${primaryKey} = $1;

-- Update
UPDATE ${tableName}
SET /* column = value */
WHERE ${primaryKey} = $1;

-- Delete
DELETE FROM ${tableName}
WHERE ${primaryKey} = $1;`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "SQL code has been copied",
    });
  };

  const generateAPIEndpoints = (table: DatabaseTable): string => {
    const tableName = table.name;
    const capitalizedName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
    
    return `// API Endpoints for ${capitalizedName}
// GET /api/${tableName}
export async function GET() {
  const { data, error } = await supabase
    .from('${tableName}')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// POST /api/${tableName}
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from('${tableName}')
    .insert(body)
    .select()
    .single();
    
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// PUT /api/${tableName}/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { data, error } = await supabase
    .from('${tableName}')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();
    
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// DELETE /api/${tableName}/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('${tableName}')
    .delete()
    .eq('id', params.id);
    
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Database Manager</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-slate-400">Connected</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="schema" className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="sql">SQL Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="schema" className="h-full m-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-200">Database Tables</h4>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Table
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                {tables.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No tables created yet</p>
                    <p className="text-sm text-slate-500">Use templates or create custom tables</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tables.map((table) => (
                      <div key={table.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-white">{table.name}</h5>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(generateCreateTableSQL(table))}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {table.columns.map((column, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-slate-300">{column.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-400">{column.type}</span>
                                {column.primary && (
                                  <span className="px-2 py-1 bg-blue-600 text-xs rounded">PK</span>
                                )}
                                {!column.nullable && (
                                  <span className="px-2 py-1 bg-orange-600 text-xs rounded">NOT NULL</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-700">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generateCRUDOperations(table))}
                            >
                              Copy CRUD SQL
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generateAPIEndpoints(table))}
                            >
                              Copy API Code
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="sql" className="h-full m-0">
            <div className="p-4 h-full flex flex-col">
              <div className="flex-1 mb-4">
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="h-full bg-slate-800 border-slate-600 text-white font-mono"
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Execute Query
                </Button>
                <Button variant="outline" onClick={() => setSqlQuery('')}>
                  Clear
                </Button>
              </div>

              {queryHistory.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                  <h5 className="font-medium text-slate-200 mb-2">Query History</h5>
                  <ScrollArea className="h-32">
                    {queryHistory.map((query) => (
                      <div key={query.id} className="mb-2 p-2 bg-slate-800 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <code className="text-slate-300">{query.query.substring(0, 50)}...</code>
                          <span className={`text-xs ${
                            query.status === 'success' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {query.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full m-0">
            <div className="p-4">
              <h4 className="font-medium text-slate-200 mb-4">Common Table Templates</h4>
              
              <div className="grid gap-4">
                {commonTableTemplates.map((template, index) => (
                  <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-white capitalize">{template.name}</h5>
                      <Button
                        size="sm"
                        onClick={() => addTableFromTemplate(template)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      {template.columns.slice(0, 4).map((column, colIndex) => (
                        <div key={colIndex} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{column.name}</span>
                          <span className="text-slate-400">{column.type}</span>
                        </div>
                      ))}
                      {template.columns.length > 4 && (
                        <div className="text-xs text-slate-500">
                          +{template.columns.length - 4} more columns
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
