import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: '首页', href: '/', icon: 'fas fa-th-large', current: true },
  { name: '应用市场', href: '/marketplace', icon: 'fas fa-store', current: false },
  { name: '插件设置', href: '/settings', icon: 'fas fa-cog', current: false },
  { name: '个人中心', href: '/profile', icon: 'fas fa-user', current: false },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-cube text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold text-gray-900">MixBox</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <i className={item.icon}></i>
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-gray-600 text-sm"></i>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">admin</div>
            <div className="text-xs text-gray-500">管理员</div>
          </div>
        </div>
      </div>
    </div>
  );
}
