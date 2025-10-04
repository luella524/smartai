import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2, Sparkles, Zap, Calendar, Clock, Sun, Moon, Star, Wand2 } from 'lucide-react';
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
  actionLog?: string[];
  onClearActionLog?: () => void;
  lastSystemContext?: string;
}

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.5 + 0.5 
          }}
          animate={{ 
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: Math.random() * 20 + 15, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        >
          {i % 5 === 0 ? (
            <Calendar className="text-indigo-500 h-5 w-5" />
          ) : i % 5 === 1 ? (
            <Clock className="text-purple-500 h-4 w-4" />
          ) : i % 5 === 2 ? (
            <Star className="text-yellow-500 h-3 w-3" />
          ) : i % 5 === 3 ? (
            <Wand2 className="text-pink-500 h-5 w-5" />
          ) : (
            <Sparkles className="text-cyan-500 h-4 w-4" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  isLoading,
  onSendMessage,
  actionLog = [],
  onClearActionLog,
  lastSystemContext = ''
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const suggestionMessages = [
    "Schedule a meeting tomorrow at 2pm",
    "Move my dentist appointment to Friday",
    "What events do I have next week?"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
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

  // Hide welcome animation after 3 seconds
  useEffect(() => {
    if (showWelcomeAnimation) {
      const timer = setTimeout(() => {
        setShowWelcomeAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeAnimation]);

  const messageBubbleVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden relative bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 dark:from-indigo-950/90 dark:via-purple-950/95 dark:to-pink-950/90 backdrop-blur-xl border-2 border-indigo-200/50 dark:border-indigo-700/50 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-100/30 dark:ring-indigo-800/30">
      {showWelcomeAnimation && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2.5, delay: 0.5 }}
          onAnimationComplete={() => setShowWelcomeAnimation(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, times: [0, 0.2, 0.5, 1] }}
              className="relative"
            >
              <Calendar className="h-20 w-20 text-white drop-shadow-lg" />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: 1,
                  repeatType: "reverse"
                }}
                className="absolute top-0 right-0"
              >
                <Sparkles className="h-8 w-8 text-yellow-300 drop-shadow-lg" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      <FloatingElements />
      
      <div className="px-3 py-2 border-b border-indigo-200/30 dark:border-indigo-700/30 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjUsMzAgTDc1LDMwIE01MCwzMCBMNTAsNzAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-30" />
        
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex items-center relative"
        >
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            transition={{ duration: 1 }}
            className="mr-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-white/20"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 20, 
                ease: "linear", 
                repeat: Infinity 
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-[3px] opacity-60" />
              <Calendar className="h-5 w-5 text-indigo-600 relative z-10 drop-shadow-sm" />
            </motion.div>
          </motion.div>
          
          <div className="flex-1">
            <motion.h3 
              className="text-sm font-bold text-white drop-shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Lisa AI - Your Personal AI Assistant
              {!import.meta.env.VITE_OPENAI_API_KEY?.startsWith('sk-') && (
                <span className="ml-2 text-yellow-300 text-xs">(Demo Mode)</span>
              )}
            </motion.h3>
          </div>
        </motion.div>
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 md:px-6 py-4 md:py-6 bg-gradient-to-b from-white/60 via-white/80 to-slate-50/60 dark:from-gray-800/60 dark:via-gray-800/80 dark:to-gray-900/60 backdrop-blur-sm">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-2"
              >
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 relative"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 blur-[20px] opacity-40" />
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center relative border border-indigo-200/50 dark:border-indigo-700/50 shadow-lg">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400 drop-shadow-sm" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.h3 
                  className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  👋 Hey there! I'm Lisa
                </motion.h3>
                
                <motion.p 
                  className="text-sm text-gray-600 dark:text-gray-300 max-w-xs mx-auto font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Your AI Calendar Assistant. I can help you manage your schedule by adding, removing, or editing events.
                </motion.p>
                
                <motion.div
                  className="mt-6 md:mt-8 space-y-2.5 md:space-y-3 max-w-[280px] md:max-w-[320px] mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {suggestionMessages.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.03, 
                        boxShadow: "0 8px 25px rgba(79,70,229,0.15)",
                        backgroundColor: "#f8fafc"
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs md:text-sm px-4 md:px-5 py-2.5 md:py-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl md:rounded-2xl text-gray-700 dark:text-gray-300 shadow-lg border border-indigo-100/50 dark:border-gray-600/50 cursor-pointer flex items-center gap-2.5 md:gap-3 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all duration-200"
                    >
                      <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/60 dark:to-purple-800/60 p-2 shadow-sm">
                        {index % 3 === 0 ? (
                          <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        ) : index % 3 === 1 ? (
                          <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <span className="font-medium">{suggestion}</span>
                    </motion.div>
                  ))}
                </motion.div>
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
                    className={`max-w-[85%] rounded-3xl px-5 py-4 shadow-lg backdrop-blur-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-white rounded-tr-none border border-white/20'
                        : 'bg-white/90 dark:bg-gray-700/90 border border-indigo-100/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.role === 'assistant' ? (
                        <motion.div 
                          whileHover={{ rotate: 10 }}
                          className="flex items-center"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/60 dark:to-purple-800/60 flex items-center justify-center mr-2 shadow-sm">
                            <Bot className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Lisa AI
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div 
                          whileHover={{ rotate: -10 }}
                          className="flex items-center"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/60 dark:to-purple-800/60 flex items-center justify-center mr-2 shadow-sm">
                            <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            You
                          </span>
                        </motion.div>
                      )}
                      <span className="text-[10px] ml-auto opacity-60 font-medium">
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
                <div className="max-w-[85%] rounded-3xl px-5 py-4 bg-white/90 dark:bg-gray-700/90 border border-indigo-100/50 dark:border-gray-600/50 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-lg backdrop-blur-sm">
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/60 dark:to-purple-800/60 flex items-center justify-center mr-2 shadow-sm">
                      <Bot className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Lisa AI
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex space-x-1.5">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'loop', delay: 0 }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 shadow-sm"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-violet-400 shadow-sm"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 shadow-sm"
                      />
                    </div>
                    <span className="text-sm ml-3 text-gray-500 dark:text-gray-400 font-medium">Lisa is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="p-4 md:p-6 border-t-2 border-indigo-200/30 dark:border-indigo-700/30 bg-gradient-to-r from-white/90 via-indigo-50/80 to-purple-50/80 dark:from-gray-800/90 dark:via-indigo-950/80 dark:to-purple-950/80 backdrop-blur-sm shadow-lg">
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="text-indigo-500 dark:text-indigo-400"
            >
              <Sparkles className="h-5 w-5 drop-shadow-sm" />
            </motion.div>
          </div>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lisa"
            disabled={isLoading}
            className="pl-12 md:pl-14 pr-10 md:pr-12 py-6 md:py-8 rounded-xl md:rounded-2xl border-2 border-indigo-300/50 dark:border-indigo-600/50 bg-white/95 dark:bg-gray-700/95 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 shadow-xl backdrop-blur-sm text-xs md:text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium"
          />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="h-7 md:h-8 w-7 md:w-8 p-0 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-indigo-500/30 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="h-3 md:h-4 w-3 md:w-4 text-white drop-shadow-lg" />
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox; 