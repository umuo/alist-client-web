'use client';

import { useRouter } from 'next/navigation';

interface PathBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export default function PathBreadcrumb({ path, onNavigate }: PathBreadcrumbProps) {
  const router = useRouter();
  
  // 将路径分割成各个部分
  const pathParts = path.split('/').filter(Boolean);
  
  // 生成面包屑导航项
  const breadcrumbItems = [
    { name: '根目录', path: '/' },
    ...pathParts.map((part, index) => {
      const currentPath = '/' + pathParts.slice(0, index + 1).join('/');
      return {
        name: part,
        path: currentPath,
      };
    }),
  ];

  // 处理导航点击
  const handleClick = (itemPath: string) => {
    onNavigate(itemPath);
    router.push(`/?path=${encodeURIComponent(itemPath)}`);
  };

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
            )}
            <button
              onClick={() => handleClick(item.path)}
              className={`inline-flex items-center text-sm font-medium ${
                index === breadcrumbItems.length - 1
                  ? 'text-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {index === 0 && (
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
              )}
              {item.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}