import { supabase } from '@/integrations/supabase/client';

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata: any;
  vectorEmbedding?: number[];
  relevanceScore?: number;
}

export interface RAGQuery {
  query: string;
  filters?: {
    category?: string;
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  limit?: number;
  threshold?: number;
}

export interface RAGResult {
  documents: RAGDocument[];
  totalResults: number;
  queryTime: number;
  contextSummary: string;
}

export class RAGDatabaseCore {
  private embeddingCache = new Map<string, number[]>();
  private contextCache = new Map<string, RAGResult>();

  async indexDocument(document: Omit<RAGDocument, 'id' | 'vectorEmbedding'>): Promise<string> {
    console.log('📚 RAG Database: Indexing document:', document.title);

    try {
      // Generate embedding for the document
      const embedding = await this.generateEmbedding(document.content);

      // Store in knowledge base
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: document.title,
          content: document.content,
          category: document.category,
          tags: document.tags,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();

      if (error) throw error;

      // Store embedding separately
      await supabase
        .from('knowledge_embeddings')
        .insert({
          document_id: data.id,
          chunk_text: document.content,
          chunk_index: 0,
          vector_id: `embed_${data.id}`,
          metadata: {
            ...document.metadata,
            embedding
          }
        });

      console.log('✅ RAG Database: Document indexed successfully');
      return data.id;

    } catch (error) {
      console.error('Failed to index document:', error);
      throw error;
    }
  }

  async query(ragQuery: RAGQuery): Promise<RAGResult> {
    const startTime = Date.now();
    const cacheKey = JSON.stringify(ragQuery);

    // Check cache first
    if (this.contextCache.has(cacheKey)) {
      const cachedResult = this.contextCache.get(cacheKey)!;
      console.log('🎯 RAG Database: Returning cached result');
      return cachedResult;
    }

    console.log('🔍 RAG Database: Executing query:', ragQuery.query);

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(ragQuery.query);

      // Build filters
      let query = supabase.from('knowledge_base').select(`
        id,
        title,
        content,
        category,
        tags,
        created_at
      `);

      // Apply text search
      query = query.textSearch('content', ragQuery.query);

      // Apply filters
      if (ragQuery.filters?.category) {
        query = query.eq('category', ragQuery.filters.category);
      }

      if (ragQuery.filters?.tags && ragQuery.filters.tags.length > 0) {
        query = query.overlaps('tags', ragQuery.filters.tags);
      }

      if (ragQuery.filters?.dateRange) {
        query = query
          .gte('created_at', ragQuery.filters.dateRange.start.toISOString())
          .lte('created_at', ragQuery.filters.dateRange.end.toISOString());
      }

      // Execute query
      const { data, error } = await query.limit(ragQuery.limit || 10);

      if (error) throw error;

      // Calculate semantic similarity scores
      const documentsWithScores = await this.calculateRelevanceScores(
        data || [],
        queryEmbedding,
        ragQuery.threshold || 0.7
      );

      // Generate context summary
      const contextSummary = await this.generateContextSummary(
        documentsWithScores,
        ragQuery.query
      );

      const result: RAGResult = {
        documents: documentsWithScores,
        totalResults: documentsWithScores.length,
        queryTime: Date.now() - startTime,
        contextSummary
      };

      // Cache result
      this.contextCache.set(cacheKey, result);
      
      console.log(`✅ RAG Database: Query completed in ${result.queryTime}ms, found ${result.totalResults} results`);
      return result;

    } catch (error) {
      console.error('RAG query failed:', error);
      throw error;
    }
  }

  async enhanceContext(baseQuery: string, additionalContext: string[]): Promise<RAGResult> {
    const enhancedQuery = [baseQuery, ...additionalContext].join(' ');
    
    return this.query({
      query: enhancedQuery,
      limit: 15,
      threshold: 0.6
    });
  }

  async createContextualResponse(
    query: string,
    ragResults: RAGResult,
    responseTemplate?: string
  ): Promise<string> {
    const contextChunks = ragResults.documents
      .slice(0, 5)
      .map(doc => `${doc.title}: ${doc.content.substring(0, 300)}...`)
      .join('\n\n');

    const prompt = responseTemplate || `
Based on the following context from the knowledge base, provide a comprehensive answer to the user's query:

Query: ${query}

Context:
${contextChunks}

Summary: ${ragResults.contextSummary}

Please provide a detailed, accurate response that leverages the provided context while being clear and actionable.
`;

    // This would typically call an LLM service
    // For now, return the structured context
    return `Based on ${ragResults.totalResults} relevant documents from the knowledge base:\n\n${ragResults.contextSummary}\n\nKey information:\n${contextChunks}`;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    try {
      // This would typically call an embedding service like OpenAI
      // For now, generate a mock embedding
      const mockEmbedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
      
      this.embeddingCache.set(text, mockEmbedding);
      return mockEmbedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      // Return zero embedding as fallback
      return new Array(1536).fill(0);
    }
  }

  private async calculateRelevanceScores(
    documents: any[],
    queryEmbedding: number[],
    threshold: number
  ): Promise<RAGDocument[]> {
    const scoredDocuments: RAGDocument[] = [];

    for (const doc of documents) {
      // Get document embedding
      const { data: embeddingData } = await supabase
        .from('knowledge_embeddings')
        .select('metadata')
        .eq('document_id', doc.id)
        .single();

      // Type assertion for metadata
      const metadata = embeddingData?.metadata as { embedding?: number[] } | null;
      const docEmbedding = metadata?.embedding || new Array(1536).fill(0);
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
      
      if (similarity >= threshold) {
        scoredDocuments.push({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          tags: doc.tags || [],
          metadata: {},
          relevanceScore: similarity
        });
      }
    }

    // Sort by relevance score
    return scoredDocuments.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async generateContextSummary(documents: RAGDocument[], query: string): Promise<string> {
    if (documents.length === 0) {
      return 'No relevant context found for the query.';
    }

    const topCategories = [...new Set(documents.map(d => d.category))].slice(0, 3);
    const avgRelevance = documents.reduce((sum, d) => sum + (d.relevanceScore || 0), 0) / documents.length;
    
    return `Found ${documents.length} relevant documents across ${topCategories.length} categories (${topCategories.join(', ')}). Average relevance score: ${avgRelevance.toFixed(2)}. Most relevant: "${documents[0]?.title}" (${(documents[0]?.relevanceScore || 0).toFixed(2)}).`;
  }

  async batchIndex(documents: Omit<RAGDocument, 'id' | 'vectorEmbedding'>[]): Promise<string[]> {
    console.log(`📚 RAG Database: Batch indexing ${documents.length} documents`);
    
    const results: string[] = [];
    
    for (const doc of documents) {
      try {
        const id = await this.indexDocument(doc);
        results.push(id);
      } catch (error) {
        console.error(`Failed to index document ${doc.title}:`, error);
      }
    }
    
    console.log(`✅ RAG Database: Batch indexing complete. ${results.length}/${documents.length} successful`);
    return results;
  }

  async getDocumentById(id: string): Promise<RAGDocument | null> {
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
      category: data.category,
      tags: data.tags || [],
      metadata: data.metadata || {}
    };
  }

  async updateDocument(id: string, updates: Partial<RAGDocument>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({
          title: updates.title,
          content: updates.content,
          category: updates.category,
          tags: updates.tags
        })
        .eq('id', id);

      if (error) throw error;

      // If content changed, regenerate embedding
      if (updates.content) {
        const embedding = await this.generateEmbedding(updates.content);
        await supabase
          .from('knowledge_embeddings')
          .update({
            chunk_text: updates.content,
            metadata: { ...updates.metadata, embedding }
          })
          .eq('document_id', id);
      }

      // Clear cache
      this.contextCache.clear();
      
      return true;
    } catch (error) {
      console.error('Failed to update document:', error);
      return false;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      // Delete embeddings first
      await supabase
        .from('knowledge_embeddings')
        .delete()
        .eq('document_id', id);

      // Delete main document
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear cache
      this.contextCache.clear();
      
      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }

  clearCache() {
    this.contextCache.clear();
    this.embeddingCache.clear();
    console.log('🧹 RAG Database: Cache cleared');
  }
}

export const ragDatabase = new RAGDatabaseCore();
