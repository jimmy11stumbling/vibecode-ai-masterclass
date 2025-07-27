import { MCPServer, MCPTool } from './mcp/types';
import { dynamicCodeModifier } from './dynamicCodeModifier';

export class MCPFileServer implements MCPServer {
  public id = 'file-operations-server';
  public name = 'File Operations Server';
  public url = 'internal://file-operations';
  public status: 'connected' | 'disconnected' | 'error' = 'connected';
  public tools: MCPTool[] = [];

  constructor() {
    this.initializeTools();
  }

  private initializeTools() {
    this.tools = [
      {
        name: 'createFile',
        description: 'Create a new file with specified content',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to project root' },
            content: { type: 'string', description: 'File content' }
          },
          required: ['path', 'content']
        },
        execute: async (params: { path: string; content: string }) => {
          await dynamicCodeModifier.createFile(params.path, params.content);
          return { success: true, message: `Created file: ${params.path}` };
        }
      },
      {
        name: 'updateFile',
        description: 'Update an existing file with new content',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to project root' },
            content: { type: 'string', description: 'New file content' }
          },
          required: ['path', 'content']
        },
        execute: async (params: { path: string; content: string }) => {
          await dynamicCodeModifier.updateFile(params.path, params.content);
          return { success: true, message: `Updated file: ${params.path}` };
        }
      },
      {
        name: 'deleteFile',
        description: 'Delete a file from the project',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to project root' }
          },
          required: ['path']
        },
        execute: async (params: { path: string }) => {
          await dynamicCodeModifier.deleteFile(params.path);
          return { success: true, message: `Deleted file: ${params.path}` };
        }
      },
      {
        name: 'readFile',
        description: 'Read the contents of a file',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to project root' }
          },
          required: ['path']
        },
        execute: async (params: { path: string }) => {
          const content = await dynamicCodeModifier.readFile(params.path);
          return { 
            success: true, 
            content: content || '',
            message: `Read file: ${params.path}` 
          };
        }
      },
      {
        name: 'listFiles',
        description: 'List all files in the project',
        input_schema: {
          type: 'object',
          properties: {}
        },
        execute: async () => {
          const structure = await dynamicCodeModifier.getProjectStructure();
          return { 
            success: true, 
            files: structure,
            message: 'Listed project files' 
          };
        }
      },
      {
        name: 'renameFile',
        description: 'Rename a file in the project',
        input_schema: {
          type: 'object',
          properties: {
            oldPath: { type: 'string', description: 'Current file path' },
            newPath: { type: 'string', description: 'New file path' }
          },
          required: ['oldPath', 'newPath']
        },
        execute: async (params: { oldPath: string; newPath: string }) => {
          await dynamicCodeModifier.renameFile(params.oldPath, params.newPath);
          return { 
            success: true, 
            message: `Renamed file: ${params.oldPath} -> ${params.newPath}` 
          };
        }
      }
    ];
  }

  async executeFileOperation(toolName: string, params: any) {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    return await tool.execute(params);
  }
}

export const mcpFileServer = new MCPFileServer();