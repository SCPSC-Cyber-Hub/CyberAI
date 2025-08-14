import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message, Conversation } from "@shared/schema";

interface ChatResponse {
  response: string;
  conversationId: string;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string): Promise<ChatResponse> => {
      const requestBody: any = {
        message: messageText,
      };
      
      // Only include conversationId if it exists
      if (currentConversationId) {
        requestBody.conversationId = currentConversationId;
      }
      
      const response = await apiRequest("POST", "/api/chat", requestBody);
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        conversationId: currentConversationId || "",
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setCurrentConversationId(data.conversationId);
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversationId: data.conversationId,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    toast({
      title: "Conversation cleared",
      description: "Starting a new conversation",
    });
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-gray-700/30 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center animate-float">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text animate-pulse-neon">Cyber AI</h1>
              <p className="text-xs text-gray-400">Powered by Gemini 1.5</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="glass-effect hover:cyber-glow text-gray-400 hover:text-red-400"
              data-testid="button-clear-conversation"
              title="Clear Conversation"
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-hide px-4 py-6 max-w-4xl mx-auto">
          
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyber-blue via-cyber-purple to-neon-green p-1 animate-float">
                <div className="w-full h-full rounded-full bg-deep-space flex items-center justify-center">
                  <i className="fas fa-brain text-3xl gradient-text"></i>
                </div>
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-3">Welcome to Cyber AI</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Your advanced AI assistant powered by Google's Gemini 1.5. 
                Ask me anything, and I'll provide intelligent, contextual responses.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSuggestedPrompt("Explain AI concepts")}
                  className="glass-effect text-gray-300 hover:text-neon-green hover:cyber-glow"
                  data-testid="button-suggest-ai"
                >
                  🤖 Explain AI concepts
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSuggestedPrompt("Help me with creative brainstorming")}
                  className="glass-effect text-gray-300 hover:text-cyber-cyan hover:cyber-glow"
                  data-testid="button-suggest-creative"
                >
                  💡 Creative brainstorming
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSuggestedPrompt("I need code assistance")}
                  className="glass-effect text-gray-300 hover:text-cyber-purple hover:cyber-glow"
                  data-testid="button-suggest-code"
                >
                  📝 Code assistance
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-xs lg:max-w-md">
                    <div className="glass-effect bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 rounded-2xl rounded-br-sm px-4 py-3 message-bubble">
                      <p className="text-white text-sm" data-testid={`text-user-message-${index}`}>{msg.content}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span data-testid={`text-timestamp-${index}`}>{formatTime(msg.timestamp)}</span>
                        <div className="flex items-center space-x-1">
                          <i className="fas fa-check-double text-neon-green"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-xs lg:max-w-2xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-green to-cyber-cyan flex items-center justify-center flex-shrink-0 mt-1">
                        <i className="fas fa-robot text-xs text-deep-space"></i>
                      </div>
                      <div className="glass-effect rounded-2xl rounded-bl-sm px-4 py-3 message-bubble">
                        <div className="text-white text-sm leading-relaxed whitespace-pre-wrap" data-testid={`text-ai-message-${index}`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                          <span data-testid={`text-ai-timestamp-${index}`}>{formatTime(msg.timestamp)}</span>
                          <div className="flex items-center space-x-2">
                            <button 
                              className="hover:text-neon-green transition-colors" 
                              title="Copy"
                              onClick={() => navigator.clipboard.writeText(msg.content)}
                              data-testid={`button-copy-${index}`}
                            >
                              <i className="fas fa-copy"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start" data-testid="typing-indicator">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-green to-cyber-cyan flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-robot text-xs text-deep-space"></i>
                  </div>
                  <div className="glass-effect rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-typing"></div>
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-typing" style={{animationDelay: "0.2s"}}></div>
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-typing" style={{animationDelay: "0.4s"}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="glass-effect border-t border-gray-700/30 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message to Cyber AI..."
                  className="w-full glass-effect rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-neon-green resize-none max-h-32 scrollbar-hide bg-transparent"
                  rows={1}
                  maxLength={4000}
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-message"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="absolute right-3 bottom-3 w-8 h-8 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-neon-green hover:to-cyber-cyan rounded-full p-0 cyber-glow"
                  data-testid="button-send"
                  title="Send message (⏎)"
                >
                  <i className="fas fa-paper-plane text-sm text-white"></i>
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span className="text-gray-500">•</span>
                  <span>Press ⏎ to send, Shift+⏎ for new line</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  <span data-testid="text-character-count">{message.length}</span>/4000
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Creator Attribution */}
      <div className="text-center py-2 text-xs text-gray-500 border-t border-gray-700/20">
        <span className="gradient-text font-medium">Created by Maruf</span> • 
        <span>Powered by Google Gemini 1.5</span>
      </div>
    </div>
  );
}
