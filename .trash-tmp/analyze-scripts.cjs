const fs = require('fs');
const files = [
  'F:/Admin/Desktop/blog/fl/Firefly/dist/posts/5/index.html',
  'F:/Admin/Desktop/blog/fl/Firefly/dist/posts/4/index.html',
];
const RE = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
for (const f of files) {
  if (!fs.existsSync(f)) { console.log('MISSING', f); continue; }
  const html = fs.readFileSync(f, 'utf8');
  let m, idx = 0, bad = 0;
  console.log('\n===== ' + f + ' (len ' + html.length + ') =====');
  while ((m = RE.exec(html))) {
    idx++;
    const attrs = m[1];
    const code = m[2];
    const hasCtrl = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(code);
    const hasFullwidth = /[：；，。）】、「」『』——…·]/.test(code);
    if (!(hasCtrl || hasFullwidth)) continue;
    bad++;
    const vis = code.slice(0, 500).replace(/[\x00-\x1f\x7f]/g, c => '\\x' + c.charCodeAt(0).toString(16));
    console.log(`\n[script #${idx}] attrs=${JSON.stringify(attrs.slice(0,90))} len=${code.length} ctrl=${hasCtrl} fw=${hasFullwidth}`);
    console.log('--- head ---');
    console.log(vis);
    console.log('--- tail ---');
    console.log(code.slice(-200).replace(/[\x00-\x1f\x7f]/g, c => '\\x' + c.charCodeAt(0).toString(16)));
  }
  console.log(`\n=> scanned ${idx} scripts, ${bad} "bad" (ctrl/fullwidth)`);
}
