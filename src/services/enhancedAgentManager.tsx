
import { sovereignOrchestrator } from './sovereignOrchestrator';
import type { SovereignTask, WorkflowExecution } from './sovereignOrchestrator';
import { a2aProtocol, A2AAgent, A2AMessage } from './a2aProtocolCore';
import { advancedMCPIntegration } from './advancedMCPIntegration';
import { 
  SessionManager, 
  WorkflowCoordinator, 
  EventManager, 
  MetricsCalculator,
  AgentCoordinationEvent,
  MultiAgentSession,
  WorkflowCoordination,
  CoordinationMetrics
} from './coordination';

export class EnhancedAgentManager {
  private sessionManager: SessionManager;
  private workflowCoordinator: WorkflowCoordinator;
  private eventManager: EventManager;
  private metricsCalculator: MetricsCalculator;

  constructor() {
    this.sessionManager = new SessionManager();
    this.workflowCoordinator = new WorkflowCoordinator();
    this.eventManager = new EventManager();
    this.metricsCalculator = new MetricsCalculator();
    this.initializeCoordination();
  }

  private async initializeCoordination() {
    console.log('🎯 Initializing Enhanced Agent Coordination');
    
    this.subscribeToA2AEvents();
    
    console.log('✅ Enhanced Agent Manager initialized');
  }

  private subscribeToA2AEvents() {
    setInterval(() => {
      this.eventManager.processCoordinationEvents();
    }, 5000);
  }

  async createMultiAgentSession(participants: string[], mode: 'sequential' | 'parallel' | 'hierarchical'): Promise<string> {
    return await this.sessionManager.createMultiAgentSession(participants, mode);
  }

  async coordinateWorkflow(tasks: SovereignTask[], strategy: 'centralized' | 'distributed' | 'hybrid'): Promise<string> {
    return await this.workflowCoordinator.coordinateWorkflow(tasks, strategy);
  }

  async sendCoordinationEvent(eventData: Omit<AgentCoordinationEvent, 'id' | 'timestamp'>): Promise<string> {
    return await this.eventManager.sendCoordinationEvent(eventData);
  }

  addEventListener(event: string, listener: (data: any) => void): void {
    this.eventManager.addEventListener(event, listener);
  }

  removeEventListener(event: string, listener: (data: any) => void): void {
    this.eventManager.removeEventListener(event, listener);
  }

  async pauseSession(sessionId: string): Promise<void> {
    await this.sessionManager.pauseSession(sessionId);
  }

  async resumeSession(sessionId: string): Promise<void> {
    await this.sessionManager.resumeSession(sessionId);
  }

  getActiveSessions(): MultiAgentSession[] {
    return this.sessionManager.getActiveSessions();
  }

  getWorkflowCoordinations(): WorkflowCoordination[] {
    return this.workflowCoordinator.getWorkflowCoordinations();
  }

  getCoordinationEvents(limit: number = 50): AgentCoordinationEvent[] {
    return this.eventManager.getCoordinationEvents(limit);
  }

  getAgentWorkload(agentId: string): number {
    const workflowCoordinations = new Map();
    this.workflowCoordinator.getWorkflowCoordinations().forEach(wc => {
      workflowCoordinations.set(wc.workflow_id, wc);
    });
    return this.metricsCalculator.getAgentWorkload(agentId, workflowCoordinations);
  }

  getSystemMetrics(): CoordinationMetrics {
    return this.metricsCalculator.calculateSystemMetrics(
      this.sessionManager.getActiveSessions().length,
      this.workflowCoordinator.getWorkflowCoordinations().length,
      this.eventManager.getCoordinationEvents().length
    );
  }
}

export const enhancedAgentManager = new EnhancedAgentManager();
