
import { RAGServiceCore } from './rag/ragServiceCore';

// Export the main service for backward compatibility
export const ragService = new RAGServiceCore();

// Re-export types for convenience
export type {
  KnowledgeChunk,
  SearchResult,
  RAGQueryOptions
} from './rag/ragServiceCore';
