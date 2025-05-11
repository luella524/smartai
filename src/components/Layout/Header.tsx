import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, ClipboardList, Bug } from 'lucide-react';

interface HeaderProps {
  date: string;
  onGenerateSuggestions: () => void;
  isGenerating: boolean;
  showActionLog?: boolean;
  onToggleActionLog?: () => void;
  onDebugContext?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  date, 
  onGenerateSuggestions, 
  isGenerating,
  showActionLog = false,
  onToggleActionLog,
  onDebugContext
}) => {
  return (
    <header className="flex items-center justify-between p-4 bg-card shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">SmartDay</h1>
        <p className="text-muted-foreground">{date}</p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onGenerateSuggestions}
          disabled={isGenerating}
          className="bg-accent hover:bg-accent/90"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? 'Thinking...' : 'Get AI Suggestions'}
        </Button>
        <Button
          variant="outline"
          className="flex items-center"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Chat with AI
        </Button>
        {onToggleActionLog && (
          <Button
            variant={showActionLog ? "default" : "outline"}
            className="flex items-center"
            onClick={onToggleActionLog}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Action Log
          </Button>
        )}
        {onDebugContext && (
          <Button
            variant="outline"
            className="flex items-center"
            onClick={onDebugContext}
          >
            <Bug className="mr-2 h-4 w-4 text-amber-500" />
            Debug
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
