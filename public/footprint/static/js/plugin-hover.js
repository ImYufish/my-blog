/**
 * Plugin: Hover Highlight (悬浮交互插件)
 * 依赖: footprintmap.js 核心
 */
(function () {
    if (!window.FootprintMap) return;

    class HoverPlugin {
        constructor(engine) {
            this.engine = engine;
            this.map = engine.map;
            this.config = window.FootprintMap.CONFIG.HIGHLIGHT;
            this.utils = window.FootprintMap.Utils;
            
            this.regionPolygons = [];
            this.isEnabled = true;

            // 用名字来进行岛屿和大陆的逻辑联动绑定
            this.hoveredName = null;
            this.lockedName = null;
        }

        getSafeStyle(styleObj) {
            const safeStyle = { ...styleObj };
            if (safeStyle.fillOpacity === 0) safeStyle.fillOpacity = 0.01;
            if (safeStyle.strokeOpacity === 0) safeStyle.strokeOpacity = 0.01;
            return safeStyle;
        }

        async init() {
            try {
                const fetchPromises = this.config.geojsonUrls.map(url => 
                    fetch(url).then(res => res.json()).catch(e => null)
                );
                const results = await Promise.all(fetchPromises);
                this.drawRegions(results.filter(g => g !== null));
            } catch (e) {
                console.error('插件数据解析异常:', e);
            }
        }

        drawRegions(geojsonDataArray) {
            const safeDefaultStyle = this.getSafeStyle(this.config.style.default);
            
            if (this.regionPolygons.length > 0) {
                this.map.remove(this.regionPolygons);
            }
            this.regionPolygons = [];

            geojsonDataArray.forEach(geojsonData => {
                const features = geojsonData.features || (geojsonData.type === 'Feature' ? [geojsonData] : []);
                
                features.forEach(feature => {
                    const props = feature.properties || {};
                    const pName = String(props.name || props.ADMIN || props.name_zh || '').toLowerCase();
                    
                    if (['中国', 'china', "people's republic of china", '中华人民共和国'].includes(pName)) {
                        return; 
                    }

                    const geom = feature.geometry;
                    if (!geom) return;

                    let polygonsCoords = [];
                    if (geom.type === 'Polygon') {
                        polygonsCoords = [geom.coordinates];
                    } else if (geom.type === 'MultiPolygon') {
                        polygonsCoords = geom.coordinates;
                    }

                    // 每一座岛屿独立渲染，彻底消灭“拉丝破面”
                    polygonsCoords.forEach(coords => {
                        const polygon = new AMap.Polygon({
                            path: coords, 
                            cursor: 'pointer', 
                            bubble: false,
                            strokeColor: safeDefaultStyle.strokeColor,
                            strokeOpacity: safeDefaultStyle.strokeOpacity,
                            strokeWeight: safeDefaultStyle.strokeWeight,
                            fillColor: safeDefaultStyle.fillColor,
                            fillOpacity: safeDefaultStyle.fillOpacity,
                            zIndex: safeDefaultStyle.zIndex 
                        });
                        
                        polygon._geoJsonGeometry = geom;
                        polygon._properties = props;
                        polygon._pName = pName;

                        this.regionPolygons.push(polygon);

                        polygon.on('mouseover', () => { this.hoveredName = pName; this.refreshStyles(); });
                        polygon.on('mouseout', () => { if (this.hoveredName === pName) { this.hoveredName = null; this.refreshStyles(); }});
                        polygon.on('click', (e) => {
                            e.preventDefault();
                            this.lockedName = (this.lockedName === pName) ? null : pName;
                            this.refreshStyles();
                        });
                    });
                });
            });
            
            this.map.add(this.regionPolygons);
            if (!this.isEnabled) this.regionPolygons.forEach(p => p.hide());
        }

        findNameByPt(pt) {
            const target = this.regionPolygons.find(poly => poly._geoJsonGeometry && this.utils.isPointInGeoJSON(pt, poly._geoJsonGeometry));
            return target ? target._pName : null;
        }

        onMarkerHover(pt) {
            const name = this.findNameByPt(pt);
            if (name) { this.hoveredName = name; this.refreshStyles(); }
        }

        onMarkerOut() {
            this.hoveredName = null; this.refreshStyles();
        }

        onMarkerClick(pt) {
            const name = this.findNameByPt(pt);
            if (name) { this.lockedName = name; this.refreshStyles(); }
        }

        onMapClick() {
            this.lockedName = null; this.refreshStyles();
        }

        updateData() {
            this.lockedName = null; this.hoveredName = null; this.refreshStyles();
        }

        refreshStyles() {
            const safeDefault = this.getSafeStyle(this.config.style.default);
            const safeActive = this.getSafeStyle(this.config.style.active);

            // 【精妙联动】只要名字是一样的（同属一个国家），所有相关的岛屿和大陆就会一起瞬间亮起
            this.regionPolygons.forEach(polygon => {
                if (polygon._pName && (polygon._pName === this.lockedName || polygon._pName === this.hoveredName)) {
                    polygon.setOptions(safeActive);
                } else {
                    polygon.setOptions(safeDefault);
                }
            });
        }

        toggle(enabled) {
            this.isEnabled = enabled;
            this.regionPolygons.forEach(poly => {
                if (enabled) poly.show();
                else poly.hide();
            });
            if (!enabled) { 
                this.lockedName = null; 
                this.hoveredName = null; 
                this.refreshStyles(); 
            }
        }
    }

    window.FootprintMap.Plugins.HoverPlugin = HoverPlugin;
})();