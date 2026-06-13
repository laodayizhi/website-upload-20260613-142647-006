(function () {
  function attachPlayer(options) {
    var video = document.querySelector(options.video);
    var layer = document.querySelector(options.layer);
    var button = document.querySelector(options.button);
    var source = options.source;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      prepared = true;
    }

    function play() {
      prepare();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.SitePlayer = {
    attach: attachPlayer
  };
})();
