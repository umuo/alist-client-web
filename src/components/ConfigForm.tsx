'use client';

import { useState, useEffect } from 'react';
import { config } from '@/config';

interface ConfigFormProps {
  onSave: (baseUrl: string) => void;
  onClose: () => void;
}

export default function ConfigForm({ onSave, onClose }: ConfigFormProps) {
  const [baseUrl, setBaseUrl] = useState<string>(config.baseUrl);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 从localStorage加载配置
  useEffect(() => {
    const savedBaseUrl = localStorage.getItem('alist_base_url');
    if (savedBaseUrl) {
      setBaseUrl(savedBaseUrl);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // 保存到localStorage
    localStorage.setItem('alist_base_url', baseUrl);
    
    // 通知父组件
    onSave(baseUrl);
    
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Alist 配置</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
              服务器地址
            </label>
            <input
              type="text"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: http://localhost:5244"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              输入Alist服务器的完整URL，包括http://或https://
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}