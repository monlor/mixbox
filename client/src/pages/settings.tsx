import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RefreshCw, Globe, ExternalLink } from "lucide-react";

const settingsSchema = z.object({
  dockerSocket: z.string().min(1, "Docker Socket 路径不能为空"),
  defaultDomain: z.string().min(1, "默认域名不能为空"),
  sslEnabled: z.boolean(),
  githubRepo: z.string().url("请输入有效的 GitHub 仓库地址"),
  updateFrequency: z.enum(["manual", "daily", "weekly", "monthly"]),
});

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
    retry: false,
    meta: {
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
      },
    },
  });

  // 查询代理规则
  const { data: proxyRules, isLoading: proxyLoading } = useQuery({
    queryKey: ["/api/proxy/rules"],
    retry: false,
  });

  // 刷新代理规则的变更
  const refreshProxyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/proxy/refresh");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/rules"] });
      toast({
        title: "代理规则已刷新",
        description: "代理状态已同步更新",
      });
    },
    onError: () => {
      toast({
        title: "刷新失败",
        description: "无法刷新代理规则，请重试",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      dockerSocket: "/var/run/docker.sock",
      defaultDomain: "mixbox.com",
      sslEnabled: true,
      githubRepo: "https://github.com/monlor/mixbox",
      updateFrequency: "daily",
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        dockerSocket: settings.dockerSocket,
        defaultDomain: settings.defaultDomain,
        sslEnabled: settings.sslEnabled,
        githubRepo: settings.githubRepo,
        updateFrequency: settings.updateFrequency,
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => {
      await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "设置已保存",
        description: "您的设置已成功更新",
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
        title: "保存失败",
        description: "无法保存设置，请重试",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="插件设置" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl w-full">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">插件设置</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Docker Settings */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-base sm:text-lg">Docker 配置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0 sm:pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={form.control}
                        name="dockerSocket"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Docker Socket 路径</FormLabel>
                            <FormControl>
                              <Input placeholder="/var/run/docker.sock" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <Label className="text-sm font-medium text-gray-700">连接状态</Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">已连接</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Domain Settings */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-base sm:text-lg">域名配置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0 sm:pt-0">
                    <FormField
                      control={form.control}
                      name="defaultDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>默认域名</FormLabel>
                          <FormControl>
                            <Input placeholder="mixbox.com" {...field} />
                          </FormControl>
                          <p className="text-sm text-gray-500">服务将自动分配子域名，如: service.mixbox.com</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sslEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>启用自动 SSL 证书</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Repository Settings */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-base sm:text-lg">仓库配置</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0 sm:pt-0">
                    <FormField
                      control={form.control}
                      name="githubRepo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub 仓库地址</FormLabel>
                          <FormControl>
                            <Input placeholder="https://github.com/monlor/mixbox" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="updateFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>更新频率</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择更新频率" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="manual">手动更新</SelectItem>
                              <SelectItem value="daily">每日</SelectItem>
                              <SelectItem value="weekly">每周</SelectItem>
                              <SelectItem value="monthly">每月</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Proxy Management */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        内置代理管理
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => refreshProxyMutation.mutate()}
                        disabled={refreshProxyMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshProxyMutation.isPending ? 'animate-spin' : ''}`} />
                        刷新
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="font-medium text-gray-700">代理状态</Label>
                          <div className="flex items-center space-x-2 pt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">运行中</span>
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium text-gray-700">活跃规则</Label>
                          <p className="text-gray-600 pt-1">{proxyRules?.length || 0} 个</p>
                        </div>
                        <div>
                          <Label className="font-medium text-gray-700">默认域名</Label>
                          <p className="text-gray-600 pt-1">{settings?.defaultDomain || 'mixbox.local'}</p>
                        </div>
                      </div>

                      {proxyRules && proxyRules.length > 0 ? (
                        <div className="space-y-2">
                          <Label className="font-medium text-gray-700">自动分配的子域名</Label>
                          <div className="grid gap-2 max-h-48 overflow-y-auto">
                            {proxyRules.map((rule: any) => (
                              <div key={rule.subdomain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div>
                                    <p className="font-medium text-sm text-gray-900">{rule.serviceName}</p>
                                    <p className="text-xs text-gray-500">→ {rule.target}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-mono text-blue-600">
                                    {rule.subdomain}.{settings?.defaultDomain || 'mixbox.local'}
                                  </span>
                                  <a
                                    href={`http://${rule.subdomain}.${settings?.defaultDomain || 'mixbox.local'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>暂无代理规则</p>
                          <p className="text-sm">启动服务后会自动创建子域名</p>
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <Label className="font-medium text-gray-700">代理状态页面</Label>
                        <p className="text-sm text-gray-500 mb-2">查看详细的代理状态和规则</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/proxy/status', '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          打开状态页面
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto px-6"
                  >
                    <i className="fas fa-save mr-2"></i>
                    {updateMutation.isPending ? '保存中...' : '保存设置'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </div>
  );
}
