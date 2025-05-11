import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Sparkles, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator for assistant messages
  useEffect(() => {
    if (isLoading) {
      setIsTyping(true);
    } else {
      // Keep typing indicator for a bit after response comes in
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const gradientBorderStyle = {
    position: 'relative' as const,
    borderRadius: '1rem',
    padding: '1px',
    background: 'linear-gradient(90deg, #4338ca, #6366f1, #a855f7)',
    overflow: 'hidden' as const
  };

  const messageBubbleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div 
      style={gradientBorderStyle}
      className="flex flex-col h-full overflow-hidden shadow-lg"
    >
      <div className="bg-white dark:bg-gray-900 rounded-[0.95rem] flex flex-col h-full">
        <div className="flex items-center px-4 py-3 border-b dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-t-[0.95rem]">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <div className="relative">
              <Bot className="h-6 w-6 text-white mr-2" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
              />
            </div>
            <h3 className="text-lg font-bold text-white">AI Calendar Assistant</h3>
          </motion.div>
          <motion.div 
            className="ml-auto flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-white/20 text-white font-medium">
              <Zap className="h-3 w-3 inline mr-1" />
              AI Powered
            </span>
          </motion.div>
        </div>
        
        {/* Messages area */}
        <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Hey there! I'm your AI Calendar Assistant
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    Ask me to help manage your calendar by adding, removing, or editing events
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 max-w-[250px] mx-auto cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      "Schedule a meeting tomorrow at 2pm"
                    </div>
                    <div className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 max-w-[250px] mx-auto cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      "Move my dentist appointment to Friday"
                    </div>
                    <div className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 max-w-[250px] mx-auto cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      "What events do I have next week?"
                    </div>
                  </div>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={messageBubbleVariants}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200, 
                      damping: 20
                    }}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.role === 'assistant' ? (
                          <motion.div 
                            whileHover={{ rotate: 10 }}
                            className="flex items-center"
                          >
                            <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-1">
                              <Bot className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-xs font-medium">
                              Assistant
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div 
                            whileHover={{ rotate: -10 }}
                            className="flex items-center"
                          >
                            <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center mr-1">
                              <User className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-medium">
                              You
                            </span>
                          </motion.div>
                        )}
                        <span className="text-[10px] ml-auto opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm">
                    <div className="flex items-center mb-1">
                      <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-1">
                        <Bot className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-xs font-medium">
                        Assistant
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0 }}
                          className="w-2 h-2 rounded-full bg-indigo-400"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-indigo-500"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-indigo-600"
                        />
                      </div>
                      <span className="text-sm ml-2 text-gray-500 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input area */}
        <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-3 bg-white dark:bg-gray-900 rounded-b-[0.95rem]">
          <div className="flex gap-2 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 py-6 pl-4 pr-10 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            />
            
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
          <div className="text-xs text-center mt-2 text-gray-400">
            Powered by AI to help you manage your calendar efficiently
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox; 