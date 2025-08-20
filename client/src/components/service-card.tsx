import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DeleteServiceDialog } from "@/components/delete-service-dialog";
import { 
  Play, 
  Square, 
  Trash2, 
  FileText, 
  Activity, 
  Clock, 
  Loader2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Pause
} from "lucide-react";

interface ServiceCardProps {
  service: any;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { toast } = useToast();
  const [showLogs, setShowLogs] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const startMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/services/${service.id}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "服务已启动",
        description: `${service.displayName} 正在启动中...`,
      });
    },
    onError: handleError,
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/services/${service.id}/stop`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "服务已停止",
        description: `${service.displayName} 已成功停止`,
      });
    },
    onError: handleError,
  });

  // Remove the removeMutation from here as it's now handled in DeleteServiceDialog

  function handleError(error: Error) {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    toast({
      title: "操作失败",
      description: "服务操作失败，请重试",
      variant: "destructive",
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'stopped':
        return <Pause className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'stopped':
        return '已停止';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  const isLoading = startMutation.isPending || stopMutation.isPending;

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4" 
            style={{ borderLeftColor: service.status === 'running' ? '#10b981' : '#6b7280' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)} animate-pulse`} />
              <div>
                <h3 className="font-semibold text-lg">{service.displayName}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(service.status)}
              <Badge variant={service.status === 'running' ? 'default' : 'secondary'}>
                {getStatusText(service.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">端口:</span>
              <div className="font-medium">{service.port}</div>
            </div>
            <div>
              <span className="text-gray-500">版本:</span>
              <div className="font-medium">v{service.version}</div>
            </div>
            <div>
              <span className="text-gray-500">域名:</span>
              <div className="font-medium text-blue-600">
                <a href={`http://${service.domain}`} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center hover:underline">
                  {service.domain}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
            <div>
              <span className="text-gray-500">运行时间:</span>
              <div className="font-medium">
                {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : '-'}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {service.status === 'running' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => stopMutation.mutate()}
                  disabled={isLoading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {stopMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span className="ml-1">停止</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => startMutation.mutate()}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {startMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span className="ml-1">启动</span>
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLogs(true)}
              >
                <FileText className="w-4 h-4" />
                <span className="ml-1">日志</span>
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="sm:max-w-[700px] sm:max-h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {service.displayName} - 服务日志
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                <span className="text-sm font-medium">状态: {getStatusText(service.status)}</span>
              </div>
              <Badge variant="outline">实时日志</Badge>
            </div>
            
            <ScrollArea className="h-[400px] w-full border rounded p-4 bg-gray-50 font-mono text-sm">
              <ServiceLogs serviceId={service.id} />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteServiceDialog
        service={service}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}

// Service Logs Component
function ServiceLogs({ serviceId }: { serviceId: string }) {
  // This would normally use a real-time connection or polling
  // For now, we'll use a simple query that refetches periodically
  const { data: logs = [] } = useQuery({
    queryKey: [`/api/services/${serviceId}/logs`],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const logArray = Array.isArray(logs) ? logs : [];

  if (!logArray.length) {
    return <div className="text-gray-500">暂无日志数据</div>;
  }

  return (
    <div className="space-y-1">
      {logArray.map((log: string, index: number) => (
        <div key={index} className="text-xs break-words">
          {log}
        </div>
      ))}
    </div>
  );
}