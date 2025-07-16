
import { MultiAgentSession, AgentCoordinationEvent } from './coordinationTypes';
import { a2aProtocol } from '../a2aProtocolCore';

export class SessionManager {
  private activeSessions: Map<string, MultiAgentSession> = new Map();

  async createMultiAgentSession(
    participants: string[], 
    mode: 'sequential' | 'parallel' | 'hierarchical'
  ): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: MultiAgentSession = {
      id: sessionId,
      participants,
      coordination_mode: mode,
      shared_context: {
        created_by: 'orchestrator',
        session_goals: [],
        resource_pool: {},
        communication_protocol: 'a2a_standard'
      },
      active_tasks: [],
      started_at: new Date(),
      status: 'active'
    };

    this.activeSessions.set(sessionId, session);

    // Notify all participants about the new session
    for (const participantId of participants) {
      await this.sendCoordinationEvent({
        type: 'collaboration',
        source_agent: 'orchestrator',
        target_agent: participantId,
        payload: {
          action: 'session_created',
          session_id: sessionId,
          mode: mode,
          participants: participants.filter(p => p !== participantId)
        },
        priority: 'medium'
      });
    }

    console.log(`🤝 Multi-agent session created: ${sessionId} with ${participants.length} participants`);
    return sessionId;
  }

  private async sendCoordinationEvent(eventData: Omit<AgentCoordinationEvent, 'id' | 'timestamp'>): Promise<void> {
    if (eventData.target_agent) {
      await a2aProtocol.sendMessage({
        fromAgent: eventData.source_agent,
        toAgent: eventData.target_agent,
        type: 'coordination',
        content: eventData.payload,
        priority: eventData.priority === 'high' ? 'high' : 'medium'
      });
    }
  }

  async pauseSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'paused';
      console.log(`⏸️ Session ${sessionId} paused`);
    }
  }

  async resumeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'active';
      console.log(`▶️ Session ${sessionId} resumed`);
    }
  }

  getActiveSessions(): MultiAgentSession[] {
    return Array.from(this.activeSessions.values());
  }
}
