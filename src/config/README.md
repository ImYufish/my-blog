# 配置文件说明

## 音乐播放器配置 (musicConfig.ts)

音乐播放器现在支持丰富的配置选项，所有配置都在 `/src/config/musicConfig.ts` 文件中。

### 基础配置

```typescript
export const musicPlayerConfig: MusicPlayerConfig = {
  enable: true, // 启用音乐播放器功能
  mode: "meting", // 播放器模式："local" 本地音乐，"meting" 在线音乐
}
```

### 主要配置类别

#### 1. Meting API 配置
- 支持多个音乐平台（网易云、QQ音乐、酷狗等）
- 可配置备用API
- 支持歌单、专辑、单曲等类型

#### 2. 本地音乐配置
- 自定义本地音乐文件路径
- 配置本地播放列表
- 支持相对路径和绝对路径

#### 3. 播放器行为配置
- 自动播放设置
- 默认音量和播放模式
- 播放器位置和尺寸
- 响应式布局配置

#### 4. 界面配置
- 主题和动画设置
- 控制按钮显示/隐藏
- 播放列表显示选项
- 封面旋转动画配置

#### 5. 错误处理配置
- 错误消息显示设置
- 自动跳过失败歌曲
- 重试机制配置

#### 6. 快捷键配置
- 全局快捷键支持
- 自定义快捷键绑定
- 键盘操作优化

#### 7. 存储配置
- 播放状态记忆
- 音量设置记忆
- 播放模式记忆

### 使用示例

#### 切换到本地音乐模式
```typescript
export const musicPlayerConfig: MusicPlayerConfig = {
  enable: true,
  mode: "local",
  local: {
    musicPath: "assets/music/",
    playlist: [
      {
        id: 1,
        title: "歌曲名称",
        artist: "艺术家",
        cover: "assets/music/cover/song.jpg",
        url: "assets/music/song.mp3",
        duration: 240,
      }
    ]
  }
}
```

#### 自定义播放器外观
```typescript
export const musicPlayerConfig: MusicPlayerConfig = {
  enable: true,
  behavior: {
    position: {
      bottom: 20,
      right: 20,
    },
    size: {
      mini: { width: 300, height: 100 },
      expanded: { width: 400 },
    }
  },
  ui: {
    display: {
      showVolumeControl: false,
      showShuffleButton: false,
    }
  }
}
```

#### 配置快捷键
```typescript
export const musicPlayerConfig: MusicPlayerConfig = {
  enable: true,
  shortcuts: {
    enable: true,
    keys: {
      playPause: "Space",
      next: "ArrowRight",
      previous: "ArrowLeft",
      toggleMute: "m",
    }
  }
}
```

### 响应式配置

音乐播放器支持移动端和小屏幕设备的专门配置：

```typescript
responsive: {
  mobile: {
    position: { bottom: 8, right: 8, left: 8 },
    size: {
      mini: { width: "calc(100vw - 16px)", maxWidth: 280 },
      expanded: { width: "calc(100vw - 16px)", maxWidth: "none" },
    },
    controls: { buttonSize: 36, playButtonSize: 44, gap: 8 }
  },
  smallScreen: {
    size: { mini: { width: 260 } },
    controls: { buttonSize: 32, playButtonSize: 40, gap: 6 }
  }
}
```

### 注意事项

1. 所有配置项都有默认值，可以根据需要选择性配置
2. 修改配置后需要重启开发服务器才能生效
3. 某些配置（如自动播放）可能受到浏览器安全策略限制
4. 本地音乐文件需要放在 `public` 目录下
5. Meting API 的可用性可能因网络环境而异

### 配置验证

配置系统会自动验证配置项的有效性，无效的配置会使用默认值。建议在修改配置后检查浏览器控制台是否有相关警告。
