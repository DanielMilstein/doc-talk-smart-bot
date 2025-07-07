import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient, RagStats } from '@/services/apiClient';
import { RefreshCw, TrendingUp, BarChart3, Brain, Clock, AlertCircle, Database } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const RagStatistics: React.FC = () => {
  const [stats, setStats] = useState<RagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      const response = await apiClient.getRagStats();
      if (response.success && response.data) {
        setStats(response.data.rag_statistics);
      } else {
        setError('No se pudieron cargar las estadísticas RAG');
      }
    } catch (error) {
      console.error('Error loading RAG stats:', error);
      setError(`Error al cargar estadísticas RAG: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      toast.error('Error al cargar estadísticas RAG');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleReset = async () => {
    try {
      const response = await apiClient.resetRagStats();
      if (response.success) {
        toast.success('Estadísticas RAG reiniciadas');
        await loadStats();
      }
    } catch (error) {
      console.error('Error resetting RAG stats:', error);
      toast.error('Error al reiniciar estadísticas');
    }
    setShowResetDialog(false);
  };

  const getConfidencePercentage = (level: keyof RagStats['confidence_distribution']) => {
    if (!stats || stats.total_queries === 0) return 0;
    return Math.round((stats.confidence_distribution[level] / stats.total_queries) * 100);
  };

  const getQueryTypePercentage = (type: string) => {
    if (!stats || stats.total_queries === 0 || !stats.query_type_distribution) return 0;
    const count = stats.query_type_distribution[type] || 0;
    return Math.round((count / stats.total_queries) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error al cargar estadísticas RAG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas del Sistema RAG</h2>
          <p className="text-muted-foreground">
            Monitoreo de rendimiento y calidad del sistema de respuestas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowResetDialog(true)}
          >
            Reiniciar Estadísticas
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Consultas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_queries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Preguntas procesadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avg_processing_time?.toFixed(2) || '0.00'}s
            </div>
            <p className="text-xs text-muted-foreground">
              Por consulta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Confianza Alta
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getConfidencePercentage('high')}%
            </div>
            <p className="text-xs text-muted-foreground">
              De las respuestas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Distribución de Confianza
          </CardTitle>
          <CardDescription>
            Niveles de confianza en las respuestas generadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Alta</span>
                  <span>{stats.confidence_distribution.high} ({getConfidencePercentage('high')}%)</span>
                </div>
                <Progress value={getConfidencePercentage('high')} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Media</span>
                  <span>{stats.confidence_distribution.medium} ({getConfidencePercentage('medium')}%)</span>
                </div>
                <Progress value={getConfidencePercentage('medium')} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Baja</span>
                  <span>{stats.confidence_distribution.low} ({getConfidencePercentage('low')}%)</span>
                </div>
                <Progress value={getConfidencePercentage('low')} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Muy Baja</span>
                  <span>{stats.confidence_distribution.very_low} ({getConfidencePercentage('very_low')}%)</span>
                </div>
                <Progress value={getConfidencePercentage('very_low')} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Query Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tipos de Consultas
          </CardTitle>
          <CardDescription>
            Distribución por tipo de pregunta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && stats.query_type_distribution && Object.keys(stats.query_type_distribution).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.query_type_distribution).map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{type}</span>
                    <span>{count} ({getQueryTypePercentage(type)}%)</span>
                  </div>
                  <Progress value={getQueryTypePercentage(type)} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos de tipos de consultas disponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hybrid Search Information */}
      {stats?.hybrid_search && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Búsqueda Híbrida
            </CardTitle>
            <CardDescription>
              Configuración del sistema de búsqueda híbrida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Documentos en BM25</div>
                <div className="text-2xl font-bold">{stats.hybrid_search.bm25_documents.toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Método de Fusión</div>
                <div className="text-lg font-semibold capitalize">{stats.hybrid_search.config.fusion_method}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Peso de Palabras Clave</div>
                <div className="text-lg font-semibold">{Math.round(stats.hybrid_search.config.keyword_weight * 100)}%</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Peso Semántico</div>
                <div className="text-lg font-semibold">{Math.round(stats.hybrid_search.config.semantic_weight * 100)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reiniciar estadísticas RAG?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente todas las estadísticas actuales del sistema RAG. 
              Los contadores volverán a cero y se perderá el historial de métricas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RagStatistics;