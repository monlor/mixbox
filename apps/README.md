# MixBox Applications

这个目录包含了MixBox平台支持的所有应用配置文件。每个YAML文件定义了一个应用的完整部署配置。

## 应用配置结构

每个应用的YAML文件包含以下部分：

### metadata（元数据）
- `id`: 应用唯一标识符
- `name`: 应用名称（用于容器和域名）
- `displayName`: 显示名称
- `description`: 应用描述
- `category`: 应用分类（network-tools, monitoring, database, dev-tools等）
- `version`: 版本号
- `stars`: GitHub星数
- `icon`: 图标URL
- `author`: 作者
- `website`: 官方网站

### spec（规格）
- `image`: Docker镜像
- `port`: 主要端口
- `ports`: 多端口配置（可选）
- `env`: 环境变量
- `volumes`: 数据卷挂载
- `command`: 启动命令（可选）
- `healthcheck`: 健康检查配置
- `privileged`: 特权模式（可选）

### services（服务定义）
完整的Docker Compose服务定义，包括：
- 镜像和容器配置
- 端口映射
- 环境变量
- 数据卷
- 网络配置
- Traefik标签（用于反向代理）

## 已支持的应用

- **RSSHub**: RSS聚合服务
- **Grafana**: 监控仪表板
- **Portainer**: Docker容器管理
- **Redis**: 内存数据库
- **Nginx**: Web服务器
- **Prometheus**: 监控系统

## 添加新应用

1. 在此目录创建新的YAML文件
2. 按照上述结构定义应用配置
3. 确保metadata中的id和name唯一
4. 测试配置的有效性

## 使用方式

在生产环境中，MixBox会从GitHub仓库动态获取这些配置文件。在开发模式下，直接从本地文件系统读取。