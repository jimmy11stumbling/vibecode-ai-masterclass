
import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  score?: number;
  source?: string;
  tags?: string[];
  category?: string;
}

export interface SearchResult {
  chunks: KnowledgeChunk[];
  totalCount: number;
  query: string;
  processingTime: number;
}

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface RAGQueryOptions {
  limit?: number;
  threshold?: number;
  includeMetadata?: boolean;
  filterBy?: Record<string, any>;
}

class RAGService {
  private readonly defaultModel = 'text-embedding-3-small';
  private readonly defaultLimit = 10;
  private readonly defaultThreshold = 0.5;

  constructor() {
    console.log('RAG Service initialized');
  }

  // Store document in knowledge base
  async storeDocument(content: string, metadata: Record<string, any> = {}): Promise<string> {
    try {
      const chunks = this.chunkText(content);
      const documentId = crypto.randomUUID();

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await this.generateEmbedding(chunk);

        const { error } = await supabase
          .from('knowledge_embeddings')
          .insert({
            document_id: documentId,
            chunk_index: i,
            chunk_text: chunk,
            metadata: {
              ...metadata,
              chunkIndex: i,
              totalChunks: chunks.length
            }
          });

        if (error) throw error;
      }

      return documentId;
    } catch (error) {
      console.error('Error storing document:', error);
      throw error;
    }
  }

  // Search knowledge base
  async search(query: string, options: RAGQueryOptions = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const limit = options.limit || this.defaultLimit;

    try {
      // Use text search for now (in production, you'd use vector similarity)
      let queryBuilder = supabase
        .from('knowledge_embeddings')
        .select('*')
        .textSearch('chunk_text', query)
        .limit(limit);

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const chunks: KnowledgeChunk[] = (data || []).map((item: any) => ({
        id: item.id,
        content: item.chunk_text,
        metadata: item.metadata || {},
        source: typeof item.metadata === 'object' && item.metadata !== null ? 
          (item.metadata as any).source : undefined,
        tags: typeof item.metadata === 'object' && item.metadata !== null ? 
          (item.metadata as any).tags : undefined,
        category: typeof item.metadata === 'object' && item.metadata !== null ? 
          (item.metadata as any).category : undefined
      }));

      return {
        chunks,
        totalCount: chunks.length,
        query,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }
  }

  // Generate contextual response using RAG
  async generateResponse(query: string, context?: string): Promise<string> {
    try {
      const searchResults = await this.search(query, { limit: 5 });
      const relevantChunks = searchResults.chunks
        .slice(0, 3)
        .map(chunk => chunk.content)
        .join('\n\n');

      const prompt = `
Context from knowledge base:
${relevantChunks}

${context ? `Additional context: ${context}` : ''}

Question: ${query}

Please provide a comprehensive answer based on the context provided.
`;

      // In production, this would call the actual AI API
      return `Based on the knowledge base, here's a response to "${query}": ${prompt.substring(0, 200)}...`;
    } catch (error) {
      console.error('Error generating RAG response:', error);
      return 'Sorry, I encountered an error while processing your request.';
    }
  }

  // Chunk text into smaller pieces
  private chunkText(text: string, maxChunkSize: number = 1000): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence.trim();
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.length > 0 ? chunks : [text];
  }

  // Generate embeddings (placeholder - in production use actual embedding API)
  private async generateEmbedding(text: string): Promise<number[]> {
    // Placeholder: In production, call actual embedding API
    // For now, return a mock embedding
    return Array.from({ length: 1536 }, () => Math.random());
  }

  // Get knowledge base statistics
  async getStatistics(): Promise<{
    totalChunks: number;
    totalDocuments: number;
    recentActivity: number;
  }> {
    try {
      const { data: chunks, error: chunksError } = await supabase
        .from('knowledge_embeddings')
        .select('id, document_id', { count: 'exact' });

      if (chunksError) throw chunksError;

      const uniqueDocuments = new Set(chunks?.map(c => c.document_id) || []).size;

      // Get recent activity (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: recent, error: recentError } = await supabase
        .from('knowledge_embeddings')
        .select('id', { count: 'exact' })
        .gte('created_at', yesterday.toISOString());

      if (recentError) throw recentError;

      return {
        totalChunks: chunks?.length || 0,
        totalDocuments: uniqueDocuments,
        recentActivity: recent?.length || 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalChunks: 0,
        totalDocuments: 0,
        recentActivity: 0
      };
    }
  }

  // Clear knowledge base
  async clearKnowledgeBase(): Promise<void> {
    try {
      const { error } = await supabase
        .from('knowledge_embeddings')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) throw error;
      console.log('Knowledge base cleared successfully');
    } catch (error) {
      console.error('Error clearing knowledge base:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();
