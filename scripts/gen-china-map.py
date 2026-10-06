#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
按国家测绘标准惯用的 Albers 等积圆锥投影，把高德/DataV 系行政边界数据
转成本站点用的中国地图底图 + 页面几何数据。

生成 / 更新两处
--------------
1. public/images/china-blank-province-map.svg
   · 主图 34 个省级行政区（id=pXX，供页面 <use href="…#pXX"> 引用上色）
   · 右下角南海诸岛插图（含九段线，合规必需）
2. src/pages/analytics.astro 里三段几何数据
   domesticChinaOutlinePaths / domesticTaiwanPath / domesticRegionCoordinates

数据源（高德系，合规）
--------------------
· 100000_full.json  省级行政边界，其中 adcode=100000_JD 是九段线
· 100000.json       国界轮廓（描边动画用）
首次运行会下载到系统临时目录缓存，之后复用。

为什么样式写法要特别小心
----------------------
页面给省份上色靠 `<use href="china-blank-province-map.svg#pAH">` 外部引用 + 页面 CSS /
内联 style。被引用元素的「明确指定」样式会阻断 <use> 的继承，因此省份 path
不能带 fill/stroke 属性，默认色只能写在 <svg> 根上（根不会进入 shadow tree）。
插图则相反：它要固定样式，所以显式写在组上。

运行
----
    python scripts/gen-china-map.py

本项目其它脚本都是 Node 的，这个是一次性手动工具，不参与构建。
"""
import json
import math
import os
import re
import ssl
import tempfile
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SVG_OUT = os.path.join(ROOT, "public", "images", "china-blank-province-map.svg")
PAGE = os.path.join(ROOT, "src", "pages", "analytics.astro")
CACHE = os.path.join(tempfile.gettempdir(), "china-map-cache")

VIEW_W, VIEW_H = 1000.0, 850.0

# ---- Albers 等积圆锥（中国标准地图常用：双标准纬线 25°/47°，中央经线 105°）----
P1, P2, L0, PH0 = 25.0, 47.0, 105.0, 35.0
_N = (math.sin(math.radians(P1)) + math.sin(math.radians(P2))) / 2
_C = math.cos(math.radians(P1)) ** 2 + 2 * _N * math.sin(math.radians(P1))
_RHO0 = math.sqrt(_C - 2 * _N * math.sin(math.radians(PH0))) / _N


def albers(lon, lat):
    rho = math.sqrt(max(0.0, _C - 2 * _N * math.sin(math.radians(lat)))) / _N
    th = _N * math.radians(lon - L0)
    return rho * math.sin(th), _RHO0 - rho * math.cos(th)


# 省级行政区 → ISO 3166-2:CN 风格两位码（页面 domesticRegionShapeCodes 用这套命名）
CODE = {
    "北京市": "BJ", "天津市": "TJ", "河北省": "HE", "山西省": "SX", "内蒙古自治区": "NM",
    "辽宁省": "LN", "吉林省": "JL", "黑龙江省": "HL", "上海市": "SH", "江苏省": "JS",
    "浙江省": "ZJ", "安徽省": "AH", "福建省": "FJ", "江西省": "JX", "山东省": "SD",
    "河南省": "HA", "湖北省": "HB", "湖南省": "HN", "广东省": "GD", "广西壮族自治区": "GX",
    "海南省": "HI", "重庆市": "CQ", "四川省": "SC", "贵州省": "GZ", "云南省": "YN",
    "西藏自治区": "XZ", "陕西省": "SN", "甘肃省": "GS", "青海省": "QH",
    "宁夏回族自治区": "NX", "新疆维吾尔自治区": "XJ", "台湾省": "TW",
    "香港特别行政区": "HK", "澳门特别行政区": "MO",
}
SHORT = {
    "北京市": "北京", "天津市": "天津", "河北省": "河北", "山西省": "山西", "内蒙古自治区": "内蒙古",
    "辽宁省": "辽宁", "吉林省": "吉林", "黑龙江省": "黑龙江", "上海市": "上海", "江苏省": "江苏",
    "浙江省": "浙江", "安徽省": "安徽", "福建省": "福建", "江西省": "江西", "山东省": "山东",
    "河南省": "河南", "湖北省": "湖北", "湖南省": "湖南", "广东省": "广东", "广西壮族自治区": "广西",
    "海南省": "海南", "重庆市": "重庆", "四川省": "四川", "贵州省": "贵州", "云南省": "云南",
    "西藏自治区": "西藏", "陕西省": "陕西", "甘肃省": "甘肃", "青海省": "青海",
    "宁夏回族自治区": "宁夏", "新疆维吾尔自治区": "新疆", "台湾省": "台湾",
    "香港特别行政区": "香港", "澳门特别行政区": "澳门",
}

MAIN_LAT_MIN = 17.5                      # 主图保留纬度下界（南海远海岛礁归插图）
INSET_BOX = (104.0, 2.0, 125.0, 25.0)    # 插图经纬度范围 lon0, lat0, lon1, lat1

_SSL = ssl._create_unverified_context()


def load(name, url):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        print(f"  ↓ 下载 {url}")
        with urllib.request.urlopen(url, context=_SSL, timeout=90) as resp:
            blob = resp.read()
        with open(path, "wb") as fh:
            fh.write(blob)
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def rdp(pts, tol):
    """Douglas-Peucker 简化"""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        ax, ay = pts[i]
        bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy)
        best, best_d = -1, tol
        for k in range(i + 1, j):
            px, py = pts[k]
            d = (math.hypot(px - ax, py - ay) if norm == 0
                 else abs(dy * px - dx * py + bx * ay - by * ax) / norm)
            if d > best_d:
                best, best_d = k, d
        if best != -1:
            keep[best] = True
            stack.append((i, best))
            stack.append((best, j))
    return [p for p, k in zip(pts, keep) if k]


def clip_rect(ring, box):
    """Sutherland-Hodgman：把环裁剪到经纬度矩形内"""
    lon0, lat0, lon1, lat1 = box

    def inside(p, edge):
        lon, lat = p
        return (lon >= lon0, lon <= lon1, lat >= lat0, lat <= lat1)[edge]

    def cross(a, b, edge):
        lon_a, lat_a = a
        lon_b, lat_b = b
        if edge == 0:
            t = (lon0 - lon_a) / (lon_b - lon_a)
            return (lon0, lat_a + t * (lat_b - lat_a))
        if edge == 1:
            t = (lon1 - lon_a) / (lon_b - lon_a)
            return (lon1, lat_a + t * (lat_b - lat_a))
        if edge == 2:
            t = (lat0 - lat_a) / (lat_b - lat_a)
            return (lon_a + t * (lon_b - lon_a), lat0)
        t = (lat1 - lat_a) / (lat_b - lat_a)
        return (lon_a + t * (lon_b - lon_a), lat1)

    out = list(ring)
    for edge in range(4):
        src, out = out, []
        if not src:
            break
        prev = src[-1]
        for cur in src:
            if inside(cur, edge):
                if not inside(prev, edge):
                    out.append(cross(prev, cur, edge))
                out.append(cur)
            elif inside(prev, edge):
                out.append(cross(prev, cur, edge))
            prev = cur
    return out


def rings_of(geom):
    if geom["type"] == "Polygon":
        return list(geom["coordinates"])
    out = []
    for poly in geom["coordinates"]:
        out += list(poly)
    return out


def num(v):
    """紧凑数字：1 位小数，整数不带 .0"""
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def path_d(pts, close=True):
    """隐式 lineto + 紧凑数字，显著减小体积"""
    if not pts:
        return ""
    body = " ".join(f"{num(x)} {num(y)}" for x, y in pts)
    return "M" + body + ("Z" if close else "")


def poly_area(pts):
    n = len(pts)
    return abs(sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1]
                   for i in range(n))) / 2


def main():
    print("读取行政边界数据…")
    china = load("datav-china.json",
                 "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
    outline_src = load("datav-outline.json",
                       "https://geo.datav.aliyun.com/areas_v3/bound/100000.json")

    provinces, dashes = {}, []
    for feat in china["features"]:
        ad = str(feat["properties"].get("adcode"))
        if ad == "100000_JD":
            dashes = rings_of(feat["geometry"])
            continue
        provinces[feat["properties"]["name"]] = feat

    # ---------- 主图 / 插图的选择与投影 bbox ----------
    main_rings = []
    for name, feat in provinces.items():
        for ring in rings_of(feat["geometry"]):
            if max(p[1] for p in ring) >= MAIN_LAT_MIN:
                main_rings.append((name, ring))

    main_proj = [albers(x, y) for _, r in main_rings for x, y in r]
    mx0, mx1 = min(p[0] for p in main_proj), max(p[0] for p in main_proj)
    my0, my1 = min(p[1] for p in main_proj), max(p[1] for p in main_proj)

    # 与插图范围相交的环 → 裁剪（标准南海插图含粤桂琼台作位置参考，
    # 只取「完全落在框内」会漏掉台湾、广东等跨界省份）
    inset_geo = []
    for name, feat in provinces.items():
        for ring in rings_of(feat["geometry"]):
            lon_min, lon_max = min(p[0] for p in ring), max(p[0] for p in ring)
            lat_min, lat_max = min(p[1] for p in ring), max(p[1] for p in ring)
            if (lon_max >= INSET_BOX[0] and lon_min <= INSET_BOX[2]
                    and lat_max >= INSET_BOX[1] and lat_min <= INSET_BOX[3]):
                clipped = clip_rect(ring, INSET_BOX)
                if len(clipped) >= 3:
                    inset_geo.append((name, clipped))
    dash_geo = [c for c in (clip_rect(r, INSET_BOX) for r in dashes) if len(c) >= 3]

    inset_proj = ([albers(x, y) for _, r in inset_geo for x, y in r]
                  + [albers(x, y) for r in dash_geo for x, y in r])
    ix0, ix1 = min(p[0] for p in inset_proj), max(p[0] for p in inset_proj)
    iy0, iy1 = min(p[1] for p in inset_proj), max(p[1] for p in inset_proj)

    # ---------- 排版 ----------
    # 主图让位版：画布内主图缩到 652 宽，右侧腾给南海插图（占比 ~30%）。
    # 容器宽度决定实际显示尺寸，单列布局下主图仍约有 186px、插图约 85px。
    MAIN_RECT = (28.0, 151.0, 652.0, 548.0)
    inset_ratio = (ix1 - ix0) / (iy1 - iy0)
    inset_w = 300.0
    INSET_RECT = (690.0, 420.0, inset_w, round(inset_w / inset_ratio, 1))
    s_main = min(MAIN_RECT[2] / (mx1 - mx0), MAIN_RECT[3] / (my1 - my0))
    s_inset = min(INSET_RECT[2] / (ix1 - ix0), INSET_RECT[3] / (iy1 - iy0))

    def to_main(lon, lat):
        px, py = albers(lon, lat)
        return round(MAIN_RECT[0] + (px - mx0) * s_main), round(MAIN_RECT[1] + (my1 - py) * s_main)

    def to_inset(lon, lat):
        px, py = albers(lon, lat)
        return (round(INSET_RECT[0] + (px - ix0) * s_inset, 1),
                round(INSET_RECT[1] + (iy1 - py) * s_inset, 1))

    # 地图在页面上实际显示约 140~400 CSS px，而 viewBox 宽 1000，
    # 即 1 个 viewBox 单位仅 0.14~0.4 屏幕像素 —— 容差按此尺度取，视觉无损、体积大减。
    tol_main = 1.35 / s_main
    tol_inset = 0.9 / s_inset

    # ---------- 主图省级 path ----------
    by_province = {}
    for name, ring in main_rings:
        pts = rdp([to_main(x, y) for x, y in ring], tol_main)
        if len(pts) >= 3:
            by_province.setdefault(name, []).append((poly_area(pts), pts))
    for name, items in list(by_province.items()):
        items.sort(key=lambda it: -it[0])
        by_province[name] = [p for a, p in items if a >= 8.0] or [items[0][1]]

    svg_parts = []
    for name in provinces:
        code = CODE.get(name)
        if not code or name not in by_province:
            continue
        d = "".join(path_d(r) for r in by_province[name])
        if d:
            svg_parts.append(f'<path id="p{code}" d="{d}"/>')

    # 插图框叠在主图右下角，必须落在海域上：求主图陆地中纵坐标落在插图范围内的
    # 最右边界，据此右移 / 收窄插图（台湾是这里的限制者）
    cands = [(pt[0], nm) for nm, rs in by_province.items() for r in rs for pt in r
             if INSET_RECT[1] <= pt[1] <= INSET_RECT[1] + INSET_RECT[3]]
    land_x_max = max(p[0] for p in cands) if cands else 0.0
    if INSET_RECT[0] < land_x_max + 10.0:
        x = land_x_max + 10.0
        w = min(INSET_RECT[2], VIEW_W - 10.0 - x)
        INSET_RECT = (x, INSET_RECT[1], w, round(w / inset_ratio, 1))
        s_inset = min(INSET_RECT[2] / (ix1 - ix0), INSET_RECT[3] / (iy1 - iy0))
        print(f"  · 插图避让陆地（最右 x={land_x_max:.0f}）→ x={x:.0f}, w={w:.0f}")

    # ---------- 国界轮廓（页面描边动画用） ----------
    outline_rings = [ring for feat in outline_src["features"] for ring in rings_of(feat["geometry"])
                     if max(p[1] for p in ring) >= MAIN_LAT_MIN]
    outline_rings.sort(key=lambda r: -len(r))          # 大陆在前
    outline_paths = []
    for ring in outline_rings:
        lat_max = max(p[1] for p in ring)
        pts = rdp([to_main(x, y) for x, y in ring], tol_main * (1.1 if lat_max > 40 else 0.85))
        if len(pts) >= 3 and (poly_area(pts) > 6.0 or lat_max > 40):
            outline_paths.append(path_d(pts))
    outline_paths = outline_paths[:14]

    taiwan_d = "".join(path_d(r) for r in by_province.get("台湾省", []))

    # ---------- 插图 ----------
    # 线宽用 non-scaling-stroke：插图实际只有 30~200 CSS px 宽，按 viewBox 单位
    # 算的线宽会被缩到看不见，屏幕像素线宽才保证九段线与岛礁可辨。
    nss = ' vector-effect="non-scaling-stroke"'
    x0, y0, iw, ih = INSET_RECT
    inset_parts = [f'<rect x="{x0:.0f}" y="{y0:.0f}" width="{iw:.0f}" height="{ih:.0f}" rx="6"'
                   f' fill="#f7fbff" stroke="#9dbde0" stroke-width="1"{nss}/>']

    land, islets = [], []
    for _name, ring in inset_geo:
        pts = rdp([to_inset(x, y) for x, y in ring], tol_inset)
        if len(pts) < 3:
            continue
        area = poly_area(pts)
        if area >= 8.0:
            land.append(path_d(pts))
        elif area >= 0.12:
            # 南海诸岛的小岛礁：几何半径极小，靠屏幕像素描边呈现为点
            islets.append((round(sum(p[0] for p in pts) / len(pts), 1),
                           round(sum(p[1] for p in pts) / len(pts), 1)))

    # 每段九段线在数据里是「零宽度圆头线」的轮廓多边形（真实线宽约 600 米，
    # 换算到本图不足 0.05 像素，fill 完全看不见）。取相距最远的两点作端点，
    # 改由 stroke 按屏幕像素绘制，才是标准地图上那种清晰的九段线。
    dash_segments = []
    for ring in dash_geo:
        pts = [to_inset(x, y) for x, y in ring]
        best, best_d = None, -1.0
        for i in range(len(pts)):
            for j in range(i + 1, len(pts)):
                dd = (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2
                if dd > best_d:
                    best_d, best = dd, (i, j)
        if best and best_d > 0:
            a, b = pts[best[0]], pts[best[1]]
            dash_segments.append(f"M{num(a[0])} {num(a[1])}L{num(b[0])} {num(b[1])}")

    inset_parts.append('<g fill="#eef5fd" stroke="#8fb2d8" stroke-width="0.9" fill-rule="evenodd">')
    inset_parts += [f'<path{nss} d="{d}"/>' for d in land]
    inset_parts.append("</g>")
    # 视觉层次：九段线是合规核心要素，要当主角（线粗、色深、圆头）；
    # 岛礁点退成浅色细点，只作"南海诸岛"的量感背景，避免在二三十像素宽的
    # 插图里把九段线衬得看不出来。
    if islets:
        inset_parts.append('<g fill="#93b2d4" stroke="#93b2d4" stroke-width="1.05">')
        inset_parts += [f'<circle{nss} cx="{num(cx)}" cy="{num(cy)}" r="0.6"/>' for cx, cy in islets]
        inset_parts.append("</g>")
    inset_parts.append('<g fill="none" stroke="#1f4f8f" stroke-width="2.4" stroke-linecap="round">')
    inset_parts += [f'<path{nss} d="{d}"/>' for d in dash_segments]
    inset_parts.append("</g>")

    # 默认配色写在 <svg> 根：页面 <use href="…#pXX"> 引用单个 path 时根不会进入
    # shadow tree，页面 CSS / 内联样式才能自由给省份上色；<img src> 整图引用时
    # 又能继承到这套默认色。
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 850"'
        ' fill="#eef5fd" stroke="#9ab8dc" stroke-width="0.7"'
        ' role="img" aria-label="中国省级行政区划图（含南海诸岛及九段线）">'
        "<title>中国省级行政区划图</title>"
        f'<g id="provinces">{"".join(svg_parts)}</g>'
        f'<g id="pInset">{"".join(inset_parts)}</g>'
        "</svg>"
    )
    os.makedirs(os.path.dirname(SVG_OUT), exist_ok=True)
    # newline="\n"：仓库统一 LF（biome lineEnding 默认 lf），
    # 不显式指定的话 Windows 下会被写成 CRLF，导致整个文件显示为改动。
    with open(SVG_OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(svg)

    # ---------- 更新页面里的三段几何数据 ----------
    coords = {}
    for name, feat in provinces.items():
        short, center = SHORT.get(name), feat["properties"].get("center")
        if short and center:
            coords[short] = list(to_main(center[0], center[1]))
    order = ["新疆", "西藏", "青海", "甘肃", "宁夏", "内蒙古", "黑龙江", "吉林", "辽宁", "北京",
             "天津", "河北", "山西", "山东", "陕西", "河南", "江苏", "上海", "安徽", "湖北",
             "四川", "重庆", "浙江", "湖南", "江西", "福建", "贵州", "云南", "广西", "广东",
             "海南", "香港", "澳门", "台湾"]
    coord_lines = []
    for i in range(0, len(order), 6):
        chunk = [k for k in order[i:i + 6] if k in coords]
        coord_lines.append("\t\t\t" + " ".join(f"{k}: [{coords[k][0]}, {coords[k][1]}]," for k in chunk))
    outline_js = f"const domesticChinaOutlinePaths = [{','.join(json.dumps(p) for p in outline_paths)}];"
    taiwan_js = f"const domesticTaiwanPath = {json.dumps(taiwan_d)};\n"
    coords_js = "const domesticRegionCoordinates = {\n" + "\n".join(coord_lines) + "\n\t\t};"

    page = open(PAGE, encoding="utf-8").read()
    # 轮廓首次替换时是上游那种多行数组，之后是脚本输出的单行数组，用同一个
    # 非贪婪模式（配合 re.S）两种都能命中
    for pattern, repl in (
        (r"const domesticChinaOutlinePaths = \[.*?\];", outline_js),
        (r"const domesticTaiwanPath = .*?\n", taiwan_js),
        (r"const domesticRegionCoordinates = \{.*?\n\t\t\};", coords_js),
    ):
        page, n = re.subn(pattern, lambda m, r=repl: r, page, count=1, flags=re.S)
        if n != 1:
            raise SystemExit(f"⚠ analytics.astro 里未找到待替换片段：{pattern[:52]}")
    with open(PAGE, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(page)

    print(f"✓ 已写出 {os.path.relpath(SVG_OUT, ROOT)}  {len(svg) / 1024:.1f} KB")
    print(f"  · 主图省级 path {len(svg_parts)} 个")
    print(f"  · 插图：陆地 {len(land)} 环 / 岛礁点 {len(islets)} 个 / 九段线 {len(dash_segments)} 段")
    print(f"  · 轮廓 {len(outline_paths)} 条，台湾 path {len(taiwan_d)} 字符")
    print(f"✓ 已更新 {os.path.relpath(PAGE, ROOT)} 的三段几何数据（建议再跑一次 biome）")


if __name__ == "__main__":
    main()
