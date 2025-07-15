
import { supabase } from '@/integrations/supabase/client';

export interface CodeModificationRequest {
  operation: 'create' | 'update' | 'delete' | 'rename';
  filePath: string;
  content?: string;
  newPath?: string;
}

export interface FileSystemNode {
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemNode[];
}

export class DynamicCodeModifier {
  private fileCache: Map<string, string> = new Map();
  private listeners: Set<(changes: CodeModificationRequest[]) => void> = new Set();

  constructor() {
    this.initializeGlobalInterface();
  }

  private initializeGlobalInterface() {
    // Make this available globally for AI integration
    (window as any).applyFileChanges = this.applyChanges.bind(this);
    (window as any).getProjectStructure = this.getProjectStructure.bind(this);
    (window as any).readFile = this.readFile.bind(this);
    (window as any).writeFile = this.writeFile.bind(this);
  }

  async applyChanges(changes: CodeModificationRequest[]): Promise<boolean> {
    try {
      for (const change of changes) {
        await this.applyChange(change);
      }
      
      // Notify all listeners
      this.listeners.forEach(listener => listener(changes));
      
      console.log('Successfully applied', changes.length, 'code changes');
      return true;
    } catch (error) {
      console.error('Failed to apply code changes:', error);
      return false;
    }
  }

  private async applyChange(change: CodeModificationRequest): Promise<void> {
    switch (change.operation) {
      case 'create':
        await this.createFile(change.filePath, change.content || '');
        break;
      case 'update':
        await this.updateFile(change.filePath, change.content || '');
        break;
      case 'delete':
        await this.deleteFile(change.filePath);
        break;
      case 'rename':
        if (change.newPath) {
          await this.renameFile(change.filePath, change.newPath);
        }
        break;
    }
  }

  async createFile(filePath: string, content: string): Promise<void> {
    this.fileCache.set(filePath, content);
    
    // Store in Supabase for persistence
    const { error } = await supabase
      .from('project_files')
      .insert({
        file_path: filePath,
        content,
        file_type: this.getFileType(filePath),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to create file in database:', error);
    }
  }

  async updateFile(filePath: string, content: string): Promise<void> {
    this.fileCache.set(filePath, content);
    
    const { error } = await supabase
      .from('project_files')
      .upsert({
        file_path: filePath,
        content,
        file_type: this.getFileType(filePath),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to update file in database:', error);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    this.fileCache.delete(filePath);
    
    const { error } = await supabase
      .from('project_files')
      .delete()
      .eq('file_path', filePath);

    if (error) {
      console.error('Failed to delete file from database:', error);
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const content = this.fileCache.get(oldPath);
    if (content) {
      await this.deleteFile(oldPath);
      await this.createFile(newPath, content);
    }
  }

  async readFile(filePath: string): Promise<string | null> {
    // Check cache first
    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath) || null;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('project_files')
      .select('content')
      .eq('file_path', filePath)
      .single();

    if (error || !data) {
      return null;
    }

    this.fileCache.set(filePath, data.content);
    return data.content;
  }

  async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      await this.updateFile(filePath, content);
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  }

  async getProjectStructure(): Promise<FileSystemNode[]> {
    const { data, error } = await supabase
      .from('project_files')
      .select('file_path, file_type')
      .order('file_path');

    if (error || !data) {
      return [];
    }

    return this.buildFileTree(data);
  }

  private buildFileTree(files: Array<{ file_path: string; file_type: string }>): FileSystemNode[] {
    const tree: FileSystemNode[] = [];
    const pathMap = new Map<string, FileSystemNode>();

    for (const file of files) {
      const parts = file.file_path.split('/');
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const node: FileSystemNode = {
            path: currentPath,
            type: i === parts.length - 1 ? 'file' : 'folder',
            children: i === parts.length - 1 ? undefined : []
          };

          pathMap.set(currentPath, node);

          if (parentPath) {
            const parent = pathMap.get(parentPath);
            parent?.children?.push(node);
          } else {
            tree.push(node);
          }
        }
      }
    }

    return tree;
  }

  private getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'tsx': 'react-typescript',
      'ts': 'typescript',
      'jsx': 'react-javascript',
      'js': 'javascript',
      'css': 'stylesheet',
      'json': 'json',
      'md': 'markdown',
      'html': 'html',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return typeMap[ext] || 'text';
  }

  onFileChange(callback: (changes: CodeModificationRequest[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const dynamicCodeModifier = new DynamicCodeModifier();
