(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 520) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var filters = document.querySelectorAll('[data-list-filter]');

  filters.forEach(function (filter) {
    var input = filter.querySelector('[data-filter-input]');
    var type = filter.querySelector('[data-filter-type]');
    var year = filter.querySelector('[data-filter-year]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.category
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !selectedType || (card.dataset.type || '').indexOf(selectedType) !== -1 || (card.dataset.tags || '').indexOf(selectedType) !== -1;
        var matchYear = !selectedYear || card.dataset.year === selectedYear;
        var show = matchQuery && matchType && matchYear;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  });

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.MOVIE_SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var searchInput = document.querySelector('[data-search-page-input]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchNote = document.querySelector('[data-search-note]');
    var searchEmpty = document.querySelector('[data-search-empty]');

    if (searchInput) {
      searchInput.value = q;
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.score) + '</span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    var source = window.MOVIE_SEARCH_INDEX.slice();
    var results;

    if (q) {
      var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      results = source.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();

        return terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
      });

      if (searchTitle) {
        searchTitle.textContent = '搜索结果：' + q;
      }

      if (searchNote) {
        searchNote.textContent = results.length ? '为你找到以下匹配影片。' : '没有找到匹配结果，可尝试更换关键词。';
      }
    } else {
      results = source.slice(0, 48);
    }

    searchResults.innerHTML = results.slice(0, 180).map(card).join('');

    if (searchEmpty) {
      searchEmpty.classList.toggle('show', results.length === 0);
    }
  }
})();
