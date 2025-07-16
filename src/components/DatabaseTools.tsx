
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Table, 
  Plus, 
  Play, 
  Save,
  FileText,
  Link,
  Settings,
  Code,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
  foreignKey?: string;
}

interface TableSchema {
  name: string;
  columns: Column[];
  indexes: string[];
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'supabase';
  host?: string;
  port?: number;
  database?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export const DatabaseTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schema');
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: '1',
      name: 'Local Supabase',
      type: 'supabase',
      status: 'connected'
    }
  ]);
  const [selectedConnection, setSelectedConnection] = useState<string>('1');
  const { toast } = useToast();

  const dataTypes = [
    'TEXT', 'VARCHAR(255)', 'INTEGER', 'BIGINT', 'DECIMAL', 'BOOLEAN', 
    'DATE', 'TIMESTAMP', 'JSON', 'JSONB', 'UUID', 'BYTEA'
  ];

  const addNewTable = () => {
    const tableName = prompt('Enter table name:');
    if (tableName) {
      const newTable: TableSchema = {
        name: tableName,
        columns: [
          {
            name: 'id',
            type: 'UUID',
            nullable: false,
            defaultValue: 'gen_random_uuid()',
            primaryKey: true
          }
        ],
        indexes: []
      };
      setTables(prev => [...prev, newTable]);
      setSelectedTable(tableName);
    }
  };

  const addColumn = (tableName: string) => {
    const columnName = prompt('Enter column name:');
    if (columnName) {
      setTables(prev => prev.map(table => 
        table.name === tableName 
          ? {
              ...table,
              columns: [...table.columns, {
                name: columnName,
                type: 'TEXT',
                nullable: true
              }]
            }
          : table
      ));
    }
  };

  const updateColumn = (tableName: string, columnIndex: number, field: keyof Column, value: any) => {
    setTables(prev => prev.map(table => 
      table.name === tableName 
        ? {
            ...table,
            columns: table.columns.map((col, idx) => 
              idx === columnIndex ? { ...col, [field]: value } : col
            )
          }
        : table
    ));
  };

  const generateSQL = (table: TableSchema) => {
    const columns = table.columns.map(col => {
      let definition = `  ${col.name} ${col.type}`;
      if (!col.nullable) definition += ' NOT NULL';
      if (col.defaultValue) definition += ` DEFAULT ${col.defaultValue}`;
      if (col.primaryKey) definition += ' PRIMARY KEY';
      return definition;
    }).join(',\n');

    return `CREATE TABLE ${table.name} (\n${columns}\n);`;
  };

  const executeQuery = async () => {
    try {
      // Simulate query execution
      setQueryResults([
        { id: 1, name: 'Sample Row 1', status: 'active' },
        { id: 2, name: 'Sample Row 2', status: 'inactive' }
      ]);
      
      toast({
        title: "Query Executed",
        description: "Query executed successfully",
      });
    } catch (error) {
      toast({
        title: "Query Failed",
        description: "Failed to execute query",
        variant: "destructive"
      });
    }
  };

  const exportSchema = () => {
    const schema = tables.map(generateSQL).join('\n\n');
    const blob = new Blob([schema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database-schema.sql';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Schema Exported",
      description: "Database schema exported as SQL file",
    });
  };

  const selectedTableData = tables.find(t => t.name === selectedTable);

  return (
    <div className="h-full bg-slate-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Database className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Database Tools</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {connections.map(conn => (
                <SelectItem key={conn.id} value={conn.id}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      conn.status === 'connected' ? 'bg-green-500' : 
                      conn.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <span>{conn.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="schema">Schema Designer</TabsTrigger>
          <TabsTrigger value="query">Query Builder</TabsTrigger>
          <TabsTrigger value="data">Data Browser</TabsTrigger>
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="schema" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tables List */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Tables</CardTitle>
                  <Button size="sm" onClick={addNewTable}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Table
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {tables.map(table => (
                        <div
                          key={table.name}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedTable === table.name 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                          onClick={() => setSelectedTable(table.name)}
                        >
                          <div className="flex items-center space-x-2">
                            <Table className="w-4 h-4" />
                            <span className="font-medium">{table.name}</span>
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {table.columns.length} columns
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Column Editor */}
              <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">
                    {selectedTableData ? `Edit ${selectedTableData.name}` : 'Select a table'}
                  </CardTitle>
                  {selectedTableData && (
                    <Button size="sm" onClick={() => addColumn(selectedTableData.name)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Column
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedTableData ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {selectedTableData.columns.map((column, index) => (
                          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-700 rounded">
                            <div>
                              <Label className="text-white text-xs">Name</Label>
                              <Input
                                value={column.name}
                                onChange={(e) => updateColumn(selectedTableData.name, index, 'name', e.target.value)}
                                className="bg-slate-600 border-slate-500 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-xs">Type</Label>
                              <Select 
                                value={column.type} 
                                onValueChange={(value) => updateColumn(selectedTableData.name, index, 'type', value)}
                              >
                                <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {dataTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-white text-xs">Default</Label>
                              <Input
                                value={column.defaultValue || ''}
                                onChange={(e) => updateColumn(selectedTableData.name, index, 'defaultValue', e.target.value)}
                                placeholder="NULL"
                                className="bg-slate-600 border-slate-500 text-white text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={!column.nullable}
                                  onChange={(e) => updateColumn(selectedTableData.name, index, 'nullable', !e.target.checked)}
                                  className="rounded"
                                />
                                <Label className="text-white text-xs">NOT NULL</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={column.primaryKey || false}
                                  onChange={(e) => updateColumn(selectedTableData.name, index, 'primaryKey', e.target.checked)}
                                  className="rounded"
                                />
                                <Label className="text-white text-xs">PRIMARY KEY</Label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-slate-400">
                      Select a table to edit its columns
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* SQL Preview */}
            {selectedTableData && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Generated SQL</CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={exportSchema}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Schema
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-900 p-4 rounded text-green-400 text-sm font-mono overflow-x-auto">
                    {generateSQL(selectedTableData)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="query" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">SQL Query Editor</CardTitle>
                <Button onClick={executeQuery}>
                  <Play className="w-4 h-4 mr-2" />
                  Execute
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="bg-slate-700 border-slate-600 text-white font-mono min-h-32"
                />
                
                {queryResults.length > 0 && (
                  <div className="bg-slate-700 rounded p-4">
                    <h4 className="text-white font-medium mb-3">Query Results</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-slate-300">
                        <thead>
                          <tr className="border-b border-slate-600">
                            {Object.keys(queryResults[0] || {}).map(key => (
                              <th key={key} className="text-left p-2">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResults.map((row, index) => (
                            <tr key={index} className="border-b border-slate-600">
                              {Object.values(row).map((value: any, idx) => (
                                <td key={idx} className="p-2">{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Data Browser</CardTitle>
                <CardDescription>Browse and edit your database records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a table to browse its data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="migrations" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Database Migrations</CardTitle>
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Create Migration
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No migrations found</p>
                  <p className="text-sm mt-2">Create your first migration to track database changes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
