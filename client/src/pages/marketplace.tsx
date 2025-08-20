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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [selectedApp, setSelectedApp] = useState(null);

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

  const filteredApps = applications?.filter((app: any) => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="应用市场" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">应用市场</h2>
                <p className="text-gray-600">从 GitHub 仓库加载的可安装应用</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  {syncMutation.isPending ? '同步中...' : '刷新'}
                </Button>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="搜索应用..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">分类:</span>
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Applications Grid */}
          {appsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="p-6">
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
                  {applications?.length === 0 ? '暂无应用' : '未找到匹配的应用'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {applications?.length === 0 
                    ? '点击刷新按钮从 GitHub 同步应用列表' 
                    : '尝试更改搜索条件或分类'}
                </p>
                {applications?.length === 0 && (
                  <Button onClick={() => syncMutation.mutate()}>
                    同步应用列表
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredApps.map((app: any) => (
                <AppCard 
                  key={app.id} 
                  app={app} 
                  onInstall={(app) => setSelectedApp(app)} 
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Install Modal */}
      {selectedApp && (
        <InstallModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
