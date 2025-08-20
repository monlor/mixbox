import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface InstallModalProps {
  app: any;
  onClose: () => void;
}

const installSchema = z.object({
  serviceName: z.string().min(1, "服务名称不能为空"),
  domain: z.string().min(1, "域名不能为空"),
  autoStart: z.boolean(),
});

export default function InstallModal({ app, onClose }: InstallModalProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof installSchema>>({
    resolver: zodResolver(installSchema),
    defaultValues: {
      serviceName: app.name,
      domain: `${app.name}.mixbox.com`,
      autoStart: true,
    },
  });

  const installMutation = useMutation({
    mutationFn: async (data: z.infer<typeof installSchema>) => {
      await apiRequest("POST", `/api/applications/${app.id}/install`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "安装成功",
        description: `${app.displayName} 已成功安装`,
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
        title: "安装失败",
        description: "无法安装应用，请重试",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof installSchema>) => {
    installMutation.mutate(data);
  };

  const getIconClass = () => {
    switch (app.category) {
      case 'monitoring':
        return 'fas fa-chart-line text-purple-500';
      case 'dev-tools':
        return 'fas fa-code text-green-500';
      case 'database':
        return 'fas fa-database text-red-500';
      case 'network-tools':
        return 'fas fa-rss text-orange-500';
      default:
        return 'fas fa-cube text-gray-500';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>安装应用: {app.displayName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* App Info */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <i className={`${getIconClass()} text-2xl`}></i>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{app.displayName}</h4>
              <p className="text-sm text-gray-600 mt-1">{app.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>版本: {app.version}</span>
                <span>大小: ~估算中</span>
              </div>
            </div>
          </div>

          {/* Installation Options */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="serviceName">服务名称</Label>
              <Input
                id="serviceName"
                {...form.register('serviceName')}
                className="mt-1"
              />
              {form.formState.errors.serviceName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.serviceName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="domain">域名配置</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="domain"
                  {...form.register('domain')}
                  className="flex-1"
                />
              </div>
              {form.formState.errors.domain && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.domain.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoStart"
                checked={form.watch('autoStart')}
                onCheckedChange={(checked) => form.setValue('autoStart', !!checked)}
              />
              <Label htmlFor="autoStart" className="text-sm">安装后自动启动服务</Label>
            </div>
          </form>

          {/* Dependencies */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">依赖服务</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Docker 运行时</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  已就绪
                </Badge>
              </div>
              {app.category === 'monitoring' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">数据持久化存储</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    自动配置
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={installMutation.isPending}
            className="px-6"
          >
            <i className="fas fa-download mr-2"></i>
            {installMutation.isPending ? '安装中...' : '开始安装'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
