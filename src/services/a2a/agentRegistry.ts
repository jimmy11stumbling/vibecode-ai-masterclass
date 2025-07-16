
import { A2AAgent } from './types';

export class AgentRegistry {
  private agents: Map<string, A2AAgent> = new Map();

  async registerAgent(agentData: Omit<A2AAgent, 'id' | 'lastActivity'>): Promise<string> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agent: A2AAgent = {
      id: agentId,
      ...agentData,
      lastActivity: new Date()
    };

    this.agents.set(agentId, agent);
    
    console.log(`🤝 A2A Protocol: Registered ${agent.role} - ${agent.name} (${agentId})`);
    return agentId;
  }

  getAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): A2AAgent | undefined {
    return this.agents.get(agentId);
  }

  async updateAgentStatus(agentId: string, status: A2AAgent['status']): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
      this.agents.set(agentId, agent);
    }
  }

  async initializeDefaultAgents(): Promise<void> {
    // Register the Sovereign AI Development Environment agents
    await this.registerAgent({
      name: 'Orchestrator Agent',
      type: 'orchestrator',
      role: '🧠 Project Manager',
      description: 'The project manager. Receives user prompts, uses DeepSeek for high-level reasoning to decompose goals into task trees, and assigns tasks to other agents via A2A.',
      capabilities: [
        'task_decomposition', 
        'deepseek_reasoning', 
        'project_management', 
        'task_assignment', 
        'priority_scheduling',
        'workflow_orchestration'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Architect Agent',
      type: 'architect',
      role: '🏗️ System Designer',
      description: 'Designs application structure. Creates file/folder layouts, defines database schemas, and outlines API contracts.',
      capabilities: [
        'system_architecture', 
        'database_design', 
        'api_contracts', 
        'file_structure_design',
        'schema_creation',
        'component_planning'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Frontend Builder Agent',
      type: 'frontend_builder',
      role: '🛠️ Frontend Coder',
      description: 'Specialized coder for frontend development. Writes, modifies, and deletes React/TypeScript code based on architectural specs.',
      capabilities: [
        'react_development', 
        'typescript_coding', 
        'component_creation', 
        'ui_implementation',
        'frontend_logic',
        'styling_implementation'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Backend Builder Agent',
      type: 'backend_builder',
      role: '🛠️ Backend Coder',
      description: 'Specialized coder for backend development. Creates APIs, database operations, and server-side logic.',
      capabilities: [
        'api_development', 
        'database_operations', 
        'server_logic', 
        'authentication_systems',
        'backend_integration',
        'supabase_integration'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Validator Agent',
      type: 'validator',
      role: '🔎 Quality Assurance Expert',
      description: 'The QA expert. Runs linters, type-checkers, unit tests, and validates code against requirements. Checks for build errors.',
      capabilities: [
        'code_validation', 
        'linting', 
        'type_checking', 
        'unit_testing',
        'build_validation',
        'error_detection'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Optimizer Agent',
      type: 'optimizer',
      role: '✨ Refactoring Specialist',
      description: 'Reviews code for performance improvements, better readability, and security vulnerabilities.',
      capabilities: [
        'performance_optimization', 
        'code_refactoring', 
        'security_analysis', 
        'readability_improvement',
        'best_practices_enforcement',
        'vulnerability_detection'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Librarian Agent',
      type: 'librarian',
      role: '📚 Knowledge Manager',
      description: 'Manages the RAG knowledge base. Ingests new documentation and provides relevant context to other agents when requested.',
      capabilities: [
        'knowledge_management', 
        'rag_operations', 
        'documentation_analysis', 
        'context_provision',
        'information_retrieval',
        'learning_coordination'
      ],
      status: 'active'
    });
  }
}
