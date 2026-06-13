(function () {
  var video = document.querySelector("[data-video]");
  var cover = document.querySelector("[data-player-cover]");

  if (!video) {
    return;
  }

  var src = video.getAttribute("data-stream");
  var hls;

  function load() {
    if (!src) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = src;
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!hls) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      }
    } else if (!video.src) {
      video.src = src;
    }
  }

  function play() {
    load();

    if (cover) {
      cover.classList.add("hidden");
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (!video.src && !hls) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("hidden");
    }
  });
})();
