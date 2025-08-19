'use client';

import { useState } from 'react';
import { FileItem, downloadFile, getFileDownloadUrl, getToken } from '@/services/alist-api';

interface FileListItemProps {
  file: FileItem;
  currentPath: string;
  onClick: () => void;
}

export default function FileListItem({ file, currentPath, onClick }: FileListItemProps) {
  const [downloading, setDownloading] = useState(false);

  // 格式化文件大小
  const formatFileSize = (size: number | undefined): string => {
    if (size === undefined || size === null) return '-';
    if (size === 0) return '0 B';
    
    try {
      const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
      const i = Math.floor(Math.log(size) / Math.log(1024));
      
      return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
    } catch (error) {
      console.error('文件大小格式化错误:', error);
      return `${size} B`;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    } catch (error) {
      console.error('日期格式化错误:', error);
      return '-';
    }
  };

  // 获取文件图标
  const getFileIcon = () => {
    if (file.is_dir) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
      );
    }

    // 根据文件扩展名返回不同图标
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'mkv':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // 处理下载
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.is_dir) return;
    
    setDownloading(true);
    try {
      const filePath = currentPath === '/' 
        ? `/${file.name}` 
        : `${currentPath}/${file.name}`;
      
      downloadFile(filePath, file.name);
    } catch (error) {
      console.error('下载文件失败:', error);
      alert('下载文件失败');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <tr 
      className={`hover:bg-gray-50 ${file.is_dir ? 'cursor-pointer' : ''}`}
      onClick={file.is_dir ? onClick : undefined}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getFileIcon()}
          <span className="ml-2">{file.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {file.is_dir ? '-' : formatFileSize(file.size)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {formatDate(file.modified)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {!file.is_dir && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
          >
            {downloading ? '下载中...' : '下载'}
          </button>
        )}
      </td>
    </tr>
  );
}