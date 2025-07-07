import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Trash2, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Brain
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAllConversations, deleteConversation, generateConversationTitle } from "@/services/PDFService";
import { Conversation } from "@/services/apiClient";

interface ChatHistoryProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  currentConversationId?: string;
  refreshTrigger?: number; // Add a trigger to force refresh
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  isOpen,
  onToggle,
  onSelectConversation,
  onNewChat,
  currentConversationId,
  refreshTrigger
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // Reload conversations when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadConversations();
    }
  }, [refreshTrigger]);

  // Optional: Auto-refresh conversations every 30 seconds when sidebar is open
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      loadConversations();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    // Filter conversations based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter(conv => 
          (conv.title && conv.title.toLowerCase().includes(query)) ||
          formatDate(conv.updated_at).toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [conversations, searchQuery]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const convs = await getAllConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const success = await deleteConversation(conversationId);
      if (success) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        toast.success('Conversación eliminada');
        
        // If deleted conversation was current, trigger new chat
        if (conversationId === currentConversationId) {
          onNewChat();
        }
      } else {
        toast.error('Error al eliminar conversación');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error al eliminar conversación');
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const confirmDelete = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Hoy';
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return `${days} días`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const getConversationTitle = (conversation: Conversation): string => {
    return conversation.title || `Conversación ${formatDate(conversation.created_at)}`;
  };

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {};
    
    conversations.forEach(conv => {
      const date = new Date(conv.updated_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ayer';
      } else {
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
          groupKey = 'Esta semana';
        } else if (daysDiff < 30) {
          groupKey = 'Este mes';
        } else {
          groupKey = 'Más antiguas';
        }
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conv);
    });
    
    return groups;
  };

  const groupedConversations = groupConversationsByDate(filteredConversations);

  return (
    <>
      <div className={`
        fixed left-0 top-0 h-full bg-background border-r shadow-lg transform transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 max-w-[90vw] md:max-w-80
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Historial de Chat</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button onClick={onNewChat} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Conversación
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : Object.keys(groupedConversations).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay conversaciones</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {Object.entries(groupedConversations).map(([group, convs]) => {
                  const hasMemoryConversations = convs.some(conv => conv.message_count >= 5);
                  return (
                  <div key={group}>
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-2">
                      {group}
                      {hasMemoryConversations && (
                        <Brain className="h-3 w-3" title="Algunas conversaciones tienen memoria activa" />
                      )}
                    </h3>
                    <div className="space-y-1">
                      {convs.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`
                            group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                            ${conversation.id === currentConversationId 
                              ? 'bg-primary/10 border border-primary/20' 
                              : 'hover:bg-muted'
                            }
                          `}
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {getConversationTitle(conversation)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {conversation.message_count} mensajes
                              </Badge>
                              {conversation.message_count >= 5 && (
                                <Badge variant="outline" className="text-xs" title="Esta conversación tiene memoria activa">
                                  <Brain className="h-3 w-3 mr-1" />
                                  Memoria
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {formatDate(conversation.updated_at)}
                              </span>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(conversation.id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Toggle Button when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 shadow-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30" 
          onClick={onToggle}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la conversación y todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => conversationToDelete && handleDeleteConversation(conversationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatHistory;