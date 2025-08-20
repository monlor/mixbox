import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppCardProps {
  app: any;
  onInstall: (app: any) => void;
}

export default function AppCard({ app, onInstall }: AppCardProps) {
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

  const getCategoryColor = () => {
    switch (app.category) {
      case 'monitoring':
        return 'bg-purple-100 text-purple-800';
      case 'dev-tools':
        return 'bg-green-100 text-green-800';
      case 'database':
        return 'bg-red-100 text-red-800';
      case 'network-tools':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = () => {
    switch (app.category) {
      case 'monitoring':
        return '监控';
      case 'dev-tools':
        return '开发工具';
      case 'database':
        return '数据库';
      case 'network-tools':
        return '网络工具';
      default:
        return '其他';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <i className={`${getIconClass()} text-xl`}></i>
          </div>
          <Badge className={`text-xs ${getCategoryColor()}`}>
            {getCategoryName()}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2">{app.displayName}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{app.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <i className="fas fa-star text-yellow-400"></i>
            <span>{app.stars || '0'}</span>
          </div>
          <span>{app.version}</span>
        </div>

        {app.isInstalled ? (
          <Button className="w-full" variant="outline" disabled>
            <i className="fas fa-check mr-2"></i>
            已安装
          </Button>
        ) : (
          <Button className="w-full" onClick={() => onInstall(app)}>
            <i className="fas fa-download mr-2"></i>
            安装
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
