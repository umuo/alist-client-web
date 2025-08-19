import { NextRequest, NextResponse } from 'next/server';

/**
 * 代理Alist API请求，解决跨域问题
 * 注意：这个代理只用于API请求，不用于文件下载
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 确保params.path是一个数组
    const pathArray = Array.isArray(params.path) ? params.path : [params.path];
    const path = pathArray.join('/');
    const searchParams = request.nextUrl.searchParams;
    
    // 从环境变量或请求头中获取Alist服务器地址
    let alistBaseUrl = process.env.NEXT_PUBLIC_ALIST_BASE_URL || 'http://localhost:5244';
    const customBaseUrl = request.headers.get('x-alist-base-url');
    if (customBaseUrl) {
      alistBaseUrl = customBaseUrl;
    }
    
    // 构建目标URL
    let targetUrl = `${alistBaseUrl}/api/${path}`;
    if (searchParams.toString()) {
      targetUrl += `?${searchParams.toString()}`;
    }
    
    // 获取请求头
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // 排除一些特定的头，这些头可能会导致问题
      if (key !== 'host' && key !== 'connection' && key !== 'x-alist-base-url') {
        headers.append(key, value);
      }
    });
    
    console.log(`代理GET请求到: ${targetUrl}`);
    
    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers,
        redirect: 'follow',
      });
      
      // 创建响应
      const data = await response.json();
      
      return NextResponse.json(data, {
        status: response.status,
        statusText: response.statusText,
      });
    } catch (fetchError) {
      console.error('Fetch错误:', fetchError);
      return NextResponse.json(
        { 
          error: '无法连接到Alist服务器', 
          details: fetchError instanceof Error ? fetchError.message : String(fetchError),
          url: targetUrl
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { error: '代理请求失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 确保params.path是一个数组
    const pathArray = Array.isArray(params.path) ? params.path : [params.path];
    const path = pathArray.join('/');
    
    // 从环境变量或请求头中获取Alist服务器地址
    let alistBaseUrl = process.env.NEXT_PUBLIC_ALIST_BASE_URL || 'http://localhost:5244';
    const customBaseUrl = request.headers.get('x-alist-base-url');
    if (customBaseUrl) {
      alistBaseUrl = customBaseUrl;
    }
    
    // 构建目标URL
    const targetUrl = `${alistBaseUrl}/api/${path}`;
    
    // 获取请求头
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // 排除一些特定的头，这些头可能会导致问题
      if (key !== 'host' && key !== 'connection' && key !== 'x-alist-base-url') {
        headers.append(key, value);
      }
    });
    
    // 获取请求体
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('解析请求体失败:', e);
      body = {};
    }
    
    console.log(`代理POST请求到: ${targetUrl}`, body);
    
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        redirect: 'follow',
      });
      
      // 创建响应
      const data = await response.json();
      
      return NextResponse.json(data, {
        status: response.status,
        statusText: response.statusText,
      });
    } catch (fetchError) {
      console.error('Fetch错误:', fetchError);
      return NextResponse.json(
        { 
          error: '无法连接到Alist服务器', 
          details: fetchError instanceof Error ? fetchError.message : String(fetchError),
          url: targetUrl
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { error: '代理请求失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}