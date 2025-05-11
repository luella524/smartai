import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Bug } from 'lucide-react';

interface ContextDebuggerProps {
  context: string;
  show: boolean;
  onClose: () => void;
}

const ContextDebugger: React.FC<ContextDebuggerProps> = ({ 
  context, 
  show, 
  onClose 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium flex items-center">
            <Bug className="w-4 h-4 mr-2 text-amber-500" />
            AI Context Debugger
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap font-mono text-sm">
            {context}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ContextDebugger; 