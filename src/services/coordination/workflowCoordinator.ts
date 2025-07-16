
import { WorkflowCoordination, AgentCoordinationEvent } from './coordinationTypes';
import { SovereignTask } from '../orchestrator/types';
import { A2AAgent } from '../a2a/types';
import { a2aProtocol } from '../a2aProtocolCore';

export class WorkflowCoordinator {
  private workflowCoordinations: Map<string, WorkflowCoordination> = new Map();

  async coordinateWorkflow(
    tasks: SovereignTask[], 
    strategy: 'centralized' | 'distributed' | 'hybrid'
  ): Promise<string> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Analyze task dependencies
    const dependencyGraph = this.analyzeDependencies(tasks);
    
    // Create agent assignments based on capabilities and load
    const agentAssignments = await this.optimizeAgentAssignments(tasks);
    
    // Create execution plan
    const executionPlan = this.createExecutionPlan(tasks, dependencyGraph, strategy);
    
    const coordination: WorkflowCoordination = {
      workflow_id: workflowId,
      execution_plan: executionPlan,
      agent_assignments: agentAssignments,
      dependency_graph: dependencyGraph,
      coordination_strategy: strategy,
      conflict_resolution: 'orchestrator_decides'
    };

    this.workflowCoordinations.set(workflowId, coordination);

    // Initiate workflow execution
    await this.initiateWorkflowExecution(coordination);

    console.log(`🚀 Workflow coordination initiated: ${workflowId} (${strategy} strategy)`);
    return workflowId;
  }

  private analyzeDependencies(tasks: SovereignTask[]): Map<string, string[]> {
    const dependencyGraph = new Map<string, string[]>();
    
    tasks.forEach(task => {
      const dependencies = task.dependencies || [];
      dependencyGraph.set(task.id, dependencies);
    });

    return dependencyGraph;
  }

  private async optimizeAgentAssignments(tasks: SovereignTask[]): Promise<Map<string, string[]>> {
    const assignments = new Map<string, string[]>();
    const agents = a2aProtocol.getAllAgents();

    // Get current agent loads
    const agentLoads = new Map<string, number>();
    agents.forEach(agent => {
      agentLoads.set(agent.id, 0); // Would normally get actual load
    });

    // Assign tasks using optimization algorithm
    for (const task of tasks) {
      const optimalAgent = await this.findOptimalAgentForTask(task, agentLoads);
      
      if (optimalAgent) {
        if (!assignments.has(optimalAgent.id)) {
          assignments.set(optimalAgent.id, []);
        }
        assignments.get(optimalAgent.id)!.push(task.id);
        agentLoads.set(optimalAgent.id, (agentLoads.get(optimalAgent.id) || 0) + 1);
      }
    }

    return assignments;
  }

  private async findOptimalAgentForTask(task: SovereignTask, currentLoads: Map<string, number>): Promise<A2AAgent | null> {
    const agents = a2aProtocol.getAllAgents();
    
    // Score agents based on capability match, current load, and performance
    const scoredAgents = agents.map(agent => {
      let score = 0;
      
      // Capability match
      if (this.agentHasCapabilityForTask(agent, task)) {
        score += 50;
      }
      
      // Load balancing (prefer less loaded agents)
      const currentLoad = currentLoads.get(agent.id) || 0;
      score += Math.max(0, 30 - (currentLoad * 5));
      
      // Agent status
      if (agent.status === 'active') score += 20;
      
      return { agent, score };
    });

    // Return the highest scoring agent
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0]?.agent || null;
  }

  private agentHasCapabilityForTask(agent: A2AAgent, task: SovereignTask): boolean {
    const taskTypeCapabilities = {
      'architecture': ['system_architecture', 'database_design', 'api_contracts'],
      'frontend': ['react_development', 'ui_implementation', 'component_creation'],
      'backend': ['api_development', 'database_operations', 'server_logic'],
      'integration': ['api_integration', 'service_integration', 'mcp_tools'],
      'validation': ['code_validation', 'testing', 'quality_assurance']
    };

    const requiredCapabilities = taskTypeCapabilities[task.type] || [];
    return requiredCapabilities.some(capability => 
      agent.capabilities.includes(capability)
    );
  }

  private createExecutionPlan(tasks: SovereignTask[], dependencies: Map<string, string[]>, strategy: string) {
    return {
      strategy: strategy,
      phases: this.identifyExecutionPhases(tasks, dependencies),
      synchronization_points: this.identifySynchronizationPoints(tasks, dependencies),
      rollback_strategy: 'checkpoint_based',
      monitoring: {
        progress_tracking: true,
        performance_metrics: true,
        bottleneck_detection: true
      }
    };
  }

  private identifyExecutionPhases(tasks: SovereignTask[], dependencies: Map<string, string[]>) {
    // Group tasks into execution phases based on dependencies
    const phases: string[][] = [];
    const processed = new Set<string>();
    
    while (processed.size < tasks.length) {
      const currentPhase: string[] = [];
      
      for (const task of tasks) {
        if (processed.has(task.id)) continue;
        
        const taskDependencies = dependencies.get(task.id) || [];
        const dependenciesMet = taskDependencies.every(dep => processed.has(dep));
        
        if (dependenciesMet) {
          currentPhase.push(task.id);
        }
      }
      
      if (currentPhase.length === 0) break; // Circular dependency or error
      
      phases.push(currentPhase);
      currentPhase.forEach(taskId => processed.add(taskId));
    }

    return phases;
  }

  private identifySynchronizationPoints(tasks: SovereignTask[], dependencies: Map<string, string[]>) {
    // Identify points where multiple agents need to synchronize
    const syncPoints: string[] = [];
    
    tasks.forEach(task => {
      const dependents = tasks.filter(t => 
        (t.dependencies || []).includes(task.id)
      );
      
      if (dependents.length > 1) {
        syncPoints.push(task.id);
      }
    });

    return syncPoints;
  }

  private async initiateWorkflowExecution(coordination: WorkflowCoordination) {
    // Send execution plan to all participating agents
    for (const [agentId, taskIds] of coordination.agent_assignments) {
      await a2aProtocol.sendMessage({
        fromAgent: 'orchestrator',
        toAgent: agentId,
        type: 'coordination',
        content: {
          workflow_id: coordination.workflow_id,
          assigned_tasks: taskIds,
          execution_plan: coordination.execution_plan,
          coordination_strategy: coordination.coordination_strategy
        },
        priority: 'high'
      });
    }
  }

  getWorkflowCoordinations(): WorkflowCoordination[] {
    return Array.from(this.workflowCoordinations.values());
  }
}
