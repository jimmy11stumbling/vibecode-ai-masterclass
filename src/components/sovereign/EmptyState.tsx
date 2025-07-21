
import { Crown, AlertCircle, Zap } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Ready for Autonomous Development</h3>
        <p className="text-slate-400 mb-4">
          Describe your project and let the Sovereign AI system handle the entire development process.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>AI-Powered Architecture</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Multi-Agent Coordination</span>
          </div>
        </div>
      </div>
    </div>
  );
};
