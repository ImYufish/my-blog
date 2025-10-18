<script lang="ts">
    // 导入 Svelte 的生命周期函数和过渡效果
    
    // 导入 Icon 组件，用于显示图标
    import Icon from "@iconify/svelte";
    import { onDestroy, onMount } from "svelte";
    import { slide } from "svelte/transition";
    // 从配置文件中导入音乐播放器配置
    import { musicPlayerConfig } from "../../config/musicConfig";
    // 导入国际化相关的 Key 和 i18n 实例
    import Key from "../../i18n/i18nKey";
    import { i18n } from "../../i18n/translation";
    
    // 从配置中获取各种设置
    const config = musicPlayerConfig;
    
    // 音乐播放器模式，可选 "local" 或 "meting"
    let mode = config.mode ?? "meting";
    
    // Meting API 配置
    let meting_api = config.meting?.api ?? "https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
    let meting_id = config.meting?.playlist?.id ?? "8814137515";
    let meting_server = config.meting?.playlist?.server ?? "netease";
    let meting_type = config.meting?.playlist?.type ?? "playlist";
    let fallback_apis = config.meting?.fallbackApis ?? [];
    
    // 本地音乐配置
    let local_playlist = config.local?.playlist ?? [];
    
    // 行为配置
    let autoplay = config.behavior?.autoplay ?? false;
    let default_volume = config.behavior?.defaultVolume ?? 0.7;
    let default_shuffle = config.behavior?.defaultShuffle ?? false;
    let default_repeat = config.behavior?.defaultRepeat ?? 0;
    
    // 位置配置
    let position_bottom = config.behavior?.position?.bottom ?? 16;
    let position_right = config.behavior?.position?.right ?? 16;
    let position_left = config.behavior?.position?.left ?? "auto";
    
    
    // UI 配置
    let show_playlist_button = config.ui?.display?.showPlaylistButton ?? true;
    let show_volume_control = config.ui?.display?.showVolumeControl ?? true;
    let show_shuffle_button = config.ui?.display?.showShuffleButton ?? true;
    let show_repeat_button = config.ui?.display?.showRepeatButton ?? true;
    let show_skip_buttons = config.ui?.display?.showSkipButtons ?? true;
    
    // 播放列表配置
    let playlist_max_height = config.ui?.playlist?.maxHeight ?? 384;
    let playlist_width = config.ui?.playlist?.width ?? 320;
    let show_track_numbers = config.ui?.playlist?.showTrackNumbers ?? true;
    let show_duration = config.ui?.playlist?.showDuration ?? true;
    
    // 动画配置
    let cover_rotation_enable = config.ui?.animation?.coverRotation?.enable ?? true;
    let cover_rotation_speed = config.ui?.animation?.coverRotation?.speed ?? 3;
    let cover_rotation_pause_hover = config.ui?.animation?.coverRotation?.pauseOnHover ?? true;
    
    // 错误处理配置
    let show_error_messages = config.errorHandling?.showErrorMessages ?? true;
    let error_display_duration = config.errorHandling?.errorDisplayDuration ?? 3000;
    let auto_skip_on_error = config.errorHandling?.autoSkipOnError ?? true;
    
    
    // 播放状态，默认为 false (未播放)
    let isPlaying = false;
    // 播放器是否展开，默认为 false
    let isExpanded = false;
    // 播放器是否折叠贴边，默认为 true（默认显示折叠状态）
    let isCollapsed = true;
    // 是否显示播放列表，默认为 false
    let showPlaylist = false;
    // 当前播放时间，默认为 0
    let currentTime = 0;
    // 歌曲总时长，默认为 0
    let duration = 0;
    // 音量，从配置中获取默认值
    let volume = default_volume;
    // 是否静音，默认为 false
    let isMuted = false;
    // 是否正在加载，默认为 false
    let isLoading = false;
    // 是否随机播放，从配置中获取默认值
    let isShuffled = default_shuffle;
    // 循环模式，从配置中获取默认值
    let isRepeating = default_repeat;
    // 错误信息，默认为空字符串
    let errorMessage = "";
    // 是否显示错误信息，默认为 false
    let showError = false;
    
    // 当前歌曲信息
    let currentSong = {
        title: "Loading ...",
        artist: "Loading ...", 
        cover: "/favicon/favicon-light-192.png",
        url: "",
        duration: 0,
    };
    
    let playlist: Array<{
        id: number;
        title: string;
        artist: string;
        cover: string;
        url: string;
        duration: number;
    }> = [];
    let currentIndex = 0;
    let audio: HTMLAudioElement;
    let progressBar: HTMLElement;
    let volumeBar: HTMLElement;
    
    async function fetchMetingPlaylist() {
        if (!meting_api || !meting_id) return;
        isLoading = true;
        
        // 尝试主API
        const apis = [meting_api, ...fallback_apis];
        
        for (let i = 0; i < apis.length; i++) {
            try {
                const apiUrl = apis[i]
                    .replace(":server", meting_server)
                    .replace(":type", meting_type)
                    .replace(":id", meting_id)
                    .replace(":auth", "")
                    .replace(":r", Date.now().toString());
                
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error(`API ${i + 1} error: ${res.status}`);
                
                const list = await res.json();
                playlist = list.map((song) => {
                    let title = song.name ?? song.title ?? "未知歌曲";
                    let artist = song.artist ?? song.author ?? "未知艺术家";
                    let dur = song.duration ?? 0;
                    if (dur > 10000) dur = Math.floor(dur / 1000);
                    if (!Number.isFinite(dur) || dur <= 0) dur = 0;
                    return {
                        id: song.id,
                        title,
                        artist,
                        cover: song.pic ?? "",
                        url: song.url ?? "",
                        duration: dur,
                    };
                });
                
                if (playlist.length > 0) {
                    loadSong(playlist[0]);
                }
                isLoading = false;
                return; // 成功获取，退出循环
                
            } catch (e) {
                console.warn(`API ${i + 1} failed:`, e);
                if (i === apis.length - 1) {
                    // 所有API都失败了
                    showErrorMessage("所有 Meting API 都无法访问，请检查网络连接");
                    isLoading = false;
                }
            }
        }
    }
    
    function togglePlay() {
        if (!audio || !currentSong.url) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    }
    
    function toggleExpanded() {
        isExpanded = !isExpanded;
        if (isExpanded) {
            showPlaylist = false;
            isCollapsed = false;
        }
    }
    

    function toggleCollapsed() {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            isExpanded = false;
            showPlaylist = false;
        } else {
            // 从折叠状态展开时，直接显示完整播放器
            isExpanded = true;
            showPlaylist = false;
        }
    }
    
    function togglePlaylist() {
        showPlaylist = !showPlaylist;
    }
    
    function toggleShuffle() {
        isShuffled = !isShuffled;
    }
    
    function toggleRepeat() {
        isRepeating = (isRepeating + 1) % 3;
    }
    
    function previousSong() {
        if (playlist.length === 0) return;
        const newIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
        playSong(newIndex);
    }
    
    function nextSong() {
        if (playlist.length === 0) return;
        
        let newIndex: number;
        if (isShuffled) {
            do {
                newIndex = Math.floor(Math.random() * playlist.length);
            } while (newIndex === currentIndex && playlist.length > 1);
        } else {
            newIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
        }
        console.log('nextSong 调用', { currentIndex, newIndex, playlistLength: playlist.length, isShuffled });
        playSong(newIndex);
    }
    
    function playSong(index: number) {
        if (index < 0 || index >= playlist.length) return;
        const wasPlaying = isPlaying;
        currentIndex = index;
        if (audio) audio.pause();
        loadSong(playlist[currentIndex]);
        if (wasPlaying || !isPlaying) {
            setTimeout(() => {
                if (!audio) return;
                if (audio.readyState >= 2) {
                    audio.play().catch(() => {});
                } else {
                    audio.addEventListener(
                        "canplay",
                        () => {
                            audio.play().catch(() => {});
                        },
                        { once: true },
                    );
                }
            }, 100);
        }
    }
    
    function getAssetPath(path: string): string {
        if (path.startsWith("http://") || path.startsWith("https://")) return path;
        if (path.startsWith("/")) return path;
        return `/${path}`;
    }
    
    
    function loadSong(song: typeof currentSong) {
        if (!song || !audio) return;
        currentSong = { ...song };
        if (song.url) {
            isLoading = true;
            audio.pause();
            audio.currentTime = 0;
            currentTime = 0;
            duration = song.duration ?? 0;
            audio.removeEventListener("loadeddata", handleLoadSuccess);
            audio.removeEventListener("error", handleLoadError);
            audio.removeEventListener("loadstart", handleLoadStart);
            audio.addEventListener("loadeddata", handleLoadSuccess, { once: true });
            audio.addEventListener("error", handleLoadError, { once: true });
            audio.addEventListener("loadstart", handleLoadStart, { once: true });
            audio.src = getAssetPath(song.url);
            audio.load();
        } else {
            isLoading = false;
        }
    }
    
    function handleLoadSuccess() {
        isLoading = false;
        if (audio?.duration && audio.duration > 1) {
            duration = Math.floor(audio.duration);
            if (playlist[currentIndex]) playlist[currentIndex].duration = duration;
            currentSong.duration = duration;
        }
    }
    
    function handleLoadError(event: Event) {
        isLoading = false;
        showErrorMessage(`无法播放 "${currentSong.title}"，正在尝试下一首...`);
        if (auto_skip_on_error && playlist.length > 1) {
            setTimeout(() => nextSong(), 1000);
        } else if (playlist.length <= 1) {
            showErrorMessage("播放列表中没有可用的歌曲");
        }
    }
    
    function handleLoadStart() {}
    
    function showErrorMessage(message: string) {
        if (!show_error_messages) return;
        errorMessage = message;
        showError = true;
        setTimeout(() => {
            showError = false;
        }, error_display_duration);
    }
    function hideError() {
        showError = false;
    }
    
    function setProgress(event: MouseEvent) {
        if (!audio || !progressBar) return;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        audio.currentTime = newTime;
        currentTime = newTime;
    }
    
    function setVolume(event: MouseEvent) {
        if (!audio || !volumeBar) return;
        const rect = volumeBar.getBoundingClientRect();
        const percent = Math.max(
            0,
            Math.min(1, (event.clientX - rect.left) / rect.width),
        );
        volume = percent;
        audio.volume = volume;
        isMuted = volume === 0;
    }
    
    function toggleMute() {
        if (!audio) return;
        isMuted = !isMuted;
        audio.muted = isMuted;
    }
    
    function formatTime(seconds: number): string {
        if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    
    function handleAudioEvents() {
        if (!audio) return;
        audio.addEventListener("play", () => {
            isPlaying = true;
        });
        audio.addEventListener("pause", () => {
            isPlaying = false;
        });
        audio.addEventListener("timeupdate", () => {
            currentTime = audio.currentTime;
        });
        audio.addEventListener("ended", () => {
            console.log('歌曲播放结束', { isRepeating, currentIndex, playlistLength: playlist.length, isShuffled });
            if (isRepeating === 1) {
                // 单曲循环：重新播放当前歌曲
                console.log('单曲循环：重新播放当前歌曲');
                audio.currentTime = 0;
                audio.play().catch(() => {});
            } else if (isRepeating === 2) {
                // 列表循环：播放下一首
                console.log('列表循环：播放下一首');
                nextSong();
            } else if (currentIndex < playlist.length - 1 || isShuffled) {
                // 非循环模式：如果还有下一首或随机播放，则播放下一首
                console.log('非循环模式：播放下一首');
                nextSong();
            } else {
                // 非循环模式：播放列表结束，停止播放
                console.log('非循环模式：播放列表结束，停止播放');
                isPlaying = false;
            }
        });
        audio.addEventListener("error", (event) => {
            isLoading = false;
        });
        audio.addEventListener("stalled", () => {});
        audio.addEventListener("waiting", () => {});
    }
    
    onMount(() => {
        audio = new Audio();
        audio.volume = volume;
        audio.muted = isMuted;
        handleAudioEvents();
        
        if (!musicPlayerConfig.enable) {
            return;
        }
        
        if (mode === "meting") {
            fetchMetingPlaylist().then(() => {
                // 如果启用了自动播放，则开始播放
                if (autoplay && playlist.length > 0) {
                    setTimeout(() => {
                        if (audio && audio.readyState >= 2) {
                            audio.play().catch(() => {});
                        }
                    }, 1000);
                }
            });
        } else {
            // 使用本地播放列表，不发送任何API请求
            playlist = [...local_playlist];
            if (playlist.length > 0) {
                loadSong(playlist[0]);
                // 如果启用了自动播放，则开始播放
                if (autoplay) {
                    setTimeout(() => {
                        if (audio && audio.readyState >= 2) {
                            audio.play().catch(() => {});
                        }
                    }, 1000);
                }
            } else {
                showErrorMessage("本地播放列表为空");
            }
        }
    });
    
    onDestroy(() => {
        if (audio) {
            audio.pause();
            audio.src = "";
        }
    });
    </script>
    
    {#if musicPlayerConfig.enable}
    {#if showError}
    <div class="fixed bottom-20 right-4 z-[60] max-w-sm">
        <div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
            <Icon icon="material-symbols:error" class="text-xl flex-shrink-0" />
            <span class="text-sm flex-1">{errorMessage}</span>
            <button on:click={hideError} class="text-white/80 hover:text-white transition-colors">
                <Icon icon="material-symbols:close" class="text-lg" />
            </button>
        </div>
    </div>
    {/if}
    
    <div class="music-player fixed z-[1001] transition-all duration-300 ease-in-out"
         class:expanded={isExpanded}
         class:collapsed-mode={isCollapsed}
         style="bottom: {position_bottom}px; right: {position_right}px; {position_left !== 'auto' ? `left: ${position_left}px;` : ''}; --rotation-speed: {cover_rotation_speed}s; --rotation-pause-hover: {cover_rotation_pause_hover ? 'paused' : 'running'};">

        
        <!-- 折叠贴边状态 - 只显示封面和展开按钮 -->
        <div class="collapsed-player card-base bg-[var(--float-panel-bg)] dark:bg-zinc-800/90 dark:backdrop-blur-md dark:border dark:border-zinc-700/50 rounded-2xl p-3 transition-all duration-500 ease-in-out"
             style="width: 90px; height: 80px; background-color: var(--card-bg); "
             class:opacity-0={!isCollapsed}
             class:scale-95={!isCollapsed}
             class:pointer-events-none={!isCollapsed}>
            <div class="flex items-center gap-2 h-full">
                <!-- 封面区域 -->
                <div class="cover-container relative w-12 h-12 rounded-full overflow-hidden cursor-pointer flex-shrink-0"
                     on:click={togglePlay}
                     on:keydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            togglePlay();
                        }
                     }}
                     tabindex="0"
                     role="button"
                     aria-label={isPlaying ? "暂停音乐" : "播放音乐"}>
                    {#if currentSong.cover}
                        <img src={currentSong.cover} 
                             alt="{currentSong.title} - {currentSong.artist}"
                             class="w-full h-full object-cover transition-transform duration-300"
                             class:spinning={isPlaying && !isLoading && cover_rotation_enable}
                             class:animate-pulse={isLoading}
                             style="animation-duration: {cover_rotation_speed}s;" />
                    {:else}
                        <div class="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 flex items-center justify-center">
                            <Icon icon="fa6-solid:music" class="text-white text-lg" />
                        </div>
                    {/if}
                    <!-- 播放状态指示器 -->
                    {#if isPlaying}
                        <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div class="w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
                                <div class="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
                            </div>
                        </div>
                    {/if}
                </div>
                
                <!-- 展开按钮 -->
                <button class="expand-btn w-8 h-8 rounded-full btn-regular border border-[var(--line-divider)] hover:border-[var(--primary)] active:scale-95 transition-all duration-200 flex items-center justify-center flex-shrink-0"
                        on:click={toggleCollapsed}
                        on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleCollapsed();
                            }
                        }}
                        tabindex="0"
                        aria-label="展开音乐播放器">
                    <Icon icon="fa6-solid:chevron-left" class="text-[var(--primary)] text-sm" />
                </button>
            </div>
        </div>
        
        <!-- 展开状态的完整播放器（封面圆形） -->
        <div class="expanded-player card-base bg-[var(--float-panel-bg)] dark:bg-zinc-800/90 dark:backdrop-blur-md dark:border dark:border-zinc-700/50 rounded-2xl p-4 transition-all duration-500 ease-in-out"
             style="width: 320px; background-color: var(--card-bg);"
             class:opacity-0={!isExpanded}
             class:scale-95={!isExpanded}
             class:pointer-events-none={!isExpanded}>
            <div class="flex items-center gap-4 mb-4">
                <div class="cover-container relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
                     title="{currentSong.title} - {currentSong.artist}">
                    <img src={getAssetPath(currentSong.cover)} alt="封面"
                         class="w-full h-full object-cover transition-transform duration-300"
                         class:spinning={isPlaying && !isLoading && cover_rotation_enable}
                         class:animate-pulse={isLoading}
                         style="animation-duration: {cover_rotation_speed}s;" />
                </div>
                <div class="flex-1 min-w-0">
                    <div class="song-title text-lg font-bold text-90 truncate mb-1">{currentSong.title}</div>
                    <div class="song-artist text-sm text-50 truncate">{currentSong.artist}</div>
                    <div class="text-xs text-30 mt-1">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"
                            on:click={toggleCollapsed}>
                        <Icon icon="material-symbols:expand-more" class="text-lg" />
                    </button>
                </div>
            </div>
            <div class="progress-section mb-4">
                <div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer"
                     bind:this={progressBar}
                     on:click={setProgress}
                     on:keydown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             const rect = progressBar.getBoundingClientRect();
                             const percent = 0.5;
                             const newTime = percent * duration;
                             if (audio) {
                                 audio.currentTime = newTime;
                                 currentTime = newTime;
                             }
                         }
                     }}
                     role="slider"
                     tabindex="0"
                     aria-label="播放进度"
                     aria-valuemin="0"
                     aria-valuemax="100"
                     aria-valuenow={duration > 0 ? (currentTime / duration * 100) : 0}>
                    <div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"
                         style="width: {duration > 0 ? (currentTime / duration) * 100 : 0}%"></div>
                </div>
            </div>
            <div class="controls flex items-center justify-center gap-2 mb-4">
                <!-- 随机按钮高亮 -->
                {#if show_shuffle_button}
                <button class="w-10 h-10 rounded-lg"
                        class:btn-regular={isShuffled}
                        class:btn-plain={!isShuffled}
                        on:click={toggleShuffle}
                        disabled={playlist.length <= 1}>
                    <Icon icon="material-symbols:shuffle" class="text-lg" />
                </button>
                {/if}
                {#if show_skip_buttons}
                <button class="btn-plain w-10 h-10 rounded-lg" on:click={previousSong}
                        disabled={playlist.length <= 1}>
                    <Icon icon="material-symbols:skip-previous" class="text-xl" />
                </button>
                {/if}
                <button class="btn-regular w-12 h-12 rounded-full"
                        class:opacity-50={isLoading}
                        disabled={isLoading}
                        on:click={togglePlay}>
                    {#if isLoading}
                        <Icon icon="eos-icons:loading" class="text-xl" />
                    {:else if isPlaying}
                        <Icon icon="material-symbols:pause" class="text-xl" />
                    {:else}
                        <Icon icon="material-symbols:play-arrow" class="text-xl" />
                    {/if}
                </button>
                {#if show_skip_buttons}
                <button class="btn-plain w-10 h-10 rounded-lg" on:click={nextSong}
                        disabled={playlist.length <= 1}>
                    <Icon icon="material-symbols:skip-next" class="text-xl" />
                </button>
                {/if}
                <!-- 循环按钮高亮 -->
                {#if show_repeat_button}
                <button class="w-10 h-10 rounded-lg"
                        class:btn-regular={isRepeating > 0}
                        class:btn-plain={isRepeating === 0}
                        on:click={toggleRepeat}>
                    {#if isRepeating === 1}
                        <Icon icon="material-symbols:repeat-one" class="text-lg" />
                    {:else if isRepeating === 2}
                        <Icon icon="material-symbols:repeat" class="text-lg" />
                    {:else}
                        <Icon icon="material-symbols:repeat" class="text-lg opacity-50" />
                    {/if}
                </button>
                {/if}
            </div>
            <div class="bottom-controls flex items-center gap-2">
                {#if show_volume_control}
                <button class="btn-plain w-8 h-8 rounded-lg" on:click={toggleMute}>
                    {#if isMuted || volume === 0}
                        <Icon icon="material-symbols:volume-off" class="text-lg" />
                    {:else if volume < 0.5}
                        <Icon icon="material-symbols:volume-down" class="text-lg" />
                    {:else}
                        <Icon icon="material-symbols:volume-up" class="text-lg" />
                    {/if}
                </button>
                <div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer"
                     bind:this={volumeBar}
                     on:click={setVolume}
                     on:keydown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             if (e.key === 'Enter') toggleMute();
                         }
                     }}
                     role="slider"
                     tabindex="0"
                     aria-label="音量控制"
                     aria-valuemin="0"
                     aria-valuemax="100"
                     aria-valuenow={volume * 100}>
                    <div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"
                         style="width: {volume * 100}%"></div>
                </div>
                {/if}
                {#if show_playlist_button}
                <button class="btn-plain w-8 h-8 rounded-lg"
                        class:text-[var(--primary)]={showPlaylist}
                        on:click={togglePlaylist}>
                    <Icon icon="material-symbols:queue-music" class="text-lg" />
                </button>
                {/if}
            </div>
        </div>
        {#if showPlaylist}
            <div class="playlist-panel float-panel fixed bottom-20 right-4 overflow-hidden z-50"
                 style="width: {playlist_width}px; max-height: {playlist_max_height}px;"
                 transition:slide={{ duration: 300, axis: 'y' }}>
                <div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]">
                    <h3 class="text-lg font-semibold text-90">{i18n(Key.playlist)}</h3>
                    <button class="btn-plain w-8 h-8 rounded-lg" on:click={togglePlaylist}>
                        <Icon icon="material-symbols:close" class="text-lg" />
                    </button>
                </div>
                <div class="playlist-content overflow-y-auto max-h-80 scrollbar-custom">
                    {#each playlist as song, index}
                        <div class="playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors"
                             class:bg-[var(--btn-plain-bg)]={index === currentIndex}
                             class:text-[var(--primary)]={index === currentIndex}
                             on:click={() => playSong(index)}
                             on:keydown={(e) => {
                                 if (e.key === 'Enter' || e.key === ' ') {
                                     e.preventDefault();
                                     playSong(index);
                                 }
                             }}
                             role="button"
                             tabindex="0"
                             aria-label="播放 {song.title} - {song.artist}">
                            {#if show_track_numbers}
                            <div class="w-6 h-6 flex items-center justify-center">
                                {#if index === currentIndex && isPlaying}
                                    <Icon icon="material-symbols:graphic-eq" class="text-[var(--primary)] animate-pulse" />
                                {:else if index === currentIndex}
                                    <Icon icon="material-symbols:pause" class="text-[var(--primary)]" />
                                {:else}
                                    <span class="text-sm text-[var(--content-meta)]">{index + 1}</span>
                                {/if}
                            </div>
                            {/if}
                            <!-- 歌单列表内封面仍为圆角矩形 -->
                            <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0">
                                <img src={getAssetPath(song.cover)} alt={song.title} class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium truncate" class:text-[var(--primary)]={index === currentIndex} class:text-90={index !== currentIndex}>
                                    {song.title}
                                </div>
                                <div class="text-sm text-[var(--content-meta)] truncate" class:text-[var(--primary)]={index === currentIndex}>
                                    {song.artist}
                                    {#if show_duration && song.duration > 0}
                                        <span class="ml-2">({formatTime(song.duration)})</span>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
    
    <style>

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes musicWave {
        0%, 100% { transform: scaleY(0.5); }
        50% { transform: scaleY(1); }
    }
    .music-player.collapsed-mode {
        width: 96px;
        height: 80px;
    }
    .music-player {
        max-width: 320px;
        user-select: none;
    }
    .expanded-player {
        width: 320px;
        position: absolute;
        bottom: 0;
        right: 0;
    }
    
    .collapsed-player {
        position: absolute;
        bottom: 0;
        right: 0;
        backdrop-filter: blur(12px);
    }
    
    .collapsed-player {
        border: 1px solid var(--line-divider) !important;
    }
    
    .expanded-player {
        border: 1px solid var(--line-divider) !important;
    }
    
    
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
    .progress-section div:hover,
    .bottom-controls > div:hover {
        transform: scaleY(1.2);
        transition: transform 0.2s ease;
    }
    @media (max-width: 768px) {
        .music-player {
            max-width: 280px;
            /*left: 8px !important;*/
            bottom: 8px !important;
            right: 8px !important;
        }
        .music-player.expanded {
            width: calc(100vw - 16px);
            max-width: none;
            /*left: 8px !important;*/
            right: 8px !important;
        }
        .playlist-panel {
            width: calc(100vw - 16px) !important;
            /*left: 8px !important;*/
            right: 8px !important;
            max-width: none;
        }
        .controls {
            gap: 8px;
        }
        .controls button {
            width: 36px;
            height: 36px;
        }
        .controls button:nth-child(3) {
            width: 44px;
            height: 44px;
        }
    }
    @media (max-width: 480px) {
        .music-player {
            max-width: 260px;
        }
        .song-title {
            font-size: 14px;
        }
        .song-artist {
            font-size: 12px;
        }
        .controls {
            gap: 6px;
            margin-bottom: 12px;
        }
        .controls button {
            width: 32px;
            height: 32px;
        }
        .controls button:nth-child(3) {
            width: 40px;
            height: 40px;
        }
        .playlist-item {
            padding: 8px 12px;
        }
        .playlist-item .w-10 {
            width: 32px;
            height: 32px;
        }
    }
    @keyframes slide-up {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
    @media (hover: none) and (pointer: coarse) {
        .music-player button,
        .playlist-item {
            min-height: 44px;
        }
        .progress-section > div,
        .bottom-controls > div:nth-child(2) {
            height: 12px;
        }
    }
    /* 自定义旋转动画，停止时保持当前位置 */
    @keyframes spin-continuous {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    .cover-container img {
        animation: spin-continuous 3s linear infinite;
        animation-play-state: paused;
    }
    
    .cover-container img.spinning {
        animation-play-state: running;
    }
    
    .cover-container img:hover {
        animation-play-state: var(--rotation-pause-hover, running);
    }
    
    /* 让主题色按钮更有视觉反馈 */
    button.bg-\[var\(--primary\)\] {
        box-shadow: 0 0 0 2px var(--primary);
        border: none;
    }
    
    /* 播放列表自定义滚动条样式 */
    .scrollbar-custom {
        scrollbar-width: thin;
        scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
    }
    
    .scrollbar-custom::-webkit-scrollbar {
        width: 6px;
    }
    
    .scrollbar-custom::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
    }
    
    .scrollbar-custom::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.3);
        border-radius: 3px;
        transition: background-color 0.2s ease;
    }
    
    .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.5);
    }
    
    .scrollbar-custom::-webkit-scrollbar-thumb:active {
        background-color: rgba(156, 163, 175, 0.7);
    }
    
    /* 暗色模式下的滚动条样式 */
    :global(.dark) .scrollbar-custom {
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }
    
    :global(.dark) .scrollbar-custom::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
    }
    
    :global(.dark) .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
    
    :global(.dark) .scrollbar-custom::-webkit-scrollbar-thumb:active {
        background-color: rgba(255, 255, 255, 0.4);
    }
    </style>
    {/if}