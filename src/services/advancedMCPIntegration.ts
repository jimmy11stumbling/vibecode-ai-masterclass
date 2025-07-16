import { SupabaseClient } from '@supabase/supabase-js';

// Define data structures for RAG
export interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  chunks: RAGChunk[];
  embeddings: number[][];
  processed: boolean;
}

export interface RAGChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  position: number;
  hierarchyLevel: number;
}

// Define data structures for A2A
export interface A2ATask {
  id: string;
  type: string;
  status: string;
}

export interface A2AWorkflow {
  id: string;
  name?: string;
  description?: string;
  steps?: A2ATask[];
}

export interface A2AAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
}

export interface A2AMessage {
  id: string;
  timestamp: Date;
  from: string;
  to: string;
  type: string;
  content: string;
  parts: any[];
}

export class AdvancedMCPIntegrationService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async sendA2AMessage(taskId: string, message: string): Promise<void> {
    const a2aMessage: A2AMessage = {
      id: `msg_${Date.now()}`,
      timestamp: new Date(),
      from: 'system',
      to: taskId,
      type: 'task_update',
      content: message,
      parts: []
    };

    try {
      const { error } = await this.supabase
        .from('workflow_executions')
        .insert({
          id: a2aMessage.id,
          workflow_id: taskId,
          input_data: JSON.parse(JSON.stringify(a2aMessage)),
          status: 'running',
          started_at: new Date().toISOString(),
          user_id: 'system'
        });

      if (error) {
        console.error('Failed to send A2A message:', error);
        throw error;
      }

      console.log('A2A message sent successfully:', a2aMessage);
    } catch (error) {
      console.error('Error sending A2A message:', error);
      throw error;
    }
  }

  async processDocument(content: string, metadata: Record<string, any> = {}): Promise<RAGDocument> {
    try {
      const docData = {
        filename: metadata.filename || 'document.txt',
        original_filename: metadata.original_filename || metadata.filename || 'document.txt',
        mime_type: metadata.mime_type || 'text/plain',
        file_size: content.length,
        extracted_text: content,
        metadata: JSON.parse(JSON.stringify(metadata)),
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        user_id: 'system' // Add required user_id field
      };

      const { data, error } = await this.supabase
        .from('documents')
        .insert(docData)
        .select()
        .single();

      if (error) {
        console.error('Failed to store document:', error);
        throw error;
      }

      return {
        id: data.id,
        content,
        metadata: metadata,
        chunks: [],
        embeddings: [],
        processed: true
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  async createA2ATask(task: A2ATask, workflow: A2AWorkflow, participants: A2AAgent[]): Promise<string> {
    try {
      const taskData = {
        name: `Task: ${task.id}`,
        definition: JSON.parse(JSON.stringify({ task, workflow, participants })),
        status: 'active',
        is_active: true,
        user_id: 'system'
      };

      const { data, error } = await this.supabase
        .from('workflow_definitions')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Failed to create A2A task:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating A2A task:', error);
      throw error;
    }
  }

  async executeA2ATask(taskId: string): Promise<any> {
    try {
      const taskData = {
        task: { id: taskId, type: 'execution', status: 'running' } as A2ATask,
        workflow: { id: taskId } as A2AWorkflow,
        participants: [] as A2AAgent[]
      };

      const { data, error } = await this.supabase
        .from('workflow_executions')
        .insert({
          workflow_id: taskId,
          input_data: JSON.parse(JSON.stringify(taskData)),
          status: 'running',
          started_at: new Date().toISOString(),
          user_id: 'system'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to execute A2A task:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error executing A2A task:', error);
      throw error;
    }
  }

  async createEmbeddingChunks(documentId: string, chunks: string[], embeddings: number[][]): Promise<RAGChunk[]> {
    try {
      const chunkData = chunks.map((content, index) => ({
        id: `chunk_${documentId}_${index}`,
        documentId,
        content,
        embedding: embeddings[index] || [],
        metadata: JSON.parse(JSON.stringify({ position: index, hierarchyLevel: 0 })),
        position: index,
        hierarchyLevel: 0
      }));

      const ragChunks: RAGChunk[] = chunkData.map(chunk => ({
        ...chunk,
        metadata: typeof chunk.metadata === 'string' ? JSON.parse(chunk.metadata) : chunk.metadata
      }));

      return ragChunks;
    } catch (error) {
      console.error('Error creating embedding chunks:', error);
      throw error;
    }
  }
}

export const advancedMCPIntegration = (supabaseClient: SupabaseClient) => {
  return new AdvancedMCPIntegrationService(supabaseClient);
};
