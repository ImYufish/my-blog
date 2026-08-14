// edge-functions/file/[...].js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // imgbed 图床在 Cloudflare 上绑的真实自定义域名（国内可达，别用 *.workers.dev 子域，会被掐/超时）
  const IMG_BED = 'https://imgbed.yufish.cn';

  const target = new URL(url.pathname + url.search, IMG_BED);

  const headers = new Headers(request.headers);
  headers.delete('host'); // 出站时去掉原 host，让 CF 按目标域名收，避免 host 校验问题

  const init = { method: request.method, headers, redirect: 'follow' };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  // 兜底超时：图床不可达时 10s 内快速失败，而不是卡到边缘函数 504
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  init.signal = controller.signal;

  let resp;
  try {
    resp = await fetch(new Request(target, init));
  } catch (e) {
    return new Response('Image proxy error: ' + (e && e.message || e), {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } finally {
    clearTimeout(timer);
  }

  // 透传图片响应，并加 CDN 缓存头，减轻 imgbed 压力
  const out = new Headers(resp.headers);
  out.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: out,
  });
}
