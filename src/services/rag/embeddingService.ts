
export class EmbeddingService {
  private embeddingModel = 'text-embedding-3-small';

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      // In production, this would call OpenAI or similar service
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

  calculateTextSimilarity(query: string, text: string): number {
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word of textWords) {
      if (queryWords.has(word)) matches++;
    }
    
    return matches / Math.max(queryWords.size, textWords.length);
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
}
