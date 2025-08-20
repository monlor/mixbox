import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdvancedConfig } from "@/components/advanced-config";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import yaml from 'js-yaml';

interface EnhancedInstallModalProps {
  app: any;
  onClose: () => void;
}

export function EnhancedInstallModal({ app, onClose }: EnhancedInstallModalProps) {
  const { toast } = useToast();
  const [customEnvVars, setCustomEnvVars] = useState<Record<string, string>>({});

  // Extract default environment variables from YAML
  const getDefaultEnvVars = () => {
    try {
      const yamlData = yaml.load(app.yaml) as any;
      if (yamlData?.services) {
        const firstService = Object.values(yamlData.services)[0] as any;
        return firstService?.environment || {};
      }
      return {};
    } catch (error) {
      console.error('Error parsing YAML:', error);
      return {};
    }
  };

  const installMutation = useMutation({
    mutationFn: async () => {
      // Merge default env vars with custom ones
      const finalEnvVars = {
        ...getDefaultEnvVars(),
        ...customEnvVars
      };

      return await apiRequest("POST", `/api/applications/${app.id}/install`, {
        customEnvVars: finalEnvVars
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      
      toast({
        title: app.isInstalled && app.hasUpdate ? "更新成功" : "安装成功",
        description: `${app.displayName} ${app.isInstalled && app.hasUpdate ? '已更新到最新版本' : '已成功安装'}`,
      });
      onClose();
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
        title: app.isInstalled && app.hasUpdate ? "更新失败" : "安装失败",
        description: `无法${app.isInstalled && app.hasUpdate ? '更新' : '安装'} ${app.displayName}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">作者:</span>
          <div className="font-medium">{app.author}</div>
        </div>
        <div>
          <span className="text-gray-500">分类:</span>
          <div className="font-medium">
            {app.category === 'network-tools' ? '网络工具' :
             app.category === 'monitoring' ? '监控' :
             app.category === 'database' ? '数据库' :
             app.category === 'dev-tools' ? '开发工具' : '其他'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">主端口:</span>
          <div className="font-medium">{app.port}</div>
        </div>
        <div>
          <span className="text-gray-500">GitHub Stars:</span>
          <div className="font-medium">⭐ {app.stars?.toLocaleString() || 0}</div>
        </div>
      </div>

      {app.website && (
        <div className="text-sm">
          <span className="text-gray-500">官网:</span>
          <a 
            href={app.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            {app.website}
          </a>
        </div>
      )}

      <Separator />

      {/* Advanced Configuration */}
      <AdvancedConfig
        defaultEnvVars={getDefaultEnvVars()}
        onEnvVarsChange={setCustomEnvVars}
      />

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-500">
          {app.isInstalled && app.hasUpdate ? 
            '更新不会丢失现有数据和配置' : 
            '服务将使用 mixbox 网络部署'
          }
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={installMutation.isPending}
          >
            取消
          </Button>
          <Button
            onClick={() => installMutation.mutate()}
            disabled={installMutation.isPending}
          >
            {installMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {app.isInstalled && app.hasUpdate ? '更新中...' : '安装中...'}
              </>
            ) : (
              <>
                {app.isInstalled && app.hasUpdate ? (
                  <RefreshCw className="w-4 h-4 mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {app.isInstalled && app.hasUpdate ? '更新' : '安装'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}