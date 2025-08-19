'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FileList from '@/components/FileList';
import ConfigForm from '@/components/ConfigForm';
import LoginForm from '@/components/LoginForm';
import { config } from '@/config';
import { getBaseUrl, isLoggedIn, logout } from '@/services/alist-api';

export default function Home() {
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [baseUrl, setBaseUrl] = useState<string>(config.baseUrl);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const path = searchParams.get('path') || '/';

  // 从localStorage加载配置和登录状态
  useEffect(() => {
    const savedBaseUrl = localStorage.getItem('alist_base_url');
    if (savedBaseUrl) {
      setBaseUrl(savedBaseUrl);
    } else {
      // 首次访问时显示配置表单
      setShowConfig(true);
    }

    // 检查登录状态
    setLoggedIn(isLoggedIn());
  }, []);

  const handleSaveConfig = (newBaseUrl: string) => {
    setBaseUrl(newBaseUrl);
    // 刷新页面以应用新配置
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setLoggedIn(true);
    // 刷新页面以应用新登录状态
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    // 刷新页面以应用新登录状态
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Alist 客户端</h1>
          <div className="flex space-x-2">
            {loggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                退出登录
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                登录
              </button>
            )}
            <button
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              配置
            </button>
          </div>
        </div>
      </header>

      <FileList />

      {showConfig && (
        <ConfigForm 
          onSave={handleSaveConfig} 
          onClose={() => setShowConfig(false)} 
        />
      )}

      {showLogin && (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess} 
          onCancel={() => setShowLogin(false)} 
        />
      )}
    </main>
  );
}