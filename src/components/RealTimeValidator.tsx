
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  Trash2,
  Download
} from 'lucide-react';

interface ValidationResult {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  component?: string;
  duration?: number;
}

interface RealTimeValidatorProps {
  validations: ValidationResult[];
  onClear: () => void;
  onExport: () => void;
  maxEntries?: number;
}

export const RealTimeValidator: React.FC<RealTimeValidatorProps> = ({
  validations,
  onClear,
  onExport,
  maxEntries = 100
}) => {
  const [filteredValidations, setFilteredValidations] = useState<ValidationResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'warning' | 'info'>('all');

  useEffect(() => {
    console.log('🔍 Real-time validation update:', {
      totalValidations: validations.length,
      filter,
      timestamp: new Date().toISOString()
    });

    const filtered = validations
      .filter(v => filter === 'all' || v.type === filter)
      .slice(-maxEntries)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredValidations(filtered);

    // Log each validation to console
    validations.forEach(validation => {
      const emoji = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }[validation.type];

      console.log(`${emoji} Validation [${validation.component || 'System'}]:`, {
        message: validation.message,
        details: validation.details,
        duration: validation.duration,
        timestamp: validation.timestamp.toISOString()
      });
    });
  }, [validations, filter, maxEntries]);

  const getIcon = (type: ValidationResult['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeCounts = () => {
    return validations.reduce((counts, validation) => {
      counts[validation.type] = (counts[validation.type] || 0) + 1;
      return counts;
    }, {} as Record<ValidationResult['type'], number>);
  };

  const typeCounts = getTypeCounts();

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-white">Real-Time Validator</h3>
          <Badge variant="secondary" className="text-xs">
            {validations.length} entries
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onExport}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="text-slate-400 hover:text-red-400 h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-slate-800 border-b border-slate-700 px-4 py-2">
        {(['all', 'success', 'error', 'warning', 'info'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType !== 'all' && typeCounts[filterType] && (
              <span className="ml-1 text-xs opacity-75">
                ({typeCounts[filterType]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Validation List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredValidations.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No validations to display</p>
            </div>
          ) : (
            filteredValidations.map((validation) => (
              <div
                key={validation.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getIcon(validation.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {validation.message}
                        </span>
                        {validation.component && (
                          <Badge variant="outline" className="text-xs">
                            {validation.component}
                          </Badge>
                        )}
                      </div>
                      {validation.details && (
                        <p className="text-xs text-slate-400 mb-2">
                          {validation.details}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{validation.timestamp.toLocaleTimeString()}</span>
                        {validation.duration && (
                          <span>{validation.duration}ms</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="border-t border-slate-700 px-4 py-2 bg-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total: {validations.length}</span>
          <div className="flex items-center space-x-4">
            <span className="text-green-400">✓ {typeCounts.success || 0}</span>
            <span className="text-red-400">✗ {typeCounts.error || 0}</span>
            <span className="text-yellow-400">⚠ {typeCounts.warning || 0}</span>
            <span className="text-blue-400">ℹ {typeCounts.info || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
