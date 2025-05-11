import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageCircle, ClipboardList, Bug, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const headerGradient = {
    background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const logoGradient = {
    background: 'linear-gradient(90deg, #4338ca, #6366f1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-between p-4 shadow-md border-b bg-opacity-90 backdrop-blur-md rounded-b-xl sticky top-0 z-10"
      style={headerGradient}
    >
      <div className="flex items-center">
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="mr-3 p-2 bg-white rounded-full shadow-sm"
        >
          <Calendar className="h-7 w-7 text-indigo-600" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold" style={logoGradient}>SmartDay</h1>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={onGenerateSuggestions}
            disabled={isGenerating}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 rounded-full px-4 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isGenerating ? (
              <span className="flex items-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                </motion.div>
                Thinking...
              </span>
            ) : 'Get AI Ideas'}
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="flex items-center rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white shadow-sm"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat with AI
          </Button>
        </motion.div>
        
        {onToggleActionLog && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={showActionLog ? "default" : "outline"}
              className={`flex items-center rounded-full shadow-sm ${
                showActionLog 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              }`}
              onClick={onToggleActionLog}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Activity
            </Button>
          </motion.div>
        )}
        
        {onDebugContext && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="flex items-center rounded-full border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white shadow-sm"
              onClick={onDebugContext}
            >
              <Bug className="mr-2 h-4 w-4 text-amber-500" />
              Debug
            </Button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
