
import { A2AAgent } from '../a2a/types';

export abstract class BaseAgent {
  protected agentData: A2AAgent;

  constructor(agentData: A2AAgent) {
    this.agentData = agentData;
  }

  get id(): string {
    return this.agentData.id;
  }

  get name(): string {
    return this.agentData.name;
  }

  get type(): string {
    return this.agentData.type;
  }

  get capabilities(): string[] {
    return this.agentData.capabilities;
  }

  get status(): A2AAgent['status'] {
    return this.agentData.status;
  }

  // Remove async from abstract method - implementations can be async
  abstract processTask(task: any): Promise<any>;

  async updateStatus(status: A2AAgent['status']): Promise<void> {
    this.agentData.status = status;
    this.agentData.lastActivity = new Date();
  }

  async canHandleTask(taskType: string): Promise<boolean> {
    return this.capabilities.includes(taskType);
  }
}
