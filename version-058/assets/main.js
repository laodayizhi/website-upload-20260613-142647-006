(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupNav() {
    var button = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });
    timer = setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupSearch() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-search-box]"));
    boxes.forEach(function (box) {
      var input = box.querySelector("[data-search-input]");
      var type = box.querySelector("[data-filter-type]");
      var region = box.querySelector("[data-filter-region]");
      var category = box.querySelector("[data-filter-category]");
      var count = box.querySelector("[data-match-count]");
      var scope = box.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-card"));
      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
            ok = false;
          }
          if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
            ok = false;
          }
          if (categoryValue && normalize(card.getAttribute("data-category")) !== categoryValue) {
            ok = false;
          }
          card.classList.toggle("hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible ? "匹配 " + visible + " 部" : "暂无匹配";
        }
      }
      [input, type, region, category].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    var video = document.querySelector("video[data-stream]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-play]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hlsInstance = null;
    function loadAndPlay() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (!video.dataset.loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.dataset.loaded = "1";
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", loadAndPlay);
    }
    if (cover) {
      cover.addEventListener("click", loadAndPlay);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        loadAndPlay();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupNav();
    setupHero();
    setupSearch();
    setupPlayer();
  });
})();
