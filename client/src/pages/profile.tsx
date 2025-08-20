import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="个人中心" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl w-full">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">个人中心</h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Profile Info */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">账户信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0 sm:pt-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
                      <AvatarImage src={(user as any)?.profileImageUrl} />
                      <AvatarFallback>
                        <i className="fas fa-user text-lg sm:text-2xl text-gray-600"></i>
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {(user as any)?.firstName && (user as any)?.lastName 
                          ? `${(user as any).firstName} ${(user as any).lastName}` 
                          : (user as any)?.email || 'User'}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{(user as any)?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm">名字</Label>
                      <Input
                        id="firstName"
                        value={(user as any)?.firstName || ''}
                        readOnly
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm">姓氏</Label>
                      <Input
                        id="lastName"
                        value={(user as any)?.lastName || ''}
                        readOnly
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email" className="text-sm">邮箱</Label>
                      <Input
                        id="email"
                        value={(user as any)?.email || ''}
                        readOnly
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">账户操作</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 sm:pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm text-gray-600">
                      您的账户通过 Replit 进行管理。要修改个人信息，请访问您的 Replit 个人资料设置。
                    </p>
                    <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      退出登录
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">系统信息</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 sm:pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-xs sm:text-sm text-gray-600">MixBox 版本</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900">v1.0.0</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-xs sm:text-sm text-gray-600">用户 ID</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 font-mono break-all">
                        {(user as any)?.id || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-xs sm:text-sm text-gray-600">注册时间</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('zh-CN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
