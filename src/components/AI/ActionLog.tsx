import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActionLogProps {
  logs: string[];
  onClear: () => void;
  show: boolean;
  onClose: () => void;
}

const ActionLog: React.FC<ActionLogProps> = ({ logs, onClear, show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-card rounded-lg shadow-lg border z-50">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium flex items-center">
          <Info className="w-4 h-4 mr-2 text-primary" />
          AI Action Log
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="h-8 px-2"
          >
            Clear
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-64 p-3">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No actions performed yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className="p-2 text-sm border rounded-md"
              >
                {log.includes('Added') && (
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>{log}</p>
                  </div>
                )}
                {log.includes('Updated') && (
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>{log}</p>
                  </div>
                )}
                {log.includes('reschedule_calendar_event') && (
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>{log}</p>
                  </div>
                )}
                {log.includes('Deleted') && (
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>{log}</p>
                  </div>
                )}
                {log.includes('Could not') && (
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>{log}</p>
                  </div>
                )}
                {!log.includes('Added') && 
                  !log.includes('Updated') && 
                  !log.includes('Deleted') && 
                  !log.includes('Could not') &&
                  !log.includes('reschedule_calendar_event') && (
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" />
                    <p>{log}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ActionLog; 