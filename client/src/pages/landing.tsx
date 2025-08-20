import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-cube text-white text-xl"></i>
            </div>
            <span className="text-3xl font-bold text-gray-900">MixBox</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Docker 服务管理平台
          </h1>
          <p className="text-gray-600">
            简单、直观的 Docker 服务管理工具，专为小白和 NAS 用户设计
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>开始使用</CardTitle>
            <CardDescription>
              登录后即可管理您的 Docker 服务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>一键安装服务</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>应用市场</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>YAML 配置</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>域名管理</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/api/login'}
              >
                登录开始使用
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>支持主流 Docker 服务，简单配置即可使用</p>
        </div>
      </div>
    </div>
  );
}
