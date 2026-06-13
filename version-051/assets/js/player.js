(function () {
  function setMessage(shell, text) {
    var box = shell.querySelector('.player-message');

    if (!box) {
      return;
    }

    box.textContent = text;
    shell.classList.toggle('has-message', Boolean(text));
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hls = null;

    function bindStream() {
      if (!stream || video.getAttribute('data-bound') === 'true') {
        return;
      }

      video.setAttribute('data-bound', 'true');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage(shell, '播放暂时不可用，请稍后重试');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage(shell, '正在恢复播放');
            hls.recoverMediaError();
          } else {
            setMessage(shell, '播放暂时不可用，请稍后重试');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      bindStream();

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          setMessage(shell, '请再次点击播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      setMessage(shell, '');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    video.addEventListener('error', function () {
      setMessage(shell, '播放暂时不可用，请稍后重试');
    });

    bindStream();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
