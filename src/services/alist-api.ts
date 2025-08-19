import { config } from '@/config';

// 文件/文件夹项目接口
export interface FileItem {
  name: string;
  size: number;
  is_dir: boolean;
  modified: string;
  sign: string;
  thumb: string;
  type: number;
}

// 列表响应接口
export interface ListResponse {
  code: number;
  message: string;
  data: {
    content: FileItem[];
    total: number;
    readme: string;
    write: boolean;
    provider: string;
  };
}

// 列表请求参数接口
export interface ListParams {
  path: string;
  password?: string;
  page?: number;
  per_page?: number;
  refresh?: boolean;
}

// 登录响应接口
export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
  };
}

// 获取当前存储的token
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('alist_token');
  }
  return null;
}

// 设置token
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('alist_token', token);
  }
}

// 清除token
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('alist_token');
  }
}

// 获取当前Alist服务器baseUrl
export function getAlistBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('alist_base_url') || config.baseUrl;
  }
  return config.baseUrl;
}

// 获取API代理baseUrl
export function getApiBaseUrl(): string {
  // 使用当前域名下的API代理
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/alist`;
  }
  return '/api/alist';
}

// 获取下载baseUrl（直接使用Alist服务器地址，不经过代理）
export function getDownloadBaseUrl(): string {
  return getAlistBaseUrl();
}

/**
 * 登录Alist
 * @param username 用户名
 * @param password 密码
 * @returns 登录响应
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const apiBaseUrl = getApiBaseUrl();
  
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`登录失败: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.code === 200 && data.data.token) {
    // 保存token到localStorage
    setToken(data.data.token);
  }
  
  return data;
}

/**
 * 获取文件列表
 * @param params 请求参数
 * @returns 文件列表响应
 */
export async function getFileList(params: ListParams): Promise<ListResponse> {
  const { path, password, page = 1, per_page = config.defaultPageSize, refresh = false } = params;
  const apiBaseUrl = getApiBaseUrl();
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 如果有token，添加到请求头
  if (token) {
    headers['Authorization'] = token;
  }
  
  const response = await fetch(`${apiBaseUrl}/fs/list`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      path,
      password: password || '',
      page_num: page,
      page_size: per_page,
      refresh,
    }),
  });

  if (!response.ok) {
    throw new Error(`获取文件列表失败: ${response.statusText}`);
  }

  const data = await response.json();
  
  // 确保返回的数据结构符合预期
  if (!data) {
    throw new Error('获取文件列表失败: 服务器返回空数据');
  }
  
  // 确保data.data.content存在，如果不存在则提供空数组
  if (data.code === 200 && (!data.data || !data.data.content)) {
    data.data = data.data || {};
    data.data.content = [];
  }
  
  return data;
}

/**
 * 获取文件下载链接
 * @param path 文件路径
 * @param password 密码（如果需要）
 * @returns 下载链接
 */
export async function getFileDownloadUrl(path: string, password?: string): Promise<string> {
  const apiBaseUrl = getApiBaseUrl();
  const downloadBaseUrl = getDownloadBaseUrl();
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 如果有token，添加到请求头
  if (token) {
    headers['Authorization'] = token;
  }
  
  const response = await fetch(`${apiBaseUrl}/fs/get`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      path,
      password: password || '',
    }),
  });

  if (!response.ok) {
    throw new Error(`获取下载链接失败: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(`获取下载链接失败: ${data.message}`);
  }

  // 使用原始Alist服务器地址构建下载链接，不经过代理
  return `${downloadBaseUrl}/d${path}?sign=${data.data.sign}`;
}

/**
 * 直接下载文件
 * @param path 文件路径
 */
export function downloadFile(path: string, filename: string): void {
  const downloadBaseUrl = getDownloadBaseUrl();
  const token = getToken();
  
  const link = document.createElement('a');
  let url = `${downloadBaseUrl}/d${path}`;
  
  // 如果有token，添加到URL
  if (token) {
    url += `?token=${token}`;
  }
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/**
 * 检查是否需要登录
 * 这个函数会在API返回401错误时被调用，用于判断是否真的需要登录
 * @param message 错误信息
 * @returns 是否需要登录
 */
export function needsLogin(message: string): boolean {
  return message.includes('login') || 
         message.includes('登录') || 
         message.includes('unauthorized') || 
         message.includes('认证');
}

/**
 * 退出登录
 */
export function logout(): void {
  clearToken();
}