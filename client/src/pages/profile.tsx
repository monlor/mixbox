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
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="个人中心" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">个人中心</h2>

            <div className="space-y-6">
              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle>账户信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback>
                        <i className="fas fa-user text-2xl text-gray-600"></i>
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user?.email || 'User'}
                      </h4>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">名字</Label>
                      <Input
                        id="firstName"
                        value={user?.firstName || ''}
                        readOnly
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">姓氏</Label>
                      <Input
                        id="lastName"
                        value={user?.lastName || ''}
                        readOnly
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        readOnly
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>账户操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      您的账户通过 Replit 进行管理。要修改个人信息，请访问您的 Replit 个人资料设置。
                    </p>
                    <Button onClick={handleLogout} variant="outline">
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      退出登录
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Info */}
              <Card>
                <CardHeader>
                  <CardTitle>系统信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">MixBox 版本</span>
                      <span className="text-sm font-medium text-gray-900">v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">用户 ID</span>
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {user?.id || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">注册时间</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : 'N/A'}
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
