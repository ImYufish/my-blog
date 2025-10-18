export const umamiConfig = {
  enabled: false, // 是否显示Umami统计
  apiKey: "api_XXXXXXXXXX", // 你的API密钥
  baseUrl: "https://api.umami.is", // Umami Cloud API地址
  scripts: `
<script defer src="XXXX.XXX" data-website-id="ABCD1234"></script>
  `.trim(), // 上面填你要插入的Script,不用再去Layout中插入
} as const;
