// Alist配置
export const config = {
  // Alist服务器基础URL
  baseUrl: process.env.NEXT_PUBLIC_ALIST_BASE_URL || 'http://localhost:5244',
  // API路径前缀
  apiPrefix: '/api',
  // 默认页面大小
  defaultPageSize: 50,
  // 默认排序方式
  defaultOrderBy: 'name',
  // 默认排序方向
  defaultOrderDirection: 'asc',
};