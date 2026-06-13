(function () {
  var video = document.querySelector('#movie-player');
  var playButton = document.querySelector('[data-play-button]');
  var status = document.querySelector('[data-player-status]');
  var hlsInstance = null;
  var hlsConstructor = null;

  if (!video || !playButton) {
    return;
  }

  function setStatus(message) {
    if (!status) {
      return;
    }

    status.textContent = message || '';
    status.classList.toggle('show', Boolean(message));
  }

  async function getHlsConstructor() {
    if (hlsConstructor) {
      return hlsConstructor;
    }

    if (window.Hls) {
      hlsConstructor = window.Hls;
      return hlsConstructor;
    }

    try {
      var module = await import('./hls-vendor.js');
      hlsConstructor = module.H || module.default || null;
      return hlsConstructor;
    } catch (error) {
      return null;
    }
  }

  async function attachSource() {
    var source = video.getAttribute('data-src');

    if (!source) {
      setStatus('播放源暂不可用');
      return false;
    }

    if (video.dataset.ready === 'true') {
      return true;
    }

    if (/\.m3u8(\?|$)/i.test(source)) {
      var Hls = await getHlsConstructor();

      if (Hls && Hls.isSupported && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        if (Hls.Events && Hls.Events.ERROR) {
          hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放连接异常，请刷新后重试');
            }
          });
        }

        video.dataset.ready = 'true';
        return true;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.ready = 'true';
        return true;
      }

      setStatus('当前浏览器不支持 HLS 播放');
      return false;
    }

    video.src = source;
    video.dataset.ready = 'true';
    return true;
  }

  playButton.addEventListener('click', async function () {
    setStatus('正在加载播放源...');
    var ready = await attachSource();

    if (!ready) {
      return;
    }

    playButton.classList.add('hidden');
    setStatus('');

    try {
      await video.play();
    } catch (error) {
      setStatus('请再次点击视频播放按钮开始播放');
    }
  });

  video.addEventListener('play', function () {
    playButton.classList.add('hidden');
    setStatus('');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance && hlsInstance.destroy) {
      hlsInstance.destroy();
    }
  });
})();
