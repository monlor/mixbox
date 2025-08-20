import { useQuery } from "@tanstack/react-query";
import { MobileSidebar } from "./mobile-sidebar";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
    retry: false,
  });

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MobileSidebar />
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Docker 已连接</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            <i className="fas fa-globe"></i>
            <span className="hidden md:inline">{(settings as any)?.defaultDomain || 'mixbox.com'}</span>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <i className="fas fa-bell"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
