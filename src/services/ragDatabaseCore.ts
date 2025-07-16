
import { supabase } from '@/integrations/supabase/client';

interface RAGDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embeddings?: number[];
  created_at: Date;
}

interface SearchOptions {
  limit?: number;
  includeMetadata?: boolean;
  threshold?: number;
}

interface SearchResult {
  document: RAGDocument;
  similarity: number;
}

class RAGDatabaseCore {
  private documents: Map<string, RAGDocument> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    console.log('📊 RAG Database: Initializing Retrieval-Augmented Generation system');
    
    try {
      // Load existing knowledge base entries
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('status', 'active')
        .limit(100);

      if (error) throw error;

      // Convert to RAG documents
      if (data) {
        for (const entry of data) {
          const document: RAGDocument = {
            id: entry.id,
            content: entry.content,
            metadata: {
              title: entry.title,
              category: entry.category,
              tags: entry.tags || [],
              source_type: entry.source_type
            },
            created_at: new Date(entry.created_at)
          };
          
          this.documents.set(document.id, document);
        }
      }

      this.isInitialized = true;
      console.log(`📊 RAG Database: Initialized with ${this.documents.size} documents`);
    } catch (error) {
      console.error('📊 RAG Database: Initialization failed:', error);
      throw error;
    }
  }

  async addDocument(content: string, metadata: Record<string, any> = {}): Promise<string> {
    await this.initialize();

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const document: RAGDocument = {
      id: documentId,
      content,
      metadata,
      created_at: new Date()
    };

    this.documents.set(documentId, document);

    // Store in Supabase knowledge base
    try {
      await supabase
        .from('knowledge_base')
        .insert({
          id: documentId,
          user_id: 'system',
          title: metadata.title || 'Untitled',
          content,
          category: metadata.category || 'general',
          tags: metadata.tags || [],
          source_type: metadata.source_type || 'system'
        });
    } catch (error) {
      console.warn('📊 RAG Database: Failed to persist document:', error);
    }

    console.log(`📊 RAG Database: Added document ${documentId}`);
    return documentId;
  }

  async searchSimilar(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    await this.initialize();

    const {
      limit = 5,
      includeMetadata = true,
      threshold = 0.1
    } = options;

    // Simple text-based similarity for now (in production, use vector embeddings)
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const document of this.documents.values()) {
      const contentLower = document.content.toLowerCase();
      
      // Calculate simple similarity based on keyword matches
      const queryWords = queryLower.split(/\s+/);
      const contentWords = contentLower.split(/\s+/);
      
      let matches = 0;
      for (const word of queryWords) {
        if (contentWords.some(contentWord => contentWord.includes(word))) {
          matches++;
        }
      }
      
      const similarity = matches / queryWords.length;
      
      if (similarity >= threshold) {
        results.push({
          document: includeMetadata ? document : { ...document, metadata: {} },
          similarity
        });
      }
    }

    // Sort by similarity and limit results
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  async getDocument(documentId: string): Promise<RAGDocument | undefined> {
    await this.initialize();
    return this.documents.get(documentId);
  }

  async updateDocument(documentId: string, content: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.initialize();

    const document = this.documents.get(documentId);
    if (document) {
      document.content = content;
      document.metadata = { ...document.metadata, ...metadata };
      this.documents.set(documentId, document);

      // Update in Supabase
      try {
        await supabase
          .from('knowledge_base')
          .update({
            content,
            title: metadata.title || document.metadata.title,
            category: metadata.category || document.metadata.category,
            tags: metadata.tags || document.metadata.tags
          })
          .eq('id', documentId);
      } catch (error) {
        console.warn('📊 RAG Database: Failed to update document:', error);
      }
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.initialize();
    
    this.documents.delete(documentId);
    
    // Delete from Supabase
    try {
      await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', documentId);
    } catch (error) {
      console.warn('📊 RAG Database: Failed to delete document:', error);
    }
  }

  getDocumentCount(): number {
    return this.documents.size;
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    return this.searchSimilar(query, options);
  }
}

export const ragDatabase = new RAGDatabaseCore();
