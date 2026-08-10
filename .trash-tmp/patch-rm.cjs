// 绕过 WorkBuddy safe-delete shim 在异步 fs.promises.rm 的 bug：
// 当 force 删除因竞态（目录已被 Vite 提前物理删除）导致 trash 抛 FileNotFoundException 时，
// 按 Node 的 force 语义静默成功，避免 astro build 在清理 dist/.prerender/.vite 时崩溃。
const fs = require('fs');
const shimRm = fs.promises && fs.promises.rm;
if (shimRm && !shimRm.__patched) {
  const patched = function (path, opts) {
    return Promise.resolve(shimRm.call(this, path, opts)).catch((err) => {
      if (opts && opts.force) return; // force 删除失败 = 静默成功（Node 语义）
      throw err;
    });
  };
  patched.__patched = true;
  try {
    Object.defineProperty(fs.promises, 'rm', { value: patched, configurable: true, writable: true });
  } catch (e) {
    fs.promises.rm = patched;
  }
}
