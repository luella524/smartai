import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionLogProps {
  logs: string[];
  onClear: () => void;
  show: boolean;
  onClose: () => void;
}

const ActionLog: React.FC<ActionLogProps> = ({ logs, onClear, show, onClose }) => {
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    if (show) {
      setAnimateIn(true);
    }
  }, [show]);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => onClose(), 300);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 w-96 rounded-2xl shadow-xl border-0 z-50 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center justify-between p-4 border-b backdrop-blur-sm bg-white/60">
            <h3 className="font-medium flex items-center text-indigo-600">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              <span style={gradientTextStyle}>Activity Feed</span>
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClear}
                className="h-8 px-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200"
              >
                Clear
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-indigo-50 transition-all duration-200"
              >
                <X className="h-4 w-4 text-indigo-600" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-80 p-4">
            {logs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-4"
              >
                <Calendar className="h-12 w-12 mx-auto mb-4 text-indigo-300 opacity-60" />
                <p className="text-slate-500 font-medium">No calendar activities yet</p>
                <p className="text-sm text-slate-400 mt-2 max-w-[260px] mx-auto">
                  Try asking the AI to schedule, modify, or delete events
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    className="p-3 text-sm rounded-xl relative overflow-hidden"
                    style={{
                      background: getBackgroundColor(log),
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
                    }}
                  >
                    <div className="absolute top-0 left-0 h-full w-1" style={{ background: getAccentColor(log) }}></div>
                    <div className="flex items-start ml-2">
                      {getIcon(log)}
                      <div className="flex-1 ml-3">
                        <div className="font-medium text-gray-800">{getActionTitle(log)}</div>
                        <p className="text-gray-600 mt-1">{getFormattedDetails(log)}</p>
                      </div>
                    </div>
                    {log.includes('reschedule_calendar_event') && (
                      <div className="flex items-center mt-2 text-xs text-gray-500 ml-10">
                        <div className="flex items-center">
                          <span>{getOldDate(log)}</span>
                          <ArrowRight className="mx-2 h-3 w-3" />
                          <span className="text-indigo-600 font-medium">{getNewDate(log)}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add a CSS module or global styles to your main CSS file instead
// For now, let's inline the styles directly using regular classes
const gradientTextStyle = {
  background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 600
};

// Helper functions to parse and format log entries for better display
const getActionTitle = (log: string): string => {
  if (log.includes('reschedule_calendar_event')) return 'Rescheduled Event';
  if (log.includes('add_calendar_event') && log.includes('time block')) return 'New Time Block';
  if (log.includes('add_calendar_event')) return 'New Event';
  if (log.includes('edit_calendar_event')) return 'Updated Event';
  if (log.includes('delete_calendar_event')) return 'Removed Event';
  return 'Calendar Action';
};

const getFormattedDetails = (log: string): string => {
  // Remove the "Action: xxxx" prefix
  let details = log.replace(/^Action: [a-z_]+/, '').trim();
  
  // Remove redundant ID information
  details = details.replace(/\s-\s(Added|Updated|Deleted|Modified)/, '$1');
  details = details.replace(/task \d+:/, '');
  details = details.replace(/time block \d+:/, '');
  
  // Clean up JSON formatting
  details = details.replace(/\{|\}|\"/g, '');
  
  return details;
};

const getOldDate = (log: string): string => {
  const match = log.match(/from ([^"]+)( at [^"]+)? to/);
  return match ? match[1] + (match[2] || '') : '';
};

const getNewDate = (log: string): string => {
  const match = log.match(/to ([^"]+)( at [^"]+)?$/);
  return match ? match[1] + (match[2] || '') : '';
};

const getBackgroundColor = (log: string): string => {
  if (log.includes('reschedule_calendar_event')) return 'rgba(224, 231, 255, 0.5)'; // Indigo light
  if (log.includes('add_calendar_event')) return 'rgba(220, 252, 231, 0.5)'; // Green light
  if (log.includes('edit_calendar_event')) return 'rgba(219, 234, 254, 0.5)'; // Blue light
  if (log.includes('delete_calendar_event')) return 'rgba(254, 226, 226, 0.5)'; // Red light
  if (log.includes('Could not')) return 'rgba(254, 242, 242, 0.5)'; // Red lighter
  return 'rgba(241, 245, 249, 0.5)'; // Slate light
};

const getAccentColor = (log: string): string => {
  if (log.includes('reschedule_calendar_event')) return '#818cf8'; // Indigo
  if (log.includes('add_calendar_event')) return '#34d399'; // Green
  if (log.includes('edit_calendar_event')) return '#60a5fa'; // Blue
  if (log.includes('delete_calendar_event')) return '#f87171'; // Red
  if (log.includes('Could not')) return '#ef4444'; // Red darker
  return '#94a3b8'; // Slate
};

const getIcon = (log: string) => {
  if (log.includes('reschedule_calendar_event')) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Calendar className="h-4 w-4 text-indigo-600" />
        </motion.div>
      </div>
    );
  }
  
  if (log.includes('add_calendar_event')) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
        <motion.div
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </motion.div>
      </div>
    );
  }
  
  if (log.includes('edit_calendar_event')) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
        <motion.div whileHover={{ scale: 1.2 }}>
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
        </motion.div>
      </div>
    );
  }
  
  if (log.includes('delete_calendar_event')) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
        <X className="h-4 w-4 text-red-600" />
      </div>
    );
  }
  
  if (log.includes('Could not')) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
        <AlertCircle className="h-4 w-4 text-red-600" />
      </div>
    );
  }
  
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100">
      <Info className="h-4 w-4 text-slate-600" />
    </div>
  );
};

export default ActionLog; 