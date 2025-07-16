
import { DocumentChunk } from './types';
import { EmbeddingService } from './embeddingService';

export class ChunkingService {
  private chunkSize = 1000;
  private chunkOverlap = 200;
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async createChunks(documentId: string, content: string): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    const words = content.split(/\s+/);
    
    for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
      const chunkWords = words.slice(i, i + this.chunkSize);
      const chunkContent = chunkWords.join(' ');
      
      if (chunkContent.trim()) {
        const chunkId = crypto.randomUUID();
        const embeddings = await this.embeddingService.generateEmbeddings(chunkContent);
        
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

  generateContextualExplanation(query: string, content: string): string {
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
}
