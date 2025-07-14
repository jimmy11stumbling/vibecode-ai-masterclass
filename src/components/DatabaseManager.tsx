
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Table, 
  Key, 
  Plus, 
  Trash2, 
  Edit2,
  Search,
  RefreshCw,
  Play,
  Code,
  Settings,
  Link2,
  Hash
} from 'lucide-react';

interface DatabaseTable {
  id: string;
  name: string;
  schema: string;
  columns: DatabaseColumn[];
  indexes: DatabaseIndex[];
  constraints: DatabaseConstraint[];
  rowCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseColumn {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: string;
}

interface DatabaseIndex {
  id: string;
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

interface DatabaseConstraint {
  id: string;
  name: string;
  type: 'primary' | 'foreign' | 'unique' | 'check';
  columns: string[];
  references?: string;
}

interface DatabaseManagerProps {
  onSchemaChange: (tables: DatabaseTable[]) => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  onSchemaChange
}) => {
  const [tables, setTables] = useState<DatabaseTable[]>([
    {
      id: '1',
      name: 'users',
      schema: 'public',
      columns: [
        { id: '1', name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { id: '2', name: 'email', type: 'text', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { id: '3', name: 'name', type: 'text', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { id: '4', name: 'created_at', type: 'timestamp', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false }
      ],
      indexes: [
        { id: '1', name: 'users_email_idx', columns: ['email'], unique: true, type: 'btree' }
      ],
      constraints: [
        { id: '1', name: 'users_pkey', type: 'primary', columns: ['id'] }
      ],
      rowCount: 1250,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'projects',
      schema: 'public',
      columns: [
        { id: '1', name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { id: '2', name: 'user_id', type: 'uuid', nullable: false, isPrimaryKey: false, isForeignKey: true, references: 'users.id' },
        { id: '3', name: 'name', type: 'text', nullable: false, isPrimaryKey: false, isForeignKey: false },
        { id: '4', name: 'description', type: 'text', nullable: true, isPrimaryKey: false, isForeignKey: false },
        { id: '5', name: 'created_at', type: 'timestamp', nullable: false, defaultValue: 'now()', isPrimaryKey: false, isForeignKey: false }
      ],
      indexes: [
        { id: '1', name: 'projects_user_id_idx', columns: ['user_id'], unique: false, type: 'btree' }
      ],
      constraints: [
        { id: '1', name: 'projects_pkey', type: 'primary', columns: ['id'] },
        { id: '2', name: 'projects_user_id_fkey', type: 'foreign', columns: ['user_id'], references: 'users.id' }
      ],
      rowCount: 3200,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    columns: [{ name: '', type: 'text', nullable: true, isPrimaryKey: false }]
  });
  const [isCreatingTable, setIsCreatingTable] = useState(false);

  useEffect(() => {
    onSchemaChange(tables);
  }, [tables, onSchemaChange]);

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;
    
    setIsExecuting(true);
    try {
      // Mock query execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (sqlQuery.toLowerCase().includes('select')) {
        setQueryResult({
          type: 'select',
          rows: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ],
          rowCount: 2
        });
      } else {
        setQueryResult({
          type: 'modify',
          message: 'Query executed successfully',
          rowsAffected: 1
        });
      }
    } catch (error) {
      setQueryResult({
        type: 'error',
        message: 'Error executing query'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCreateTable = () => {
    if (newTable.name.trim() && newTable.columns.length > 0) {
      const table: DatabaseTable = {
        id: Date.now().toString(),
        name: newTable.name,
        schema: 'public',
        columns: newTable.columns.map((col, idx) => ({
          id: idx.toString(),
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          isPrimaryKey: col.isPrimaryKey,
          isForeignKey: false
        })),
        indexes: [],
        constraints: [],
        rowCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setTables(prev => [...prev, table]);
      setNewTable({ name: '', columns: [{ name: '', type: 'text', nullable: true, isPrimaryKey: false }] });
      setIsCreatingTable(false);
    }
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.columns.some(col => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getColumnIcon = (column: DatabaseColumn) => {
    if (column.isPrimaryKey) return <Key className="w-4 h-4 text-yellow-400" />;
    if (column.isForeignKey) return <Link2 className="w-4 h-4 text-blue-400" />;
    return <Hash className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg">
      <Tabs defaultValue="tables" className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Database Manager</h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tables" className="flex-1 m-0 overflow-hidden">
          <div className="h-full flex">
            {/* Tables List */}
            <div className="w-1/2 border-r border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Tables</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsCreatingTable(true)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-white text-sm"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {filteredTables.map((table) => (
                    <Card 
                      key={table.id} 
                      className={`bg-slate-800 border-slate-700 cursor-pointer transition-colors ${
                        selectedTable?.id === table.id ? 'border-blue-500 bg-slate-700' : 'hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedTable(table)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Table className="w-4 h-4 text-green-400" />
                            <CardTitle className="text-white text-sm">{table.name}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant="secondary" className="text-xs">
                              {table.columns.length} cols
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTable(table.id);
                              }}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{table.rowCount.toLocaleString()} rows</span>
                          <span>{table.schema}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Table Details */}
            <div className="w-1/2 flex flex-col">
              {selectedTable ? (
                <>
                  <div className="p-4 border-b border-slate-700">
                    <h4 className="text-lg font-medium text-white mb-2">{selectedTable.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>{selectedTable.columns.length} columns</span>
                      <span>{selectedTable.rowCount.toLocaleString()} rows</span>
                      <span>{selectedTable.schema} schema</span>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <h5 className="text-sm font-medium text-white mb-3">Columns</h5>
                      <div className="space-y-2">
                        {selectedTable.columns.map((column) => (
                          <div key={column.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getColumnIcon(column)}
                              <div>
                                <span className="text-white text-sm font-medium">{column.name}</span>
                                <div className="flex items-center space-x-2 text-xs text-slate-400">
                                  <span>{column.type}</span>
                                  {!column.nullable && <Badge variant="outline" className="text-xs">NOT NULL</Badge>}
                                  {column.defaultValue && <Badge variant="secondary" className="text-xs">DEFAULT</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {column.isPrimaryKey && <Badge className="text-xs bg-yellow-600">PK</Badge>}
                              {column.isForeignKey && <Badge className="text-xs bg-blue-600">FK</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedTable.indexes.length > 0 && (
                        <>
                          <h5 className="text-sm font-medium text-white mb-3 mt-6">Indexes</h5>
                          <div className="space-y-2">
                            {selectedTable.indexes.map((index) => (
                              <div key={index.id} className="bg-slate-800 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-white text-sm">{index.name}</span>
                                  <div className="flex items-center space-x-1">
                                    {index.unique && <Badge variant="outline" className="text-xs">UNIQUE</Badge>}
                                    <Badge variant="secondary" className="text-xs">{index.type}</Badge>
                                  </div>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  Columns: {index.columns.join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Table className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Select a table to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="query" className="flex-1 m-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white">SQL Query</h4>
                <Button
                  size="sm"
                  onClick={handleExecuteQuery}
                  disabled={isExecuting || !sqlQuery.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Execute
                </Button>
              </div>
              
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono resize-none focus:border-blue-400 focus:outline-none"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {queryResult ? (
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-white mb-3">Query Result</h5>
                    {queryResult.type === 'select' ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              {queryResult.rows.length > 0 && Object.keys(queryResult.rows[0]).map((key) => (
                                <th key={key} className="text-left p-2 text-white">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.rows.map((row: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-700">
                                {Object.values(row).map((value: any, colIdx: number) => (
                                  <td key={colIdx} className="p-2 text-slate-300">{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : queryResult.type === 'error' ? (
                      <div className="text-red-400">{queryResult.message}</div>
                    ) : (
                      <div className="text-green-400">
                        {queryResult.message} ({queryResult.rowsAffected} rows affected)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Execute a query to see results</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="schema" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">Database Schema</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const schemaJson = JSON.stringify(tables, null, 2);
                    navigator.clipboard.writeText(schemaJson);
                  }}
                >
                  Copy Schema
                </Button>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(tables, null, 2)}
                </pre>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Create Table Modal */}
      {isCreatingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-white mb-4">Create New Table</h3>
            
            <div className="space-y-4">
              <Input
                placeholder="Table name"
                value={newTable.name}
                onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Columns</h4>
                {newTable.columns.map((column, idx) => (
                  <div key={idx} className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Column name"
                      value={column.name}
                      onChange={(e) => {
                        const newColumns = [...newTable.columns];
                        newColumns[idx] = { ...newColumns[idx], name: e.target.value };
                        setNewTable(prev => ({ ...prev, columns: newColumns }));
                      }}
                      className="bg-slate-700 border-slate-600 text-white text-sm"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => {
                        const newColumns = [...newTable.columns];
                        newColumns[idx] = { ...newColumns[idx], type: e.target.value };
                        setNewTable(prev => ({ ...prev, columns: newColumns }));
                      }}
                      className="bg-slate-700 border border-slate-600 text-white text-sm rounded px-2"
                    >
                      <option value="text">text</option>
                      <option value="integer">integer</option>
                      <option value="uuid">uuid</option>
                      <option value="timestamp">timestamp</option>
                      <option value="boolean">boolean</option>
                    </select>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewTable(prev => ({
                      ...prev,
                      columns: [...prev.columns, { name: '', type: 'text', nullable: true, isPrimaryKey: false }]
                    }));
                  }}
                  className="text-xs"
                >
                  Add Column
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button onClick={handleCreateTable} className="bg-green-600 hover:bg-green-700">
                Create
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingTable(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
