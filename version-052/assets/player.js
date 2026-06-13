(function () {
  var configElement = document.getElementById('video-config');
  var video = document.querySelector('.movie-video');
  var overlay = document.querySelector('.player-overlay');
  var trigger = document.querySelector('.play-trigger');

  if (!configElement || !video) {
    return;
  }

  var config = {};

  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var source = config.src;
  var hls = null;
  var started = false;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function playVideo() {
    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  function startPlayer() {
    if (!source) {
      return;
    }

    hideOverlay();

    if (!started) {
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
      } else {
        video.src = source;
        video.load();
      }
    }

    playVideo();
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayer);
  }

  if (trigger) {
    trigger.addEventListener('click', startPlayer);
  }

  video.addEventListener('click', function () {
    if (!started) {
      startPlayer();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}());
