
import { MCPMessage, MCPAgent } from './types';

export class MessageProcessor {
  private messageQueue: MCPMessage[] = [];

  constructor() {
    this.startMessageProcessor();
  }

  private startMessageProcessor() {
    setInterval(() => {
      this.processMessageQueue();
    }, 100);
  }

  private async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.handleMessage(message);
      }
    }
  }

  private async handleMessage(message: MCPMessage) {
    // Message processing logic will be implemented here
    console.log(`Processing message: ${message.id}`);
  }

  addToQueue(message: MCPMessage) {
    this.messageQueue.push(message);
  }

  getQueueLength(): number {
    return this.messageQueue.length;
  }
}
