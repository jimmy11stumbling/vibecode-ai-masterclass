
import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    timestamp: Date;
    tags: string[];
    category: string;
    confidence: number;
  };
  embedding?: number[];
  similarity?: number;
}

export interface RAGQuery {
  query: string;
  filters?: {
    category?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    minConfidence?: number;
  };
  options?: {
    maxResults?: number;
    threshold?: number;
    includeMetadata?: boolean;
  };
}

export interface RAGResponse {
  chunks: KnowledgeChunk[];
  totalResults: number;
  processingTime: number;
  query: string;
  suggestions?: string[];
}

class RAGService {
  private embeddingCache: Map<string, number[]> = new Map();
  private indexedDocuments: Set<string> = new Set();

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    console.log('RAG 2.0 Service initialized');
    await this.loadExistingDocuments();
  }

  private async loadExistingDocuments() {
    try {
      const { data, error } = await supabase
        .from('knowledge_embeddings')
        .select('document_id')
        .not('document_id', 'is', null);

      if (error) throw error;
      
      data?.forEach(doc => {
        if (doc.document_id) {
          this.indexedDocuments.add(doc.document_id);
        }
      });
    } catch (error) {
      console.error('Error loading existing documents:', error);
    }
  }

  public async indexDocument(document: {
    id: string;
    content: string;
    metadata: any;
  }): Promise<void> {
    try {
      const chunks = this.chunkDocument(document.content);
      const embeddings = await this.generateEmbeddings(chunks);

      for (let i = 0; i < chunks.length; i++) {
        const { error } = await supabase
          .from('knowledge_embeddings')
          .insert({
            document_id: document.id,
            chunk_index: i,
            chunk_text: chunks[i],
            embedding_model: 'text-embedding-ada-002',
            metadata: {
              ...document.metadata,
              chunkIndex: i,
              totalChunks: chunks.length
            }
          });

        if (error) {
          console.error('Error inserting chunk:', error);
        }
      }

      this.indexedDocuments.add(document.id);
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  private chunkDocument(content: string, chunkSize: number = 1000): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence.trim();
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence.trim();
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [content];
  }

  private async generateEmbeddings(chunks: string[]): Promise<number[][]> {
    // In production, this would call an actual embedding API
    // For now, return mock embeddings
    return chunks.map(() => Array.from({ length: 1536 }, () => Math.random()));
  }

  public async search(ragQuery: RAGQuery): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      let query = supabase
        .from('knowledge_embeddings')
        .select('*');

      // Apply filters
      if (ragQuery.filters?.category) {
        query = query.eq('metadata->category', ragQuery.filters.category);
      }

      if (ragQuery.filters?.tags?.length) {
        query = query.overlaps('metadata->tags', ragQuery.filters.tags);
      }

      if (ragQuery.filters?.dateRange) {
        query = query
          .gte('created_at', ragQuery.filters.dateRange.start.toISOString())
          .lte('created_at', ragQuery.filters.dateRange.end.toISOString());
      }

      // Text search
      query = query.textSearch('chunk_text', ragQuery.query);

      // Limit results
      const limit = ragQuery.options?.maxResults || 10;
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      const chunks: KnowledgeChunk[] = (data || []).map(item => ({
        id: item.id,
        content: item.chunk_text,
        metadata: {
          source: item.metadata?.source || 'unknown',
          timestamp: new Date(item.created_at),
          tags: item.metadata?.tags || [],
          category: item.metadata?.category || 'general',
          confidence: this.calculateConfidence(ragQuery.query, item.chunk_text)
        },
        similarity: this.calculateSimilarity(ragQuery.query, item.chunk_text)
      }));

      // Sort by similarity
      chunks.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      // Filter by threshold
      const threshold = ragQuery.options?.threshold || 0.1;
      const filteredChunks = chunks.filter(chunk => (chunk.similarity || 0) >= threshold);

      const processingTime = Date.now() - startTime;

      return {
        chunks: filteredChunks,
        totalResults: filteredChunks.length,
        processingTime,
        query: ragQuery.query,
        suggestions: this.generateSuggestions(ragQuery.query, filteredChunks)
      };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }
  }

  private calculateConfidence(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    const matches = queryWords.filter(word => contentWords.includes(word));
    return matches.length / queryWords.length;
  }

  private calculateSimilarity(query: string, content: string): number {
    // Simple similarity calculation based on word overlap
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const contentWords = new Set(content.toLowerCase().split(/\s+/));
    const intersection = new Set([...queryWords].filter(x => contentWords.has(x)));
    const union = new Set([...queryWords, ...contentWords]);
    return intersection.size / union.size;
  }

  private generateSuggestions(query: string, chunks: KnowledgeChunk[]): string[] {
    const suggestions: Set<string> = new Set();
    
    chunks.slice(0, 3).forEach(chunk => {
      const words = chunk.content.split(/\s+/);
      words.forEach(word => {
        if (word.length > 4 && !query.toLowerCase().includes(word.toLowerCase())) {
          suggestions.add(word.toLowerCase());
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  public async addKnowledge(knowledge: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    source?: string;
  }): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: knowledge.title,
          content: knowledge.content,
          category: knowledge.category || 'general',
          tags: knowledge.tags || [],
          source_type: 'manual',
          source_url: knowledge.source,
          user_id: 'system', // In production, use actual user ID
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Index the document for search
      await this.indexDocument({
        id: data.id,
        content: knowledge.content,
        metadata: {
          title: knowledge.title,
          category: knowledge.category,
          tags: knowledge.tags,
          source: knowledge.source
        }
      });

      return data.id;
    } catch (error) {
      console.error('Error adding knowledge:', error);
      throw error;
    }
  }

  public async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base_categories')
        .select('name')
        .order('name');

      if (error) throw error;
      return data?.map(cat => cat.name) || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  public async getRecentKnowledge(limit: number = 10): Promise<KnowledgeChunk[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        content: item.content,
        metadata: {
          source: item.source_url || 'manual',
          timestamp: new Date(item.created_at),
          tags: item.tags || [],
          category: item.category || 'general',
          confidence: 1.0
        }
      }));
    } catch (error) {
      console.error('Error fetching recent knowledge:', error);
      return [];
    }
  }

  public async deleteKnowledge(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Also delete embeddings
      await supabase
        .from('knowledge_embeddings')
        .delete()
        .eq('document_id', id);

      this.indexedDocuments.delete(id);
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      throw error;
    }
  }

  public async updateKnowledge(id: string, updates: Partial<{
    title: string;
    content: string;
    category: string;
    tags: string[];
  }>): Promise<void> {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Re-index if content changed
      if (updates.content) {
        await supabase
          .from('knowledge_embeddings')
          .delete()
          .eq('document_id', id);

        await this.indexDocument({
          id,
          content: updates.content,
          metadata: {
            title: updates.title,
            category: updates.category,
            tags: updates.tags
          }
        });
      }
    } catch (error) {
      console.error('Error updating knowledge:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();
