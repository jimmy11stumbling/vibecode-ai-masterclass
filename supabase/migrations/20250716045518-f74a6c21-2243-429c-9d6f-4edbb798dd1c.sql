
-- Create sovereign_tasks table for task management
CREATE TABLE public.sovereign_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  execution_id TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_agent UUID REFERENCES public.agents,
  result JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_specs table for storing project specifications
CREATE TABLE public.project_specs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  execution_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_capabilities table for storing agent capabilities
CREATE TABLE public.agent_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents NOT NULL,
  capability_name TEXT NOT NULL,
  capability_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security policies
ALTER TABLE public.sovereign_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_capabilities ENABLE ROW LEVEL SECURITY;

-- Policies for sovereign_tasks
CREATE POLICY "Users can view their own sovereign tasks" 
  ON public.sovereign_tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sovereign tasks" 
  ON public.sovereign_tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sovereign tasks" 
  ON public.sovereign_tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sovereign tasks" 
  ON public.sovereign_tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for project_specs
CREATE POLICY "Users can view their own project specs" 
  ON public.project_specs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project specs" 
  ON public.project_specs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project specs" 
  ON public.project_specs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project specs" 
  ON public.project_specs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for agent_capabilities
CREATE POLICY "Anyone can view agent capabilities" 
  ON public.agent_capabilities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage agent capabilities" 
  ON public.agent_capabilities 
  FOR ALL 
  USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_sovereign_tasks_updated_at
  BEFORE UPDATE ON public.sovereign_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_specs_updated_at
  BEFORE UPDATE ON public.project_specs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
