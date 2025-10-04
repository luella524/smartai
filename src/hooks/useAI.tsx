import { useState, useEffect } from 'react';
import { Task, TimeBlock, AISuggestion } from '../types';
import { format } from 'date-fns';
import { Message } from '@/components/AI/ChatBox';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Log environment information on module load
console.log('🔧 Environment Debug Info:');
console.log('- NODE_ENV:', import.meta.env.MODE);
console.log('- VITE_OPENAI_API_KEY exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('- VITE_OPENAI_API_KEY length:', import.meta.env.VITE_OPENAI_API_KEY?.length || 0);
console.log('- VITE_OPENAI_API_KEY preview:', import.meta.env.VITE_OPENAI_API_KEY ? `${import.meta.env.VITE_OPENAI_API_KEY.substring(0, 8)}...` : 'undefined');

// Create OpenAI client instance 
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '_A8rr5iJpwLISYDNpELcRWGdyb3FYydmxLzM', // Use environment variable or fallback
  dangerouslyAllowBrowser: true // This is needed for client-side usage, but be careful with your API key
});

// Function to make API calls to OpenAI
const callOpenAI = async (messages: { role: string; content: string }[]) => {
  try {
    // Check for API key and provide detailed debugging info
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    console.log('🔑 API Key Debug Info:');
    console.log('- Environment variable exists:', !!apiKey);
    console.log('- API key length:', apiKey ? apiKey.length : 0);
    console.log('- API key starts with "sk-":', apiKey ? apiKey.startsWith('sk-') : false);
    console.log('- API key preview:', apiKey ? `${apiKey.substring(0, 8)}...` : 'undefined');
    
    // For development/demo mode without API key, use simulated response
    if (!apiKey) {
      console.warn('⚠️  No OpenAI API key found!');
      console.warn('📝 To enable AI functionality:');
      console.warn('   1. Get an API key from https://platform.openai.com/api-keys');
      console.warn('   2. Create a .env file in your project root');
      console.warn('   3. Add: VITE_OPENAI_API_KEY=your_api_key_here');
      console.warn('   4. Restart the development server');
      console.log('🎭 Using simulated response for demo purposes...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          message: "I'll help you with your calendar. What would you like to do? (Note: Running in demo mode - no API key configured)",
          actions: []
        }
      };
    }
    
    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      console.error('❌ Invalid API key format!');
      console.error('🔧 API key should start with "sk-"');
      console.error('📝 Current key preview:', `${apiKey.substring(0, 8)}...`);
      
      return {
        success: false,
        error: 'Invalid API key format. API key should start with "sk-"'
      };
    }
    
    console.log('✅ API key validation passed, making OpenAI request...');
    
    // Call OpenAI API using GPT-4o mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      tools: [
        {
          type: 'function',
          function: {
            name: 'add_calendar_event',
            description: 'Add a new event, task, or meeting to the calendar. Use this for any new calendar item.',
            parameters: {
              type: 'object',
              properties: {
                title: { 
                  type: 'string', 
                  description: 'Title of the event or task' 
                },
                date: { 
                  type: 'string', 
                  description: 'Date in format YYYY-MM-DD, MM/DD, MM/DD/YYYY, or named day like "today", "tomorrow", or day of week "monday"' 
                },
                startTime: { 
                  type: 'string', 
                  description: 'Start time in 24-hour format like "14:00" or "09:30". Optional for all-day events.' 
                },
                endTime: { 
                  type: 'string', 
                  description: 'End time in 24-hour format like "15:00" or "17:30". Optional for tasks without duration.' 
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Priority level for tasks. Default is "medium".'
                }
              },
              required: ['title', 'date']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'edit_calendar_event',
            description: 'Edit or reschedule an existing event in the calendar. Use this when modifying any event details.',
            parameters: {
              type: 'object',
              properties: {
                eventId: { 
                  type: 'string', 
                  description: 'ID or title of the event to edit. This should match or closely match an existing event title.' 
                },
                title: { 
                  type: 'string', 
                  description: 'New title for the event (if changing)' 
                },
                date: { 
                  type: 'string', 
                  description: 'New date in format YYYY-MM-DD, MM/DD, MM/DD/YYYY, or named day like "today", "tomorrow", or day of week "monday"' 
                },
                startTime: { 
                  type: 'string', 
                  description: 'New start time in 24-hour format like "14:00" or "09:30"' 
                },
                endTime: { 
                  type: 'string', 
                  description: 'New end time in 24-hour format like "15:00" or "17:30"' 
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Priority level for tasks'
                }
              },
              required: ['eventId']
            }
          }
        },
        {
          type: 'function',
          function: {
            name: 'delete_calendar_event',
            description: 'Delete or cancel an event from the calendar. Use this to remove an existing event.',
            parameters: {
              type: 'object',
              properties: {
                eventId: { 
                  type: 'string', 
                  description: 'ID or title of the event to delete. This should match or closely match an existing event title.' 
                }
              },
              required: ['eventId']
            }
          }
        }
      ],
      tool_choice: 'auto',
      temperature: 1,
      max_completion_tokens: 1000
    });

    console.log('✅ OpenAI API Response received');
    console.log('- Model used:', response.model);
    console.log('- Usage:', response.usage);
    console.log('- Response content:', response.choices[0].message.content);
    console.log('- Tool calls:', response.choices[0].message.tool_calls);
    
    return {
      success: true,
      data: {
        message: response.choices[0].message.content || "I'm here to help you with your calendar! What would you like to do?",
        tool_calls: response.choices[0].message.tool_calls
      }
    };
  } catch (error: any) {
    console.error('❌ OpenAI API Error Details:');
    console.error('- Error type:', error?.constructor?.name);
    console.error('- Error message:', error?.message);
    
    if (error?.message?.includes('401')) {
      console.error('🔐 Authentication Error: Invalid API key');
      console.error('💡 Check your API key in the .env file');
      return {
        success: false,
        error: 'Authentication failed. Please check your API key.'
      };
    } else if (error?.message?.includes('429')) {
      console.error('⏰ Rate Limit Error: Too many requests');
      console.error('💡 Wait a moment and try again');
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait a moment and try again.'
      };
    } else if (error?.message?.includes('network') || error?.code === 'NETWORK_ERROR') {
      console.error('🌐 Network Error: Unable to connect');
      console.error('💡 Check your internet connection');
      return {
        success: false,
        error: 'Network error. Please check your internet connection.'
      };
    } else {
      console.error('❓ Unknown Error:', error?.message);
      return {
        success: false,
        error: `AI service error: ${error?.message || 'Unknown error occurred'}`
      };
    }
  }
};

// Parse AI response to extract action data
const parseAIResponse = (response: any) => {
  console.log('🔍 Parsing AI Response:', response);
  
  if (!response.success) {
    console.error('❌ AI Response failed:', response.error);
    return { message: response.error, actions: [] };
  }

  const actions: any[] = [];
  
  if (response.data.tool_calls) {
    console.log('🛠️ Processing tool calls:', response.data.tool_calls.length);
    
    response.data.tool_calls.forEach((toolCall: any) => {
      console.log('🔧 Tool call:', toolCall.function.name);
      console.log('📝 Arguments:', toolCall.function.arguments);
      
      try {
        const args = JSON.parse(toolCall.function.arguments);
        actions.push({
          type: toolCall.function.name,
          ...args
        });
      } catch (e) {
        console.error('❌ Failed to parse tool call arguments:', e);
      }
    });
  }
  
  console.log('✅ Parsed actions:', actions);
  return { message: response.data.message, actions };
};

export const useAI = (tasks: Task[], timeBlocks: TimeBlock[], selectedDate: Date) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [lastSystemContext, setLastSystemContext] = useState<string>('');
  
  // Generate AI suggestions
  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      const systemMessage = `You are Lisa, an AI calendar assistant. Generate 3 helpful suggestions for the user based on their current calendar state.

Current tasks: ${tasks.length}
Current time blocks: ${timeBlocks.length}
Selected date: ${format(selectedDate, 'yyyy-MM-dd')}

Generate suggestions that help with:
1. Task management and prioritization
2. Time blocking and scheduling
3. Calendar optimization

Return suggestions in this format:
- "Schedule a 30-minute break at 2pm today"
- "Move low priority tasks to next week"
- "Add buffer time between meetings"`;

      const response = await callOpenAI([
        { role: 'system', content: systemMessage },
        { role: 'user', content: 'Generate helpful calendar suggestions' }
      ]);

      if (response.success) {
        const parsed = parseAIResponse(response);
        // Convert suggestions to AISuggestion format
        const newSuggestions: AISuggestion[] = parsed.message.split('\n').map((suggestion: string, index: number) => ({
          id: uuidv4(),
        type: 'schedule',
          content: suggestion.replace(/^-\s*/, '').trim(),
          timestamp: new Date()
        })).filter(s => s.content.length > 0);
        
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
    setIsGenerating(false);
    }
  };
  
  // Apply suggestion
  const applySuggestion = (suggestion: AISuggestion) => {
    console.log('Applying suggestion:', suggestion);
    // Remove the suggestion from the list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    // Add to action log
    setActionLog(prev => [...prev, `Applied suggestion: ${suggestion.content}`]);
  };

  // Dismiss suggestion
  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };
  
  // Clear all suggestions
  const clearAllSuggestions = () => {
    setSuggestions([]);
  };
  
  // Send chat message
  const sendChatMessage = async (message: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    
    try {
      // Check for "list today" pattern
      if (message.toLowerCase().includes('list today') || message.toLowerCase().includes('top 5')) {
        const today = format(selectedDate, 'yyyy-MM-dd');
        const todayTasks = tasks.filter(task => task.date === today && !task.completed);
        const completedToday = tasks.filter(task => task.date === today && task.completed).length;
        const totalToday = tasks.filter(task => task.date === today).length;
        
        const top5Tasks = todayTasks
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
            const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
            return bPriority - aPriority;
          })
          .slice(0, 5);

        const taskList = top5Tasks.map((task, index) => 
          `${index + 1}. ${task.title} (${task.priority} priority)`
        ).join('\n');

        const motivationalMessage = completedToday === totalToday && totalToday > 0 
          ? "🎉 Amazing! You've completed all your tasks for today!"
          : completedToday > 0 
          ? `Great progress! You've completed ${completedToday}/${totalToday} tasks today.`
          : "Ready to tackle today? Let's get started!";

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `**Today's Top 5 Priority Tasks:**\n\n${taskList || 'No tasks for today!'}\n\n${motivationalMessage}`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsChatLoading(false);
        return;
      }
      
      // Build context for AI
      const context = `You are Lisa, an AI calendar assistant. Help the user manage their calendar and tasks.

Current context:
- Selected date: ${format(selectedDate, 'yyyy-MM-dd')}
- Tasks for selected date: ${tasks.length}
- Time blocks for selected date: ${timeBlocks.length}
- Total tasks: ${tasks.length}
- Total time blocks: ${timeBlocks.length}

Available functions:
- add_calendar_event: Add new tasks or events
- edit_calendar_event: Modify existing events
- delete_calendar_event: Remove events

Be helpful, friendly, and proactive in suggesting calendar improvements.`;

      const response = await callOpenAI([
        { role: 'system', content: context },
        ...messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: message }
      ]);

      if (response.success) {
        const parsed = parseAIResponse(response);
        
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
          content: parsed.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
        // Log actions
        if (parsed.actions.length > 0) {
          parsed.actions.forEach(action => {
            setActionLog(prev => [...prev, `Action: ${action.type} - ${JSON.stringify(action)}`]);
          });
        }
          } else {
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${response.error}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  // Clear action log
  const clearActionLog = () => {
    setActionLog([]);
  };
  
  return {
    suggestions,
    isGenerating,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    clearAllSuggestions,
    messages,
    isChatLoading,
    sendChatMessage,
    actionLog,
    clearActionLog,
    lastSystemContext
  };
};