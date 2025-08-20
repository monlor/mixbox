import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteServiceDialogProps {
  service: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteServiceDialog({ service, open, onOpenChange }: DeleteServiceDialogProps) {
  const { toast } = useToast();
  const [deleteData, setDeleteData] = useState(false);

  const removeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/services/${service.id}`, {
        deleteData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "服务已删除",
        description: `${service.displayName} 已从系统中移除${deleteData ? '，相关数据已清除' : '，数据已保留'}`,
      });
      onOpenChange(false);
      setDeleteData(false); // Reset checkbox state
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
        title: "删除失败",
        description: "服务删除失败，请重试",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    removeMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            确认删除服务
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              您即将删除服务 <span className="font-semibold text-gray-900">{service?.displayName}</span>。
              此操作无法撤销。
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="font-medium text-yellow-800">删除影响：</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Docker 容器将被停止并移除</li>
                    <li>• 服务将从 MixBox 管理界面中消失</li>
                    <li>• 相关网络配置将被清理</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="delete-data"
                checked={deleteData}
                onCheckedChange={(checked) => setDeleteData(checked === true)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="delete-data"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  同时删除相关数据
                </Label>
                <p className="text-xs text-gray-500">
                  勾选此项将删除 Docker 卷和持久化数据。不勾选则保留数据以备将来恢复。
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={removeMutation.isPending}
            onClick={() => setDeleteData(false)}
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={removeMutation.isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {removeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                删除中...
              </>
            ) : (
              <>
                确认删除
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}