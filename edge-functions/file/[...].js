// edge-functions/file/[...].js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // imgbed Worker 在 Cloudflare 上的真实地址，去 CF 控制台 Workers 概览页复制
  // 常见是 https://imgbed.x1anyu.workers.dev 或 https://imgbed.yufish.workers.dev
  const IMG_BED = 'https://imgbed.x1anyu.workers.dev';

  const target = new URL(url.pathname + url.search, IMG_BED);

  const headers = new Headers(request.headers);
  headers.delete('host'); // 出站时去掉原 host，让 CF 按目标域名收，避免 host 校验问题

  const init = { method: request.method, headers, redirect: 'follow' };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  const resp = await fetch(new Request(target, init));

  // 透传图片响应，并加 CDN 缓存头，减轻 imgbed 压力
  const out = new Headers(resp.headers);
  out.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: out,
  });
}
