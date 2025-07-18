
-- Add missing columns to sovereign_tasks table
ALTER TABLE sovereign_tasks 
ADD COLUMN IF NOT EXISTS dependencies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 300000,
ADD COLUMN IF NOT EXISTS assigned_agent TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Create index on dependencies for better query performance
CREATE INDEX IF NOT EXISTS idx_sovereign_tasks_dependencies ON sovereign_tasks USING GIN (dependencies);
