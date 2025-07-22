
import React from 'react';
import { LiveCodeExecutor } from '@/components/code/LiveCodeExecutor';

export const CodeExecutorPage: React.FC = () => {
  return (
    <div className="h-screen">
      <LiveCodeExecutor />
    </div>
  );
};
