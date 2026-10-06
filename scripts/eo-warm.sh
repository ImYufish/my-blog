#!/usr/bin/env bash
# eo-warm.sh —— EdgeOne（免费版）缓存预热脚本
#
# 原理：EdgeOne 免费版没有预热 API（CreatePrefetchTask 需个人版及以上），
# 这里用"模拟真实访问"代替：从站点 sitemap 取 URL，逐个走公网 GET 一遍，
# 请求会命中 EdgeOne 边缘节点 → 未命中则回源 → 边缘缓存被填充，实现预热。
# 页面引用的本站静态资源（css/js/图片/字体）也会去重后顺带预热。
#
# 部署到服务器后，用 1Panel「计划任务 → Shell 脚本」执行：
#   bash /opt/eo-warm.sh
# 所有配置都可用环境变量覆盖，例如只预热前 20 条页面：
#   EO_WARM_LIMIT=20 bash /opt/eo-warm.sh
set -u

###################### 配置：直接改这里的值即可 ######################
SITE="https://x1anyu.cn" # 站点地址，不带末尾斜杠；必须走公网域名才会命中 EdgeOne
SITEMAP="/sitemap-index.xml" # sitemap 入口
DELAY=1 # 每个请求间隔（秒），别设太小，避免把站点/配额打爆
TIMEOUT=20 # 单请求超时（秒）
LIMIT=0 # 只预热前 N 条页面；0 = 全量预热
WARM_ASSETS=1 # 1 = 顺带预热页面引用的本站静态资源；0 = 只预热页面
UA="Mozilla/5.0 (compatible; SiteWarmer/1.0; +${SITE})"
#################################################################

SITE="${SITE%/}" # 防呆：自动去掉末尾斜杠
SITEMAP_URL="${SITE}${SITEMAP}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ASSETS_FILE="$TMP/assets"; : > "$ASSETS_FILE"

log() { echo "$(date '+%F %T')  $*"; }

# GET 一个 URL，输出 "状态码 耗时 大小 缓存命中" 一行；响应体留在 $TMP/b
fetch_one() {
	local meta cache
	meta=$(curl -s -A "$UA" --max-time "$TIMEOUT" -D "$TMP/h" -o "$TMP/b" \
		-w '%{http_code} %{time_total} %{size_download}' "$1") || { echo "000 0s 0KB -"; return 1; }
	cache=$(grep -iE '^(x-cache|x-eo-cache-status|eo-cache-status):' "$TMP/h" 2>/dev/null \
		| tail -1 | tr -d '\r' | sed -E 's/^[^:]*:[[:space:]]*//')
	cache="${cache:--}"
	echo "$meta" | awk -v c="$cache" '{printf "%s %.2fs %.1fKB %s", $1, $2, $3/1024, c}'
}

LAST_CACHE="-"
warm_url() { # $1=url  $2=类型标签（页面/资源）；通过 LAST_CACHE 返回缓存命中情况
	local r code
	r=$(fetch_one "$1") || r="000 0s 0KB -"
	code="${r%% *}"
	LAST_CACHE=$(printf '%s' "$r" | awk '{print $NF}')
	log "$2[$r] $1"
	[ "$code" = "200" ] || [ "$code" = "304" ] || return 1
}

# 从 $TMP/b 提取本站静态资源 URL。
# 只认真实引用（src=/href=/content=/url()），并先剔除 <pre> 代码块，
# 避免把文章里写的示例文件名（如 wxbot.js）当成资源去请求
extract_assets() {
	# 去掉 <pre>...</pre> 区段（文章代码块）；跳过的记录补发空串，保住 ">" 分隔符
	awk 'BEGIN { RS = ">"; ORS = ">" }
		/<\/pre/ { inpre = 0; print ""; next }
		/<pre/   { inpre = 1; print ""; next }
		inpre   { print ""; next }
		{ print }' "$TMP/b" 2>/dev/null > "$TMP/nb"
	{
		# src=/href=/content= 等属性值；srcset 多值按空格拆开
		grep -oE '(src|href|data-src|poster|content)="[^"]*"' "$TMP/nb" 2>/dev/null \
			| sed -E 's/^[a-z-]+="//; s/"$//' | tr ' ' '\n'
	# 2b) 带引号的路径字符串（<style> 的 url("...")、内联 <script> 的 "/pagefind/..."）；
	#     文章代码块已在上面剔除，正文里带引号又有资源扩展名的极少
	grep -oE '"(https?://[^"]+|/[^"]+)"' "$TMP/nb" 2>/dev/null | tr -d '"'
	} | grep -vF '\' | grep -vF '&amp;' | grep -v '^#' | grep -v '^data:' \
		| while IFS= read -r a; do
			[ -n "$a" ] || continue
			case "${a%%\?*}" in
				*.css | *.mjs | *.js | *.png | *.jpg | *.jpeg | *.webp | *.avif | *.gif | *.svg | *.ico | *.woff | *.woff2 | *.ttf | *.eot) ;;
				*) continue ;;
			esac
			case "$a" in
				"${SITE}"/*) printf '%s\n' "$a" ;;
				/*) printf '%s%s\n' "$SITE" "$a" ;;
			esac
		done
}

log "====== EdgeOne 预热开始：$SITE ======"

# 1. sitemap-index → 子 sitemap → 全部页面 URL
SUBS=$(curl -s -A "$UA" --max-time "$TIMEOUT" "$SITEMAP_URL" \
	| grep -oE '<loc>[^<]*</loc>' | sed -e 's:<loc>::' -e 's:</loc>::' -e 's/\&amp;/\&/g')
if [ -z "$SUBS" ]; then
	log "❌ 拉取失败或为空：$SITEMAP_URL（请检查 SITE 配置与网络）"
	exit 1
fi
PAGES=$(for sm in $SUBS; do curl -s -A "$UA" --max-time "$TIMEOUT" "$sm"; done \
	| grep -oE '<loc>[^<]*</loc>' | sed -e 's:<loc>::' -e 's:</loc>::' -e 's/\&amp;/\&/g' | sort -u)
TOTAL=$(printf '%s\n' "$PAGES" | grep -c .)
log "sitemap 解析出 $TOTAL 个页面"

if [ "${LIMIT:-0}" -gt 0 ] 2>/dev/null; then
	PAGES=$(printf '%s\n' "$PAGES" | head -n "$LIMIT")
	log "按 LIMIT=$LIMIT 只预热前 $LIMIT 条"
fi

# 2. 逐页预热；响应体里的本站资源地址先收集，稍后统一去重预热
FAIL=0; COUNT=0; NOCACHE=0
while IFS= read -r url; do
	[ -z "$url" ] && continue
	COUNT=$((COUNT + 1))
	if warm_url "$url" "页面"; then
		[ "$WARM_ASSETS" = "1" ] && extract_assets >> "$ASSETS_FILE"
	else
		FAIL=$((FAIL + 1))
	fi
	[ "$LAST_CACHE" = "-" ] && NOCACHE=$((NOCACHE + 1))
	sleep "$DELAY"
done < <(printf '%s\n' "$PAGES")

# 3. 预热收集到的静态资源（全站去重，公共 css/js 只拉一次）
if [ "$WARM_ASSETS" = "1" ]; then
	UNIQ_ASSETS=$(sort -u "$ASSETS_FILE")
	A_TOTAL=$(printf '%s\n' "$UNIQ_ASSETS" | grep -c .)
	log "---- 顺带预热 $A_TOTAL 个静态资源 ----"
	printf '%s\n' "$UNIQ_ASSETS" | while IFS= read -r a; do
		[ -z "$a" ] && continue
		warm_url "$a" "资源" || true
		sleep "$DELAY"
	done
fi

log "====== 结束：页面 $COUNT 个（失败 $FAIL，无缓存头 $NOCACHE 个）======"
log "提示：缓存列为 '-' 表示该请求没拿到 EdgeOne 缓存头——要么没经过 EO（域名未解析到 EO），要么该资源配置为不缓存"
