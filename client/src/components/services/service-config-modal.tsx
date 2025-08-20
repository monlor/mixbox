import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { parseYamlConfig, generateDockerCompose } from "@/lib/yaml";

interface ServiceConfigModalProps {
  service: any;
  onClose: () => void;
}

const configSchema = z.object({
  name: z.string().min(1, "服务名称不能为空"),
  displayName: z.string().min(1, "显示名称不能为空"),
  domain: z.string().min(1, "域名不能为空"),
  port: z.number().min(1, "端口必须大于0"),
  description: z.string().optional(),
});

export default function ServiceConfigModal({ service, onClose }: ServiceConfigModalProps) {
  const { toast } = useToast();
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [volumes, setVolumes] = useState<{ container: string; host: string }[]>([]);
  const [dockerCompose, setDockerCompose] = useState("");

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: service.name,
      displayName: service.displayName,
      domain: service.domain || '',
      port: service.port || 80,
      description: service.description || '',
    },
  });

  useEffect(() => {
    // Parse existing configuration
    if (service.config) {
      const config = typeof service.config === 'string' ? JSON.parse(service.config) : service.config;
      if (config.env) {
        const envArray = Object.entries(config.env).map(([key, value]) => ({ key, value: String(value) }));
        setEnvVars(envArray);
      }
      if (config.volumes) {
        setVolumes(config.volumes.map((vol: string) => {
          const [host, container] = vol.split(':');
          return { container, host };
        }));
      }
    }

    // Generate initial docker compose
    updateDockerCompose();
  }, [service]);

  const updateDockerCompose = () => {
    const config = {
      image: service.image || 'nginx:latest',
      port: form.getValues('port'),
      env: envVars.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
      volumes: volumes.map(({ container, host }) => `${host}:${container}`),
    };

    const compose = generateDockerCompose(config, form.getValues('name'));
    setDockerCompose(compose);
  };

  useEffect(() => {
    updateDockerCompose();
  }, [envVars, volumes, form.watch()]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/services/${service.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "配置已保存",
        description: "服务配置已成功更新",
      });
      onClose();
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
        title: "保存失败",
        description: "无法保存服务配置",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof configSchema>) => {
    const config = {
      env: envVars.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {}),
      volumes: volumes.map(({ container, host }) => `${host}:${container}`),
    };

    updateMutation.mutate({
      ...data,
      config,
      dockerCompose,
    });
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, key: string, value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index] = { key, value };
    setEnvVars(newEnvVars);
  };

  const addVolume = () => {
    setVolumes([...volumes, { container: '', host: '' }]);
  };

  const removeVolume = (index: number) => {
    setVolumes(volumes.filter((_, i) => i !== index));
  };

  const updateVolume = (index: number, container: string, host: string) => {
    const newVolumes = [...volumes];
    newVolumes[index] = { container, host };
    setVolumes(newVolumes);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>配置服务: {service.displayName}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Form */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">基础配置</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">服务名称</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="displayName">显示名称</Label>
                  <Input
                    id="displayName"
                    {...form.register('displayName')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="domain">域名</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="domain"
                      {...form.register('domain')}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="port">端口</Label>
                  <Input
                    id="port"
                    type="number"
                    {...form.register('port', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">环境变量</h4>
              <div className="space-y-3">
                {envVars.map((env, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="变量名"
                      value={env.key}
                      onChange={(e) => updateEnvVar(index, e.target.value, env.value)}
                      className="flex-1 text-sm"
                    />
                    <span className="text-gray-400">=</span>
                    <Input
                      placeholder="值"
                      value={env.value}
                      onChange={(e) => updateEnvVar(index, env.key, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeEnvVar(index)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEnvVar}
                  className="text-primary hover:text-blue-600"
                >
                  <i className="fas fa-plus mr-1"></i>
                  添加环境变量
                </Button>
              </div>
            </div>

            {/* Volumes */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">存储卷</h4>
              <div className="space-y-3">
                {volumes.map((volume, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="容器路径"
                      value={volume.container}
                      onChange={(e) => updateVolume(index, e.target.value, volume.host)}
                      className="flex-1 text-sm"
                    />
                    <span className="text-gray-400">:</span>
                    <Input
                      placeholder="主机路径"
                      value={volume.host}
                      onChange={(e) => updateVolume(index, volume.container, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeVolume(index)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVolume}
                  className="text-primary hover:text-blue-600"
                >
                  <i className="fas fa-plus mr-1"></i>
                  添加存储卷
                </Button>
              </div>
            </div>
          </div>

          {/* Docker Compose Preview */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Docker Compose 预览</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto min-h-[400px]">
              <pre>{dockerCompose}</pre>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
