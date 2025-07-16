
import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: {
    type: string;
    source: string;
    tags: string[];
    lastModified: Date;
    author?: string;
  };
  embeddings?: number[];
  chunks?: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  embeddings: number[];
  metadata: Record<string, any>;
}

export interface SearchQuery {
  query: string;
  filters?: {
    type?: string[];
    tags?: string[];
    dateRange?: [Date, Date];
  };
  limit?: number;
  threshold?: number;
  includeChunks?: boolean;
}

export interface SearchResult {
  document: Document;
  chunk?: DocumentChunk;
  similarity: number;
  relevanceScore: number;
  contextualExplanation: string;
}

export class ProductionRAGSystem {
  private embeddingModel = 'text-embedding-3-small';
  private chunkSize = 1000;
  private chunkOverlap = 200;

  async addDocument(document: Omit<Document, 'id' | 'embeddings' | 'chunks'>): Promise<string> {
    try {
      const docId = crypto.randomUUID();
      
      // Generate embeddings for the full document
      const documentEmbeddings = await this.generateEmbeddings(document.content);
      
      // Split into chunks and generate embeddings for each
      const chunks = await this.createChunks(docId, document.content);
      
      // Store document in Supabase
      const { error: docError } = await supabase
        .from('knowledge_base')
        .insert({
          id: docId,
          title: document.title,
          content: document.content,
          category: document.metadata.type,
          tags: document.metadata.tags,
          source_type: 'uploaded',
          source_url: document.metadata.source,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (docError) throw docError;

      // Store chunks with embeddings
      const chunkInserts = chunks.map(chunk => ({
        id: chunk.id,
        document_id: docId,
        chunk_index: chunk.index,
        chunk_text: chunk.content,
        vector_id: `vec_${chunk.id}`,
        embedding_model: this.embeddingModel,
        metadata: chunk.metadata
      }));

      const { error: chunkError } = await supabase
        .from('knowledge_embeddings')
        .insert(chunkInserts);

      if (chunkError) throw chunkError;

      console.log(`Document ${docId} added with ${chunks.length} chunks`);
      return docId;
    } catch (error) {
      console.error('Failed to add document:', error);
      throw error;
    }
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // Generate query embeddings
      const queryEmbeddings = await this.generateEmbeddings(query.query);
      
      // Search in Supabase using vector similarity (simplified version)
      let supabaseQuery = supabase
        .from('knowledge_base')
        .select(`
          *,
          knowledge_embeddings (*)
        `)
        .eq('status', 'active')
        .limit(query.limit || 10);

      // Apply filters
      if (query.filters?.type?.length) {
        supabaseQuery = supabaseQuery.in('category', query.filters.type);
      }

      if (query.filters?.tags?.length) {
        supabaseQuery = supabaseQuery.overlaps('tags', query.filters.tags);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;

      // Calculate similarity scores and rank results
      const results: SearchResult[] = [];
      
      for (const doc of data || []) {
        const similarity = this.calculateTextSimilarity(query.query, doc.content);
        
        if (similarity >= (query.threshold || 0.3)) {
          results.push({
            document: {
              id: doc.id,
              title: doc.title,
              content: doc.content,
              metadata: {
                type: doc.category || 'unknown',
                source: doc.source_url || 'internal',
                tags: doc.tags || [],
                lastModified: new Date(doc.updated_at)
              }
            },
            similarity,
            relevanceScore: similarity * 100,
            contextualExplanation: this.generateContextualExplanation(query.query, doc.content)
          });
        }
      }

      // Sort by relevance
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      return results.slice(0, query.limit || 10);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    try {
      // In production, this would call OpenAI or similar service
      // For now, return mock embeddings
      const words = text.toLowerCase().split(/\s+/);
      const embeddings = new Array(1536).fill(0);
      
      words.forEach((word, index) => {
        const hash = this.simpleHash(word);
        embeddings[hash % 1536] += 0.1;
      });
      
      // Normalize
      const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
      return embeddings.map(val => val / (magnitude || 1));
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return new Array(1536).fill(0);
    }
  }

  private async createChunks(documentId: string, content: string): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    const words = content.split(/\s+/);
    
    for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
      const chunkWords = words.slice(i, i + this.chunkSize);
      const chunkContent = chunkWords.join(' ');
      
      if (chunkContent.trim()) {
        const chunkId = crypto.randomUUID();
        const embeddings = await this.generateEmbeddings(chunkContent);
        
        chunks.push({
          id: chunkId,
          documentId,
          content: chunkContent,
          index: chunks.length,
          embeddings,
          metadata: {
            wordCount: chunkWords.length,
            startIndex: i,
            endIndex: i + chunkWords.length
          }
        });
      }
    }
    
    return chunks;
  }

  private calculateTextSimilarity(query: string, text: string): number {
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word of textWords) {
      if (queryWords.has(word)) matches++;
    }
    
    return matches / Math.max(queryWords.size, textWords.length);
  }

  private generateContextualExplanation(query: string, content: string): string {
    const queryWords = query.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.toLowerCase().split(/\s+/);
      const hasMatch = queryWords.some(word => sentenceWords.includes(word));
      
      if (hasMatch) {
        return sentence.trim().substring(0, 200) + '...';
      }
    }
    
    return content.substring(0, 200) + '...';
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      if (updates.metadata?.tags) updateData.tags = updates.metadata.tags;
      if (updates.metadata?.type) updateData.category = updates.metadata.type;
      
      const { error } = await supabase
        .from('knowledge_base')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // If content changed, regenerate chunks and embeddings
      if (updates.content) {
        await this.regenerateChunks(id, updates.content);
      }
    } catch (error) {
      console.error('Document update failed:', error);
      throw error;
    }
  }

  private async regenerateChunks(documentId: string, content: string): Promise<void> {
    // Delete existing chunks
    await supabase
      .from('knowledge_embeddings')
      .delete()
      .eq('document_id', documentId);

    // Generate new chunks
    const chunks = await this.createChunks(documentId, content);
    
    // Insert new chunks
    const chunkInserts = chunks.map(chunk => ({
      id: chunk.id,
      document_id: documentId,
      chunk_index: chunk.index,
      chunk_text: chunk.content,
      vector_id: `vec_${chunk.id}`,
      embedding_model: this.embeddingModel,
      metadata: chunk.metadata
    }));

    await supabase
      .from('knowledge_embeddings')
      .insert(chunkInserts);
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      // Delete chunks first
      await supabase
        .from('knowledge_embeddings')
        .delete()
        .eq('document_id', id);

      // Delete document
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Document deletion failed:', error);
      throw error;
    }
  }

  async getDocumentById(id: string): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        metadata: {
          type: data.category || 'unknown',
          source: data.source_url || 'internal',
          tags: data.tags || [],
          lastModified: new Date(data.updated_at)
        }
      };
    } catch (error) {
      console.error('Failed to get document:', error);
      return null;
    }
  }
}

export const productionRAGSystem = new ProductionRAGSystem();
