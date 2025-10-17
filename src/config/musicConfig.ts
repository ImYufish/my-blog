import type { MusicPlayerConfig } from "../types/config";

// 音乐播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
  // 基础功能开关
  enable: true, // 启用音乐播放器功能

  // 播放器模式配置
  mode: "meting", // 播放器模式："local" 本地音乐，"meting" 在线音乐

  // Meting API 配置
  meting: {
    // Meting API 地址，默认使用 bilibili.uno 提供的免费服务
    // 你也可以使用其他 Meting API 服务或自建服务
    api: "https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r",

    // 歌单配置
    playlist: {
      id: "14164869977", // 歌单ID
      server: "netease", // 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
      type: "playlist", // 类型：playlist=歌单, album=专辑, song=单曲
    },

    // 备用 API 配置（当主 API 失败时使用）
    fallbackApis: [
      "https://api.injahow.cn/bete/?server=:server&type=:type&id=:id",
      "https://api.uomg.com/api/other/163music?format=json&id=:id",
    ],
  },

  // 本地音乐配置
  local: {
    // 本地音乐文件路径（相对于 public 目录）
    musicPath: "assets/music/",

    // 本地播放列表
    playlist: [
      {
        id: 1,
        title: "ひとり上手",
        artist: "Kaya",
        cover: "assets/music/cover/hitori.jpg",
        url: "assets/music/url/hitori.mp3",
        duration: 240,
      },
      {
        id: 2,
        title: "眩耀夜行",
        artist: "スリーズブーケ",
        cover: "assets/music/cover/xryx.jpg",
        url: "assets/music/url/xryx.mp3",
        duration: 180,
      },
      {
        id: 3,
        title: "春雷の頃",
        artist: "22/7",
        cover: "assets/music/cover/cl.jpg",
        url: "assets/music/url/cl.mp3",
        duration: 200,
      },
    ],
  },

  // 播放器行为配置
  behavior: {
    // 自动播放（注意：现代浏览器通常阻止自动播放）
    autoplay: false,

    // 默认音量 (0-1)
    defaultVolume: 0.7,

    // 默认播放模式
    defaultShuffle: false, // 随机播放
    defaultRepeat: 0, // 循环模式：0=不循环, 1=单曲循环, 2=列表循环

    // 播放器位置
    position: {
      bottom: 16, // 距离底部距离 (px)
      right: 16, // 距离右侧距离 (px)
      left: "auto", // 距离左侧距离 (px)，设为 "auto" 时使用 right 定位
    },

    // 播放器尺寸
    size: {
      mini: {
        width: 280, // 迷你播放器宽度 (px)
        height: 80, // 迷你播放器高度 (px)
      },
      expanded: {
        width: 320, // 展开播放器宽度 (px)
        height: "auto", // 展开播放器高度，auto 为自适应
      },
      hidden: {
        size: 48, // 隐藏状态圆形按钮大小 (px)
      },
    },
  },

  // 界面配置
  ui: {
    // 主题配置
    theme: {
      // 播放器背景透明度
      backgroundOpacity: 0.95,

      // 是否启用毛玻璃效果
      backdropBlur: true,

      // 自定义主题色（留空使用全局主题色）
      primaryColor: "",
    },

    // 动画配置
    animation: {
      // 封面旋转动画
      coverRotation: {
        enable: true, // 启用封面旋转
        speed: 3, // 旋转速度（秒/圈）
        pauseOnHover: true, // 鼠标悬停时暂停旋转
      },

      // 播放器展开/收缩动画
      expandAnimation: {
        duration: 300, // 动画持续时间 (ms)
        easing: "ease-in-out", // 缓动函数
      },

      // 歌曲切换动画
      songTransition: {
        enable: true, // 启用歌曲切换动画
        duration: 200, // 动画持续时间 (ms)
      },
    },

    // 显示配置
    display: {
      // 是否显示播放列表按钮
      showPlaylistButton: true,

      // 是否显示音量控制
      showVolumeControl: true,

      // 是否显示进度条
      showProgressBar: true,

      // 是否显示时间显示
      showTimeDisplay: true,

      // 是否显示随机播放按钮
      showShuffleButton: true,

      // 是否显示循环按钮
      showRepeatButton: true,

      // 是否显示上一首/下一首按钮
      showSkipButtons: true,

      // 是否显示隐藏按钮
      showHideButton: true,
    },

    // 播放列表配置
    playlist: {
      // 播放列表面板最大高度 (px)
      maxHeight: 384,

      // 播放列表面板宽度 (px)
      width: 320,

      // 每页显示歌曲数量（0 为不限制）
      itemsPerPage: 0,

      // 是否显示歌曲序号
      showTrackNumbers: true,

      // 是否显示歌曲时长
      showDuration: true,
    },
  },

  // 响应式配置
  responsive: {
    // 移动端配置
    mobile: {
      // 移动端播放器位置
      position: {
        bottom: 8,
        right: 8,
        left: 8,
      },

      // 移动端播放器尺寸
      size: {
        mini: {
          width: "calc(100vw - 16px)",
          maxWidth: 280,
        },
        expanded: {
          width: "calc(100vw - 16px)",
          maxWidth: "none",
        },
      },

      // 移动端控制按钮尺寸
      controls: {
        buttonSize: 36, // 普通按钮大小 (px)
        playButtonSize: 44, // 播放按钮大小 (px)
        gap: 8, // 按钮间距 (px)
      },
    },

    // 小屏幕配置 (≤480px)
    smallScreen: {
      size: {
        mini: {
          width: 260,
        },
      },
      controls: {
        buttonSize: 32,
        playButtonSize: 40,
        gap: 6,
      },
    },
  },

  // 错误处理配置
  errorHandling: {
    // 是否显示错误提示
    showErrorMessages: true,

    // 错误提示显示时长 (ms)
    errorDisplayDuration: 3000,

    // 是否在播放失败时自动跳转到下一首
    autoSkipOnError: true,

    // 最大重试次数
    maxRetries: 3,
  },

  // 快捷键配置
  shortcuts: {
    // 是否启用快捷键
    enable: true,

    // 快捷键配置
    keys: {
      playPause: "Space", // 播放/暂停
      next: "ArrowRight", // 下一首
      previous: "ArrowLeft", // 上一首
      volumeUp: "ArrowUp", // 音量增加
      volumeDown: "ArrowDown", // 音量减少
      toggleMute: "m", // 静音切换
      toggleShuffle: "s", // 随机播放切换
      toggleRepeat: "r", // 循环模式切换
      togglePlaylist: "p", // 播放列表切换
      toggleExpanded: "e", // 展开/收缩切换
      toggleHidden: "h", // 显示/隐藏切换
    },
  },

  // 存储配置
  storage: {
    // 是否记住播放状态
    rememberPlayState: true,

    // 是否记住音量设置
    rememberVolume: true,

    // 是否记住播放模式设置
    rememberPlayMode: true,

    // 本地存储键名前缀
    storagePrefix: "firefly_music_",
  },
};
