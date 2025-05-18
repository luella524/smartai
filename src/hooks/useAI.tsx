import { useState, useEffect } from 'react';
import { Task, TimeBlock, AISuggestion } from '../types';
import { format } from 'date-fns';
import { Message } from '@/components/AI/ChatBox';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Create OpenAI client instance 
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Use environment variable
  dangerouslyAllowBrowser: true // This is needed for client-side usage, but be careful with your API key
});

// Function to make API calls to OpenAI
const callOpenAI = async (messages: { role: string; content: string }[]) => {
  try {
    // For development/demo mode without API key, use simulated response
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.log('No API key found, using simulated response');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          message: "I'll help you with your calendar. What would you like to do?",
          actions: []
        }
      };
    }
    
    // Call OpenAI API using the package
    const response = await openai.chat.completions.create({
      model: 'o4-mini',
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
                  description: 'Date in format YYYY-MM-DD, or named day like "today", "tomorrow", or day of week "monday"' 
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
                  description: 'New date in format YYYY-MM-DD, or named day like "today", "tomorrow", or day of week "monday"' 
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
                },
              },
              required: ['eventId']
            }
          }
        }
      ]
    });
    
    return {
      success: true,
      data: {
        message: response.choices[0].message.content || "I'll help with your calendar.",
        tool_calls: response.choices[0].message.tool_calls
      }
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return {
      success: false,
      error: 'Failed to connect to AI service'
    };
  }
};

// Parse AI response to extract action data
const parseAIResponse = (aiResponse: any, userMessage: string) => {
  // If we have a real response from OpenAI with function calls
  if (aiResponse.success && aiResponse.data.tool_calls?.length > 0) {
    const toolCall = aiResponse.data.tool_calls[0];
    
    try {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      let responseMessage = '';
      
      // Log which function was called
      console.log(`AI chose function: ${functionName}`, functionArgs);
      // Handle different function calls
      if (functionName === 'add_calendar_event') {
        const { title, date, startTime, endTime } = functionArgs;
        responseMessage = `I've scheduled "${title}" for ${date}${startTime ? ` at ${startTime}` : ''}${endTime ? ` to ${endTime}` : ''}. Is there anything else you'd like me to add?`;
        
        return {
          action: {
            type: functionName,
            data: functionArgs
          },
          message: responseMessage
        };
      } else if (functionName === 'edit_calendar_event') {
        const { eventId, title, date, startTime, endTime } = functionArgs;
        
        // For reschedule/edit operations, we'll use a combined delete+add approach
        if (date || startTime || endTime) {
          return {
            action: {
              type: 'reschedule',
              delete: {
                type: 'delete_calendar_event',
                data: { eventId }
              },
              add: {
                type: 'add_calendar_event',
                data: {
                  title: title,
                  date: date || 'today',
                  startTime: startTime,
                  endTime: endTime
                }
              }
            },
            message: `I've rescheduled "${eventId}"${date ? ` to ${date}` : ''}${startTime ? ` at ${startTime}` : ''}. Is there anything else you'd like to modify?`
          };
        } else {
          // For simple title edits without time/date changes, use standard edit functionality
          responseMessage = `I've updated "${eventId}"${title ? ` to "${title}"` : ''}${date ? ` on ${date}` : ''}${startTime ? ` starting at ${startTime}` : ''}${endTime ? ` ending at ${endTime}` : ''}. Is there anything else you'd like to change?`;
          
          return {
            action: {
              type: functionName,
              data: functionArgs
            },
            message: responseMessage
          };
        }
      } else if (functionName === 'delete_calendar_event') {
        const { eventId } = functionArgs;
        responseMessage = `I've removed "${eventId}" from your calendar. Is there anything else you'd like me to help with?`;
        
        return {
          action: {
            type: functionName,
            data: functionArgs
          },
          message: responseMessage
        };
      }
    } catch (e) {
      console.error('Error parsing function call:', e);
    }
  }
  
  // If no function call or error in parsing, check for patterns in the user message
  
  // First, check for modification patterns - these need to be handled as two operations
  if (/reschedule|move|change|update|modify|edit/i.test(userMessage)) {
    const eventTitleMatch = userMessage.match(/(?:reschedule|move|change|update|modify|edit)\s+(?:my|the)\s+([^"]+?)(?:\s+to|\s+from|\s+on|$)/i) || 
                             userMessage.match(/(?:reschedule|move|change|update|modify|edit)\s+"([^"]+?)"/i);
    
    const dateMatch = userMessage.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?/i) ||
                      userMessage.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    
    const timeMatch = userMessage.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    
    if (eventTitleMatch && (dateMatch || timeMatch)) {
      const eventTitle = eventTitleMatch[1].trim();
      const date = dateMatch ? dateMatch[0] : null;
      const time = timeMatch ? timeMatch[0] : null;
      
      // For rescheduling, we need both a delete and add operation
      return {
        action: {
          type: 'reschedule',
          delete: {
            type: 'delete_calendar_event',
            data: { eventId: eventTitle }
          },
          add: {
            type: 'add_calendar_event',
            data: {
              title: eventTitle,
              date: date || 'today',
              startTime: time || '09:00'
            }
          }
        },
        message: `I've rescheduled "${eventTitle}"${date ? ` to ${date}` : ''}${time ? ` at ${time}` : ''}. Is there anything else you'd like to modify?`
      };
    }
  }
  
  // Check for scheduling patterns
  if (/schedule|add|create|new meeting|new event/i.test(userMessage)) {
    const titleMatch = userMessage.match(/(?:schedule|add|create|new meeting|new event)(?:\s+a)?\s+([^"]+?)(?:\s+on|\s+for|\s+at|\s+tomorrow|\s+today|$)/i) ||
                       userMessage.match(/(?:schedule|add|create|new meeting|new event)(?:\s+a)?\s+"([^"]+?)"/i);
    
    const dateMatch = userMessage.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?/i) ||
                      userMessage.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    
    const timeMatch = userMessage.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    const endTimeMatch = userMessage.match(/(?:to|until|till)\s+(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    
    if (titleMatch || dateMatch || timeMatch) {
      const title = titleMatch ? titleMatch[1].trim() : 'New Event';
      const date = dateMatch ? dateMatch[0] : 'today';
      const startTime = timeMatch ? timeMatch[0] : null;
      const endTime = endTimeMatch ? endTimeMatch[1] + (endTimeMatch[2] || '') + (endTimeMatch[3] || '') : null;
      
      return {
        action: {
          type: 'add_calendar_event',
          data: {
            title: title,
            date: date,
            startTime: startTime,
            endTime: endTime
          }
        },
        message: `I've scheduled "${title}" for ${date}${startTime ? ` at ${startTime}` : ''}${endTime ? ` to ${endTime}` : ''}. Is there anything else you'd like me to add?`
      };
    }
  }
  
  // Check for deletion/cancellation patterns
  if (/cancel|delete|remove/i.test(userMessage)) {
    const eventTitleMatch = userMessage.match(/(?:cancel|delete|remove)\s+(?:my|the)\s+([^"]+?)(?:\s+on|\s+at|\s+from|$)/i) ||
                             userMessage.match(/(?:cancel|delete|remove)\s+"([^"]+?)"/i);
    
    if (eventTitleMatch) {
      const eventTitle = eventTitleMatch[1].trim();
      
      return {
        action: {
          type: 'delete_calendar_event',
          data: {
            eventId: eventTitle
          }
        },
        message: `I've cancelled "${eventTitle}". Is there anything else you'd like me to help with?`
      };
    }
  }
  
  // Default response for other queries
  return {
    action: null,
    message: aiResponse.data.message
  };
};

// Add a helper function to format calendar items for AI context
const formatCalendarItemsForAI = (tasks: Task[], timeBlocks: TimeBlock[]) => {
  let formattedText = '';
  
  // Format tasks
  if (tasks.length > 0) {
    formattedText += 'CURRENT TASKS:\n';
    tasks.forEach((task, index) => {
      formattedText += `${index + 1}. "${task.title}" (ID: ${task.id}): ${task.date}${task.startTime ? ` at ${task.startTime}` : ''}${task.endTime ? ` to ${task.endTime}` : ''}, Priority: ${task.priority}, Status: ${task.completed ? 'Completed' : 'Pending'}\n`;
    });
    formattedText += '\n';
  }
  
  // Format time blocks
  if (timeBlocks.length > 0) {
    formattedText += 'CURRENT TIME BLOCKS:\n';
    timeBlocks.forEach((block, index) => {
      formattedText += `${index + 1}. "${block.title}" (ID: ${block.id}): ${block.date} from ${block.startTime} to ${block.endTime}\n`;
    });
  }
  
  return formattedText;
};

export const useAI = (tasks: Task[], timeBlocks: TimeBlock[], selectedDate: Date) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [lastSystemContext, setLastSystemContext] = useState<string>('');
  
  // Add a welcome message when the component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "👋 Hi there! I'm your AI calendar assistant. I can help you manage your schedule by adding, removing, or editing events. Try saying something like:\n\n• \"Schedule a meeting with John tomorrow at 2pm\"\n• \"Move my dentist appointment to Friday\"\n• \"What tasks do I have for today?\"\n• \"Cancel my 3pm meeting\"",
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);
  
  // Generate AI suggestions based on tasks and time blocks
  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // In a real app, this would be an API call to an AI service
    // For demo purposes, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'timeBlock',
        content: 'I notice you have a free slot in the morning. Would you like to schedule some focus time from 8:00 to 9:00 AM before your team meeting?',
        timeBlock: {
          title: 'Focus Time',
          startTime: '08:00',
          endTime: '09:00',
          date: format(selectedDate, 'yyyy-MM-dd'),
        }
      },
      {
        id: '2',
        type: 'task',
        content: 'You might want to prepare for your team meeting. Would you like me to add a preparation task?',
        task: {
          title: 'Prepare for team meeting',
          date: format(selectedDate, 'yyyy-MM-dd'),
          priority: 'high',
          completed: false,
        }
      },
      {
        id: '3',
        type: 'schedule',
        content: 'I\'ve noticed you often schedule workouts in the evening. Would you like to continue this habit today?',
      }
    ];
    
    setSuggestions(mockSuggestions);
    setIsGenerating(false);
  };
  
  // Apply a suggestion
  const applySuggestion = (suggestion: AISuggestion) => {
    // This would actually create the task or time block
    // For demo purposes, we'll just remove the suggestion
    setSuggestions(prevSuggestions => 
      prevSuggestions.filter(s => s.id !== suggestion.id)
    );
  };
  
  // Dismiss a suggestion
  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.filter(s => s.id !== suggestionId)
    );
  };
  
  // Clear all suggestions
  const clearAllSuggestions = () => {
    setSuggestions([]);
  };
  
  // Send a chat message and get AI response
  const sendChatMessage = async (content: string, 
    // Add calendar manipulation functions as parameters with correct signatures
    addTaskFn?: (task: Omit<Task, 'id'>) => void,
    updateTaskFn?: (updatedTask: Task) => void,
    deleteTaskFn?: (taskId: string) => void,
    addTimeBlockFn?: (timeBlock: Omit<TimeBlock, 'id'>) => void,
    updateTimeBlockFn?: (updatedBlock: TimeBlock) => void,
    deleteTimeBlockFn?: (blockId: string) => void
  ) => {
    // Don't send empty messages
    if (!content.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    
    try {
      // Convert messages to format expected by OpenAI
      const messageHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant', 
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({ role: 'user', content });
      
      // Format all tasks and time blocks for AI context
      const allTasks = [...tasks]; // Get all tasks, not just filtered ones
      const allTimeBlocks = [...timeBlocks]; // Get all time blocks
      const formattedCalendarItems = formatCalendarItemsForAI(allTasks, allTimeBlocks);
      
      // Add system message with detailed context
      const systemMessage = {
        role: 'system',
        content: `You are a helpful AI assistant for a calendar application. Today's date is ${format(new Date(), 'PPP')}. Help the user manage their calendar events, tasks, and schedule.

${formattedCalendarItems}

IMPORTANT:
- For modifying events (e.g., changing title, time, or date), use the 'edit_calendar_event' function. Provide the 'eventId' of the existing event and all the new details for the event in a single call.
- If an event is being moved to a new date/time, use 'edit_calendar_event' with the new date/time details.
- Only use 'delete_calendar_event' if the user explicitly asks to remove an event permanently.
- Only use 'add_calendar_event' for entirely new events.

When the user references events by partial descriptions (like "my meeting" or "dentist appointment"), try to find the best match from the list above.

For time formats, prefer 24-hour format (e.g., "14:00" instead of "2:00 PM").`
      };
      
      // Store the context for debugging
      setLastSystemContext(systemMessage.content);
      
      // Call OpenAI with complete message history including system message
      const aiResponse = await callOpenAI([systemMessage, ...messageHistory]);
      
      // Parse the response to get the action and message
      const { action, message } = parseAIResponse(aiResponse, content);
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If there's an action to perform, handle it
      if (action) {
        console.log('AI suggested action:', action);
        
        // Create a log entry for this action
        let logEntry = '';
        
        // Handle reschedule action (delete + add)
        if (action.type === 'reschedule' && action.delete && action.add && 
            deleteTaskFn && addTaskFn) {
          
          const deleteAction = action.delete;
          const aiProvidedIdentifier = deleteAction.data.eventId; // This is what AI sent as eventId
          const addAction = action.add;
          const { title: newTitle, date: newDate, startTime: newStartTime, endTime: newEndTime } = addAction.data;
          
          logEntry = `Action: reschedule_calendar_event`;

          let itemToModify = null;
          let itemType = null; // 'task' or 'timeBlock'
          const normalizedIdentifier = aiProvidedIdentifier.trim().toLowerCase();

          // 1. Try to find by ID
          itemToModify = allTasks.find(t => t.id === aiProvidedIdentifier);
          if (itemToModify) {
            itemType = 'task';
          } else {
            itemToModify = allTimeBlocks.find(b => b.id === aiProvidedIdentifier);
            if (itemToModify) {
              itemType = 'timeBlock';
            }
          }

          // 2. If not found by ID, try by exact title match (normalized)
          if (!itemToModify) {
            itemToModify = allTasks.find(t => t.title.trim().toLowerCase() === normalizedIdentifier);
            if (itemToModify) {
              itemType = 'task';
            } else {
              itemToModify = allTimeBlocks.find(b => b.title.trim().toLowerCase() === normalizedIdentifier);
              if (itemToModify) {
                itemType = 'timeBlock';
              }
            }
          }

          // 3. If not found by exact title, try by partial title match (normalized)
          if (!itemToModify) {
            itemToModify = allTasks.find(t => t.title.trim().toLowerCase().includes(normalizedIdentifier));
            if (itemToModify) {
              itemType = 'task';
            } else {
              itemToModify = allTimeBlocks.find(b => b.title.trim().toLowerCase().includes(normalizedIdentifier));
              if (itemToModify) {
                itemType = 'timeBlock';
              }
            }
          }
          
          let originalItem = null;
          
          if (itemToModify) {
            originalItem = { ...itemToModify }; // Store original item details
            const oldTitle = originalItem.title;
            const oldDate = originalItem.date;
            const oldStartTime = originalItem.startTime || '';

            if (itemType === 'task') {
              deleteTaskFn(itemToModify.id);
              logEntry += ` - Modified task: "${oldTitle}" from ${oldDate}${oldStartTime ? ` at ${oldStartTime}` : ''}`;
            } else if (itemType === 'timeBlock' && deleteTimeBlockFn) {
              deleteTimeBlockFn(itemToModify.id);
              logEntry += ` - Modified time block: "${oldTitle}" from ${oldDate}${oldStartTime ? ` at ${oldStartTime}` : ''}`;
            } else {
              // Should not happen if itemType is correctly set
               logEntry += ` - Error: Found item but failed to determine type or delete function for ${aiProvidedIdentifier}`;
               originalItem = null; // Prevent adding new item if delete failed
            }
          } else {
            logEntry += ` - Could not find event to modify with identifier: ${aiProvidedIdentifier}`;
          }
          
          // Then handle the add operation if deletion was successful (originalItem is not null)
          if (originalItem) {
            // Format the date properly
            let formattedDate = newDate;
            if (newDate === 'today') {
              formattedDate = format(new Date(), 'yyyy-MM-dd');
            } else if (newDate === 'tomorrow') {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              formattedDate = format(tomorrow, 'yyyy-MM-dd');
            } else if (/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(newDate)) {
              // Find the next occurrence of the day
              const today = new Date();
              const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                .findIndex(day => day === newDate.toLowerCase());
              
              if (dayOfWeek >= 0) {
                const daysToAdd = (dayOfWeek + 7 - today.getDay()) % 7 || 7;
                const targetDate = new Date();
                targetDate.setDate(today.getDate() + daysToAdd);
                formattedDate = format(targetDate, 'yyyy-MM-dd');
              }
            }
            
            // Complete the log entry with the new date/time information
            logEntry += ` to ${formattedDate}${newStartTime ? ` at ${newStartTime}` : ''}`;
            
            // Create new event with proper type (task or time block)
            if (itemType === 'timeBlock' && addTimeBlockFn) {
              // It was a time block
              const newTimeBlock: Omit<TimeBlock, 'id'> = {
                title: newTitle || originalItem.title,
                date: formattedDate,
                startTime: newStartTime || originalItem.startTime,
                endTime: newEndTime || originalItem.endTime,
                color: originalItem.color || '#93C5FD'
              };
              
              addTimeBlockFn(newTimeBlock);
            } else {
              // It was a task
              const newTask: Omit<Task, 'id'> = {
                title: newTitle || originalItem.title,
                date: formattedDate,
                completed: false,
                priority: originalItem.priority || 'medium',
                startTime: newStartTime || originalItem.startTime,
                endTime: newEndTime || originalItem.endTime,
              };
              
              addTaskFn(newTask);
            }
          }
        }
        // Continue with the existing handlers for other action types
        else if (action.type === 'add_calendar_event' && addTaskFn && addTimeBlockFn) {
          const { title, date, startTime, endTime, priority } = action.data;
          
          // Set the action type for this log entry
          logEntry = `Action: ${action.type}`;
          
          // Format the date properly if it's a named day like "today" or "tomorrow"
          let formattedDate = date;
          if (date === 'today') {
            formattedDate = format(new Date(), 'yyyy-MM-dd');
          } else if (date === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            formattedDate = format(tomorrow, 'yyyy-MM-dd');
          } else if (/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(date)) {
            // Find the next occurrence of the day
            const today = new Date();
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
              .findIndex(day => day === date.toLowerCase());
            
            if (dayOfWeek >= 0) {
              const daysToAdd = (dayOfWeek + 7 - today.getDay()) % 7 || 7;
              const targetDate = new Date();
              targetDate.setDate(today.getDate() + daysToAdd);
              formattedDate = format(targetDate, 'yyyy-MM-dd');
            }
          }
          
          if (startTime && endTime) {
            // If we have both start and end time, create a time block
            const newTimeBlock: Omit<TimeBlock, 'id'> = {
              title,
              date: formattedDate,
              startTime,
              endTime,
              color: '#93C5FD', // Default color
            };
            
            addTimeBlockFn(newTimeBlock);
            logEntry += ` - Added time block: ${title} on ${formattedDate} from ${startTime} to ${endTime}`;
          } else {
            // Otherwise create a task
            const newTask: Omit<Task, 'id'> = {
              title,
              date: formattedDate,
              completed: false,
              priority: priority || 'medium',
              startTime,
              endTime,
            };
            
            addTaskFn(newTask);
            logEntry += ` - Added task: ${title} on ${formattedDate}`;
            
            if (startTime) {
              logEntry += ` at ${startTime}`;
            }
          }
        } else if (action.type === 'edit_calendar_event' && updateTaskFn && updateTimeBlockFn) {
          logEntry = `Action: ${action.type}`;
          
          const { eventId: aiProvidedIdentifier, title: newTitle, date: newDate, startTime: newStartTime, endTime: newEndTime } = action.data;

          let itemToModify = null;
          let itemType = null; // 'task' or 'timeBlock'
          const normalizedIdentifier = aiProvidedIdentifier.trim().toLowerCase();

          // 1. Try to find by ID
          itemToModify = allTasks.find(t => t.id === aiProvidedIdentifier);
          if (itemToModify) {
            itemType = 'task';
          } else {
            itemToModify = allTimeBlocks.find(b => b.id === aiProvidedIdentifier);
            if (itemToModify) {
              itemType = 'timeBlock';
            }
          }

          // 2. If not found by ID, try by exact title match (normalized)
          if (!itemToModify) {
            itemToModify = allTasks.find(t => t.title.trim().toLowerCase() === normalizedIdentifier);
            if (itemToModify) {
              itemType = 'task';
            } else {
              itemToModify = allTimeBlocks.find(b => b.title.trim().toLowerCase() === normalizedIdentifier);
              if (itemToModify) {
                itemType = 'timeBlock';
              }
            }
          }

          // 3. If not found by exact title, try by partial title match (normalized)
          if (!itemToModify) {
            itemToModify = allTasks.find(t => t.title.trim().toLowerCase().includes(normalizedIdentifier));
            if (itemToModify) {
              itemType = 'task';
            } else {
              itemToModify = allTimeBlocks.find(b => b.title.trim().toLowerCase().includes(normalizedIdentifier));
              if (itemToModify) {
                itemType = 'timeBlock';
              }
            }
          }

          if (itemToModify) {
            if (itemType === 'task') {
              const updatedTask: Task = {
                ...(itemToModify as Task),
                title: newTitle || itemToModify.title,
                date: newDate || itemToModify.date,
                startTime: newStartTime || itemToModify.startTime,
                endTime: newEndTime || itemToModify.endTime,
                // Ensure other properties like priority, completed, tags are preserved
                priority: (newTitle || newDate || newStartTime || newEndTime) ? (itemToModify as Task).priority : (action.data.priority || (itemToModify as Task).priority), 
              };
              updateTaskFn(updatedTask);
              logEntry += ` - Updated task ${itemToModify.id}: ${JSON.stringify({title: updatedTask.title, date: updatedTask.date, startTime: updatedTask.startTime, endTime: updatedTask.endTime})}`;
            } else if (itemType === 'timeBlock') {
              const updatedTimeBlock: TimeBlock = {
                ...(itemToModify as TimeBlock),
                title: newTitle || itemToModify.title,
                date: newDate || itemToModify.date,
                startTime: newStartTime || itemToModify.startTime,
                endTime: newEndTime || itemToModify.endTime,
                 // Ensure other properties like color are preserved
                color: (itemToModify as TimeBlock).color, 
              };
              updateTimeBlockFn(updatedTimeBlock);
              logEntry += ` - Updated time block ${itemToModify.id}: ${JSON.stringify({title: updatedTimeBlock.title, date: updatedTimeBlock.date, startTime: updatedTimeBlock.startTime, endTime: updatedTimeBlock.endTime})}`;
            }
          } else {
            logEntry += ` - Could not find event to edit with identifier: ${aiProvidedIdentifier}`;
          }
        } else if (action.type === 'delete_calendar_event' && deleteTaskFn && deleteTimeBlockFn) {
          // Set the action type for this log entry
          logEntry = `Action: ${action.type}`;
          
          // Extract eventId from the action data
          const { eventId } = action.data;
          
          // First try to find the task or time block by ID
          let taskToDelete = allTasks.find(t => t.id === eventId);
          let timeBlockToDelete = allTimeBlocks.find(tb => tb.id === eventId);
          
          // If not found by ID, try to find by exact title match
          if (!taskToDelete) {
            taskToDelete = allTasks.find(t => t.title.toLowerCase() === eventId.toLowerCase());
          }
          if (!timeBlockToDelete) {
            timeBlockToDelete = allTimeBlocks.find(tb => tb.title.toLowerCase() === eventId.toLowerCase());
          }
          
          // If still not found, try partial match
          if (!taskToDelete) {
            taskToDelete = allTasks.find(t => t.title.toLowerCase().includes(eventId.toLowerCase()));
          }
          if (!timeBlockToDelete) {
            timeBlockToDelete = allTimeBlocks.find(tb => tb.title.toLowerCase().includes(eventId.toLowerCase()));
          }
          
          if (taskToDelete) {
            deleteTaskFn(taskToDelete.id);
            logEntry += ` - Deleted task ${taskToDelete.id}: ${taskToDelete.title}`;
          } else if (timeBlockToDelete) {
            deleteTimeBlockFn(timeBlockToDelete.id);
            logEntry += ` - Deleted time block ${timeBlockToDelete.id}: ${timeBlockToDelete.title}`;
          } else {
            logEntry += ` - Could not find event to delete with identifier: ${eventId}`;
          }
        } else {
          // Set a generic action type for unsupported actions
          logEntry = `Action: ${action.type}`;
          logEntry += ` - No action taken: Required functions missing or action type not supported`;
        }
        
        // Add to action log
        setActionLog(prev => [...prev, logEntry]);
        console.log(logEntry);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      
      // Add error message to chat
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
  
  // Clear the action log
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
    // Chat-related states and functions
    messages,
    isChatLoading,
    sendChatMessage,
    actionLog,
    clearActionLog,
    lastSystemContext
  };
};
