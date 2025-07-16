
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
