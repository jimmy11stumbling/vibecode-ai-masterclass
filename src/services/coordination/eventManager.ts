
import { AgentCoordinationEvent } from './coordinationTypes';
import { A2AMessage } from '../a2a/types';
import { a2aProtocol } from '../a2aProtocolCore';
import { SovereignTask } from '../orchestrator/types';

export class EventManager {
  private coordinationEvents: AgentCoordinationEvent[] = [];
  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

  async sendCoordinationEvent(eventData: Omit<AgentCoordinationEvent, 'id' | 'timestamp'>): Promise<string> {
    const event: AgentCoordinationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...eventData,
      timestamp: new Date()
    };

    this.coordinationEvents.push(event);

    // Send via A2A protocol if target agent specified
    if (event.target_agent) {
      await a2aProtocol.sendMessage({
        fromAgent: event.source_agent,
        toAgent: event.target_agent,
        type: 'coordination',
        content: event.payload,
        priority: event.priority === 'high' ? 'high' : 'medium'
      });
    }

    // Emit to listeners
    this.emitEvent('coordination_event', event);

    return event.id;
  }

  async processCoordinationEvents() {
    // Get recent A2A messages
    const recentMessages = a2aProtocol.getMessageHistory().slice(-10);
    
    for (const message of recentMessages) {
      if (message.type === 'coordination') {
        await this.handleCoordinationMessage(message);
      }
    }
  }

  private async handleCoordinationMessage(message: A2AMessage) {
    console.log(`🎯 Processing coordination message from ${message.fromAgent} to ${message.toAgent}`);
    
    // Handle different coordination message types
    switch (message.content?.action) {
      case 'status_update':
        await this.handleStatusUpdate(message);
        break;
      case 'resource_request':
        await this.handleResourceRequest(message);
        break;
      case 'task_completion':
        await this.handleTaskCompletion(message);
        break;
      case 'error_report':
        await this.handleErrorReport(message);
        break;
    }
  }

  private async handleStatusUpdate(message: A2AMessage) {
    const { task_id, status, progress } = message.content;
    
    // Update task status in coordination system
    this.emitEvent('task_status_update', {
      task_id,
      status,
      progress,
      agent_id: message.fromAgent,
      timestamp: message.timestamp
    });
  }

  private async handleResourceRequest(message: A2AMessage) {
    const { resource_type, required_capabilities } = message.content;
    
    // Find available agents with required capabilities
    const availableAgents = a2aProtocol.getAllAgents().filter(agent =>
      agent.status === 'active' && 
      required_capabilities.some(cap => agent.capabilities.includes(cap))
    );

    // Send response back to requesting agent
    await a2aProtocol.sendMessage({
      fromAgent: 'orchestrator',
      toAgent: message.fromAgent,
      type: 'response',
      content: {
        request_id: message.id,
        available_resources: availableAgents.map(a => ({
          agent_id: a.id,
          capabilities: a.capabilities,
          status: a.status
        }))
      }
    });
  }

  private async handleTaskCompletion(message: A2AMessage) {
    const { task_id, result, execution_time } = message.content;
    
    // Update workflow coordination
    this.emitEvent('workflow_progress', {
      task_id,
      status: 'completed',
      result,
      execution_time,
      timestamp: new Date()
    });
  }

  private async handleErrorReport(message: A2AMessage) {
    const { error_type, error_details, task_id } = message.content;
    
    console.error(`❌ Agent ${message.fromAgent} reported error:`, error_details);
    
    // Implement error recovery strategies
    await this.implementErrorRecovery(task_id, error_type, error_details);
  }

  private async implementErrorRecovery(taskId: string, errorType: string, errorDetails: any) {
    const recoveryStrategies = {
      'agent_unavailable': 'reassign_to_backup_agent',
      'resource_exhausted': 'queue_for_retry',
      'validation_failed': 'rollback_and_fix',
      'timeout': 'extend_deadline_or_simplify'
    };

    const strategy = recoveryStrategies[errorType] || 'escalate_to_human';
    console.log(`🔧 Implementing recovery strategy: ${strategy} for task ${taskId}`);
  }

  // Event management
  addEventListener(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  removeEventListener(event: string, listener: (data: any) => void): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        this.eventListeners.set(event, listeners.filter(l => l !== listener));
      }
    }
  }

  emitEvent(event: string, data: any): void {
    this.eventListeners.get(event)?.forEach(listener => listener(data));
  }

  getCoordinationEvents(limit: number = 50): AgentCoordinationEvent[] {
    return this.coordinationEvents.slice(-limit);
  }
}
