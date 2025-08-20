import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AppCard from "@/components/marketplace/app-card";
import InstallModal from "@/components/marketplace/install-modal";
import { AdvancedConfig } from "@/components/advanced-config";
import { EnhancedInstallModal } from "@/components/enhanced-install-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const categories = [
  { id: 'all', name: '全部' },
  { id: 'dev-tools', name: '开发工具' },
  { id: 'database', name: '数据库' },
  { id: 'monitoring', name: '监控' },
  { id: 'network-tools', name: '网络工具' },
];

export default function Marketplace() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);

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

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["/api/applications"],
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

  const syncMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/applications/sync");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "同步成功",
        description: "已从 GitHub 同步最新应用列表",
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
        title: "同步失败",
        description: "无法从 GitHub 同步应用列表",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredApps = (applications as any[])?.filter((app: any) => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="应用市场" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">应用市场</h2>
                <p className="text-gray-600 text-sm sm:text-base">从 GitHub 仓库加载的可安装应用</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="搜索应用..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  {syncMutation.isPending ? '同步中...' : '刷新'}
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-700 mb-3 block">分类:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs sm:text-sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Applications Grid */}
          {appsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="p-4 sm:p-6">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredApps.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-store text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {(applications as any[])?.length === 0 ? '暂无应用' : '未找到匹配的应用'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {(applications as any[])?.length === 0 
                    ? '点击刷新按钮从 GitHub 同步应用列表' 
                    : '尝试更改搜索条件或分类'}
                </p>
                {(applications as any[])?.length === 0 && (
                  <Button onClick={() => syncMutation.mutate()}>
                    同步应用列表
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredApps.map((app: any) => (
                <Card key={app.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {app.icon ? (
                          <img 
                            src={app.icon} 
                            alt={app.displayName}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-icon.svg';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-cube text-gray-500"></i>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.displayName}</h3>
                          <p className="text-xs text-gray-500">{app.author}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {app.isInstalled && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已安装
                          </Badge>
                        )}
                        {app.hasUpdate && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            有更新
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>⭐ {app.stars?.toLocaleString() || 0}</span>
                      <span>端口: {app.port}</span>
                      <span>v{app.version}</span>
                    </div>
                    
                    {app.isInstalled && app.hasUpdate ? (
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedApp(app)}
                        variant="outline"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        更新
                      </Button>
                    ) : app.isInstalled ? (
                      <Button className="w-full" disabled variant="secondary">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        已安装
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedApp(app)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        安装
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Install/Update Modal */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedApp.icon && (
                  <img 
                    src={selectedApp.icon} 
                    alt={selectedApp.displayName}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                {selectedApp.isInstalled && selectedApp.hasUpdate ? '更新' : '安装'} {selectedApp.displayName}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{selectedApp.displayName}</h4>
                  <p className="text-sm text-gray-600">{selectedApp.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">v{selectedApp.version}</div>
                  {selectedApp.isInstalled && selectedApp.installedVersion && (
                    <div className="text-xs text-gray-500">
                      当前: v{selectedApp.installedVersion}
                    </div>
                  )}
                </div>
              </div>
              
              <EnhancedInstallModal 
                app={selectedApp}
                onClose={() => setSelectedApp(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
