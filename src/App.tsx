import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Stethoscope, 
  AlertTriangle, 
  Bot, 
  User, 
  Settings,
  Shield,
  Heart,
  Zap,
  Download,
  BookOpen,
  Baby
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { showInstallPrompt, isInstallable, isInstalled } from "@/utils/pwa";
import { usePediatricKnowledge } from "@/hooks/usePediatricKnowledge";
import { 
  enhancePromptWithPediatricKnowledge, 
  extractMedicalKeywords, 
  isPediatricQuery,
  pediatricQuickPrompts 
} from "@/utils/pediatric-ai-integration";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ApiError {
  message: string;
  type: 'network' | 'api' | 'validation';
}

export default function MedAssistApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m MedAssist AI, your medical information assistant. I can help you with general medical questions, symptoms, and health information. Please note that I provide educational information only and cannot replace professional medical advice.',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);

  // Update welcome message when pediatric mode changes
  useEffect(() => {
    if (pediatricMode && isSupabaseEnabled) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[0] = {
          id: '1',
          content: 'Hello! I\'m MedAssist AI in Pediatric Mode, powered by Nelson\'s Textbook of Pediatrics. I can help you with pediatric medical questions, child health information, and age-specific medical guidance. Please note that I provide educational information only and cannot replace professional pediatric medical advice. Always consult with qualified pediatric healthcare professionals.',
          role: 'assistant',
          timestamp: new Date()
        };
        return newMessages;
      });
    } else {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[0] = {
          id: '1',
          content: 'Hello! I\'m MedAssist AI, your medical information assistant. I can help you with general medical questions, symptoms, and health information. Please note that I provide educational information only and cannot replace professional medical advice.',
          role: 'assistant',
          timestamp: new Date()
        };
        return newMessages;
      });
    }
  }, [pediatricMode, isSupabaseEnabled]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [pediatricMode, setPediatricMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { getRelatedContent, isSupabaseEnabled } = usePediatricKnowledge();

  useEffect(() => {
    // Check if app can be installed
    const checkInstallable = () => {
      if (isInstallable() && !isInstalled()) {
        setShowInstallBanner(true);
      }
    };
    
    // Check immediately and after a delay for better UX
    checkInstallable();
    setTimeout(checkInstallable, 2000);
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setShowInstallBanner(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('Please set your Gemini API key in settings');
    }

    // Get pediatric context if available and relevant
    let pediatricContext = undefined;
    if (isSupabaseEnabled && (pediatricMode || isPediatricQuery(userMessage))) {
      try {
        const keywords = extractMedicalKeywords(userMessage);
        if (keywords.length > 0) {
          pediatricContext = await getRelatedContent(keywords.join(' '), 3);
        }
      } catch (err) {
        console.warn('Failed to get pediatric context:', err);
      }
    }

    // Create enhanced prompt with pediatric knowledge
    const originalPrompt = `You are MedAssist AI, a helpful medical information assistant. Provide accurate, evidence-based medical information while always emphasizing that this is for educational purposes only and users should consult healthcare professionals for actual medical advice.

IMPORTANT DISCLAIMERS:
- This is for educational purposes only
- Always recommend consulting qualified healthcare professionals
- Do not provide specific diagnoses or treatment plans
- Emphasize emergency care when appropriate

User question: ${userMessage}`;

    const enhancedPrompt = enhancePromptWithPediatricKnowledge(
      originalPrompt,
      userMessage,
      pediatricContext
    );

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    try {
      const aiResponse = await callGeminiAPI(userMessage);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      let errorType: ApiError['type'] = 'api';
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        if (errorMessage.includes('fetch')) errorType = 'network';
        if (errorMessage.includes('API key')) errorType = 'validation';
      }
      
      setError({ message: errorMessage, type: errorType });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = pediatricMode ? pediatricQuickPrompts : [
    "What are the symptoms of dehydration?",
    "How to treat a minor cut?",
    "When should I see a doctor for a headache?",
    "What's the difference between cold and flu?"
  ];

  if (showSettings) {
    return (
      <div className="min-h-screen bg-background safe-top safe-bottom">
        <div className="container max-w-md mx-auto p-4">
          <Card className="mt-4">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Settings</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Gemini API Key</label>
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your free API key from Google AI Studio
                </p>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your API key is stored locally and never sent to our servers. It's only used to communicate directly with Google's Gemini API.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowSettings(false)} 
                  className="flex-1"
                  disabled={!apiKey}
                >
                  Save & Continue
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="container max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                {pediatricMode ? (
                  <Baby className="h-5 w-5 text-primary" />
                ) : (
                  <Stethoscope className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h1 className="font-semibold text-lg">
                  MedAssist AI {pediatricMode && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Pediatric
                    </Badge>
                  )}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {pediatricMode ? 'Pediatric Medical Assistant' : 'Medical Information Assistant'}
                  {isSupabaseEnabled && (
                    <span className="ml-1">
                      <BookOpen className="h-3 w-3 inline" />
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSupabaseEnabled && (
                <Button
                  variant={pediatricMode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPediatricMode(!pediatricMode)}
                  className="text-xs"
                >
                  <Baby className="h-4 w-4 mr-1" />
                  Pediatric
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Install Banner */}
      {showInstallBanner && (
        <div className="bg-primary/10 border-b border-border">
          <div className="container max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Install MedAssist AI</p>
                  <p className="text-xs text-muted-foreground">Get the app experience</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstall}>
                  Install
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowInstallBanner(false)}
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="container max-w-md mx-auto py-4 space-y-4">
          {/* Medical Disclaimer */}
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-sm">
              <strong>Medical Disclaimer:</strong> This AI provides educational information only. 
              Always consult healthcare professionals for medical advice, diagnosis, or treatment.
            </AlertDescription>
          </Alert>

          {!apiKey && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Required:</strong> Please configure your Gemini API key in settings to start chatting.
              </AlertDescription>
            </Alert>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 p-2 rounded-full ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <Card className={`flex-1 max-w-[85%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 opacity-70`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 p-2 rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="flex-1 max-w-[85%]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <Alert className="border-destructive bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription>
                <strong>Error:</strong> {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="container max-w-md mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80 px-3 py-1 text-xs"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-card/95 backdrop-blur-sm">
        <div className="container max-w-md mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={apiKey ? "Ask a medical question..." : "Configure API key first..."}
              disabled={isLoading || !apiKey}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading || !apiKey}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
