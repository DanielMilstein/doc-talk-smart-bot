
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // You can change this to any highlight.js theme
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceInfo, EnhancedInfo } from "@/services/apiClient";
import { Brain, Clock, Tag, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DebugSettings } from "./DebugPanel";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  sources?: string[];
  enhancedInfo?: EnhancedInfo;
}

interface ChatMessageProps {
  message: Message;
  debugSettings?: DebugSettings;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, debugSettings }) => {
  const isUser = message.role === "user";
  const [showConfidenceDetails, setShowConfidenceDetails] = React.useState(false);
  
  const getConfidenceBadgeVariant = (level?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
      case 'very_low':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getConfidenceLabel = (level?: string): string => {
    switch (level) {
      case 'high':
        return 'Alta confianza';
      case 'medium':
        return 'Confianza media';
      case 'low':
        return 'Baja confianza';
      case 'very_low':
        return 'Muy baja confianza';
      default:
        return 'Sin evaluar';
    }
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className={isUser ? "bg-primary" : "bg-muted"}>
        <AvatarFallback>{isUser ? "U" : "AI"}</AvatarFallback>
      </Avatar>

      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div className="message-content prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            // For user messages, keep simple formatting
            message.content.split("\n").map((line, i) => (
              <p key={i} className="mb-2 last:mb-0">{line || <br />}</p>
            ))
          ) : (
            // For assistant messages, render markdown
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom components for better styling
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-3 mt-4 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-border pl-4 my-3 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                code: (props) => {
                  // ReactMarkdown passes 'inline' as a boolean prop for code blocks
                  const { inline, children, className, ...rest } = props as { inline?: boolean; children: React.ReactNode; className?: string };
                  if (inline) {
                    return (
                      <code 
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" 
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code 
                      className={`block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto ${className}`} 
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-3">
                    <table className="min-w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-3 py-2 bg-muted font-medium text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-3 py-2">
                    {children}
                  </td>
                ),
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        
        {/* Debug Information */}
        {!isUser && message.enhancedInfo && debugSettings && (
          <div className="mt-3 space-y-2">
            {/* Confidence Badge */}
            {debugSettings.showConfidence && message.enhancedInfo.confidence && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getConfidenceBadgeVariant(message.enhancedInfo.confidence.level)}
                  className="text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  {getConfidenceLabel(message.enhancedInfo.confidence.level)}
                  {' '}({Math.round(message.enhancedInfo.confidence.score * 100)}%)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
                  className="h-6 w-6 p-0"
                >
                  {showConfidenceDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </div>
            )}
            
            {/* Confidence Details */}
            {showConfidenceDetails && message.enhancedInfo.confidence && (
              <Card className="mt-2">
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs">{message.enhancedInfo.confidence.explanation}</p>
                  {message.enhancedInfo.confidence.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Recomendaciones:</p>
                      <ul className="text-xs space-y-1">
                        {message.enhancedInfo.confidence.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Query Analysis */}
            {debugSettings.showQueryAnalysis && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  Tipo: {message.enhancedInfo.query_type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Complejidad: {Math.round(message.enhancedInfo.complexity_score * 100)}%
                </Badge>
                {message.enhancedInfo.is_follow_up && (
                  <Badge variant="secondary" className="text-xs">
                    Pregunta de seguimiento
                  </Badge>
                )}
              </div>
            )}
            
            {/* Processing Time */}
            {debugSettings.showProcessingTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Procesado en {message.enhancedInfo.processing_time.toFixed(2)}s</span>
              </div>
            )}
            
            {/* Memory Context */}
            {debugSettings.showMemoryContext && message.enhancedInfo.conversation_context && (
              <div className="text-xs text-muted-foreground">
                <p>Contexto de memoria: {message.enhancedInfo.conversation_context.total_turns} turnos</p>
                {message.enhancedInfo.conversation_context.has_summary && (
                  <p>Conversación resumida disponible</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Fuentes:</p>
            <div className="space-y-1">
              {message.sources.map((source, index) => {
                const match = source.match(/^url:\s*(.*?),\s*title:\s*(.*)$/);
                const url = match?.[1] || source;
                const title = match?.[2] || "Fuente";
                return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary/80 underline block"
                >
                  {title}
                </a>
              )})}
            </div>
          </div>
        )}
        
        <div className="text-xs mt-2 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
