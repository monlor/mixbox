import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navigation = [
  { name: '首页', href: '/', icon: 'fas fa-th-large', current: true },
  { name: '应用市场', href: '/marketplace', icon: 'fas fa-store', current: false },
  { name: '插件设置', href: '/settings', icon: 'fas fa-cog', current: false },
  { name: '个人中心', href: '/profile', icon: 'fas fa-user', current: false },
];

export function MobileSidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-cube text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">MixBox</span>
          </div>
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
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
        <div className="mt-auto">
          <div className="flex items-center space-x-3 p-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-gray-600 text-sm"></i>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">admin</div>
              <div className="text-xs text-gray-500">管理员</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}