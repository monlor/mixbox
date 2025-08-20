import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ServiceConfigModal from "./service-config-modal";

interface ServiceCardProps {
  service: any;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { toast } = useToast();
  const [showConfig, setShowConfig] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      await apiRequest("PUT", `/api/services/${service.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "服务已更新",
        description: `${service.displayName} 状态已更新`,
      });
    },
    onError: (error: Error) => {
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
        title: "更新失败",
        description: "无法更新服务状态",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/services/${service.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "服务已删除",
        description: `${service.displayName} 已成功删除`,
      });
    },
    onError: (error: Error) => {
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
        title: "删除失败",
        description: "无法删除服务",
        variant: "destructive",
      });
    },
  });

  const handleStart = () => {
    updateMutation.mutate({ status: 'running' });
  };

  const handleStop = () => {
    updateMutation.mutate({ status: 'stopped' });
  };

  const handleDelete = () => {
    if (confirm(`确定要删除服务 ${service.displayName} 吗？`)) {
      deleteMutation.mutate();
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'stopped':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
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

  const getIconClass = () => {
    if (service.name.includes('rsshub')) return 'fas fa-rss text-orange-500';
    if (service.name.includes('tools')) return 'fas fa-tools text-blue-500';
    if (service.name.includes('redis')) return 'fas fa-database text-red-500';
    if (service.name.includes('grafana')) return 'fas fa-chart-line text-purple-500';
    return 'fas fa-cube text-gray-500';
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${service.status === 'stopped' ? 'opacity-60' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className={`${getIconClass()} text-xl`}></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{service.displayName}</h3>
                <p className="text-sm text-gray-500">{service.domain}</p>
              </div>
            </div>
            <Badge variant={getStatusVariant(service.status)}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                service.status === 'running' ? 'bg-green-500' : 
                service.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              {getStatusText(service.status)}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{service.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>端口: <span className="font-medium">{service.port || 'N/A'}</span></span>
            <span>状态: <span className="font-medium">{getStatusText(service.status)}</span></span>
          </div>

          <div className="flex items-center space-x-2">
            {service.status === 'stopped' ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStart}
                disabled={updateMutation.isPending}
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
              >
                <i className="fas fa-play mr-1"></i>
                启动
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStop}
                disabled={updateMutation.isPending}
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <i className="fas fa-stop mr-1"></i>
                停止
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowConfig(true)}
            >
              <i className="fas fa-cog mr-1"></i>
              配置
            </Button>
            {service.status === 'running' && service.domain && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(`https://${service.domain}`, '_blank')}
              >
                <i className="fas fa-external-link-alt"></i>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        </CardContent>
      </Card>

      {showConfig && (
        <ServiceConfigModal
          service={service}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
}
