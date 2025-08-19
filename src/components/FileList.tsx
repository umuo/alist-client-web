'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFileList, FileItem, isLoggedIn, needsLogin } from '@/services/alist-api';
import FileListItem from './FileListItem';
import PathBreadcrumb from './PathBreadcrumb';

export default function FileList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentPath, setCurrentPath] = useState<string>(searchParams.get('path') || '/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [needPassword, setNeedPassword] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  // 检查登录状态并尝试获取文件列表
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    fetchFiles(currentPath);
  }, []);

  const fetchFiles = async (path: string, pwd?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFileList({ 
        path, 
        password: pwd || password,
      });
      
      if (response.code === 200) {
        setFiles(response.data.content);
        setNeedPassword(false);
      } else if (response.code === 401) {
        // 检查是否需要登录或只是需要密码
        if (needsLogin(response.message)) {
          setError('需要登录，请点击右上角的登录按钮');
        } else {
          setNeedPassword(true);
        }
      } else {
        setError(response.message || '获取文件列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const handleFileClick = (file: FileItem) => {
    if (file.is_dir) {
      const newPath = currentPath === '/' 
        ? `/${file.name}` 
        : `${currentPath}/${file.name}`;
      
      setCurrentPath(newPath);
      router.push(`/?path=${encodeURIComponent(newPath)}`);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(currentPath, password);
  };

  const handleRefresh = () => {
    fetchFiles(currentPath);
  };


  if (needPassword) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">需要密码</h2>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mb-4"
                placeholder="请输入密码"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                提交
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <PathBreadcrumb path={currentPath} onNavigate={setCurrentPath} />
        <button
          onClick={handleRefresh}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
        >
          刷新
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : !files || files.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">此文件夹为空</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  大小
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  修改时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPath !== '/' && (
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                    setCurrentPath(parentPath);
                    router.push(`/?path=${encodeURIComponent(parentPath)}`);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>返回上级</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">-</td>
                  <td className="px-6 py-4 whitespace-nowrap">-</td>
                  <td className="px-6 py-4 whitespace-nowrap">-</td>
                </tr>
              )}
              {files && files.map((file) => (
                <FileListItem 
                  key={file.name} 
                  file={file} 
                  currentPath={currentPath}
                  onClick={() => handleFileClick(file)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}