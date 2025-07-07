
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
        <div className="message-content">
          {message.content.split("\n").map((line, i) => (
            <p key={i}>{line || <br />}</p>
          ))}
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
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline block"
                >
                  {source}
                </a>
              ))}
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
