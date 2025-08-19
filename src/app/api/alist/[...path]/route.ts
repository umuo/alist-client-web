import { NextRequest, NextResponse } from 'next/server';

/**
 * 代理Alist API请求，解决跨域问题
 * 注意：这个代理只用于API请求，不用于文件下载
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // 确保params.path是一个数组
  const pathArray = Array.isArray(params.path) ? params.path : [params.path];
  const path = pathArray.join('/');
  const searchParams = request.nextUrl.searchParams;
  const alistBaseUrl = process.env.NEXT_PUBLIC_ALIST_BASE_URL || 'http://localhost:5244';
  
  // 构建目标URL
  let targetUrl = `${alistBaseUrl}/api/${path}`;
  if (searchParams.toString()) {
    targetUrl += `?${searchParams.toString()}`;
  }
  
  // 获取请求头
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // 排除一些特定的头，这些头可能会导致问题
    if (key !== 'host' && key !== 'connection') {
      headers.append(key, value);
    }
  });
  
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      redirect: 'follow',
    });
    
    // 创建响应
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { error: '代理请求失败' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // 确保params.path是一个数组
  const pathArray = Array.isArray(params.path) ? params.path : [params.path];
  const path = pathArray.join('/');
  const alistBaseUrl = process.env.NEXT_PUBLIC_ALIST_BASE_URL || 'http://localhost:5244';
  
  // 构建目标URL
  const targetUrl = `${alistBaseUrl}/api/${path}`;
  
  // 获取请求头和请求体
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // 排除一些特定的头，这些头可能会导致问题
    if (key !== 'host' && key !== 'connection') {
      headers.append(key, value);
    }
  });
  
  try {
    // 获取请求体
    const body = await request.json();
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      redirect: 'follow',
    }).catch(error => {
      console.error('Fetch error:', error);
      throw new Error(`Fetch failed: ${error.message}`);
    });
    
    // 创建响应
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { error: '代理请求失败' },
      { status: 500 }
    );
  }
}