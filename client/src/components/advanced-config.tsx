import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EnvironmentVariable {
  key: string;
  value: string;
}

interface AdvancedConfigProps {
  defaultEnvVars: Record<string, string>;
  onEnvVarsChange: (envVars: Record<string, string>) => void;
}

export function AdvancedConfig({ defaultEnvVars, onEnvVarsChange }: AdvancedConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>(() => {
    return Object.entries(defaultEnvVars).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  });

  const addEnvVar = () => {
    const newEnvVars = [...envVars, { key: "", value: "" }];
    setEnvVars(newEnvVars);
  };

  const removeEnvVar = (index: number) => {
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars);
    updateParent(newEnvVars);
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', newValue: string) => {
    const newEnvVars = envVars.map((item, i) => 
      i === index ? { ...item, [field]: newValue } : item
    );
    setEnvVars(newEnvVars);
    updateParent(newEnvVars);
  };

  const updateParent = (newEnvVars: EnvironmentVariable[]) => {
    const envVarsObject = newEnvVars
      .filter(item => item.key.trim() !== '') // Only include non-empty keys
      .reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
    
    onEnvVarsChange(envVarsObject);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          type="button"
        >
          <span>高级配置</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">环境变量配置</Label>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={addEnvVar}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              添加变量
            </Button>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="space-y-3">
            {envVars.map((envVar, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="变量名"
                    value={envVar.key}
                    onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="变量值"
                    value={envVar.value}
                    onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeEnvVar(index)}
                  className="h-9 w-9 flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {envVars.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">暂无环境变量配置</p>
                <p className="text-xs">点击"添加变量"按钮开始配置</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">配置说明：</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>环境变量将传递给Docker容器</li>
            <li>变量名区分大小写，建议使用大写字母</li>
            <li>空白的变量名将被忽略</li>
            <li>修改后将覆盖默认配置</li>
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}