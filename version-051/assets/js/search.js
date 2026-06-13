(function () {
  var form = document.querySelector('[data-search-form]');
  var keyword = document.querySelector('[data-search-keyword]');
  var region = document.querySelector('[data-search-region]');
  var type = document.querySelector('[data-search-type]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var items = window.SiteVideoIndex || [];

  function textIncludes(value, query) {
    return String(value || '').toLowerCase().indexOf(query) !== -1;
  }

  function createCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 2).join(' · ') : movie.genre;

    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '  <div class="movie-poster">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
      '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-play">▶</span>',
      '    <span class="poster-gradient"></span>',
      '  </div>',
      '  <div class="movie-body">',
      '    <h2 class="movie-title">' + escapeHtml(movie.title) + '</h2>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(String(movie.year || '')) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(tags) + '</span>',
      '    </div>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch() {
    if (!results) {
      return;
    }

    var query = keyword ? keyword.value.trim().toLowerCase() : '';
    var selectedRegion = region ? region.value : '';
    var selectedType = type ? type.value : '';

    var filtered = items.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
      ].join(' ');

      var queryMatched = !query || textIncludes(haystack, query);
      var regionMatched = !selectedRegion || movie.region.indexOf(selectedRegion) !== -1;
      var typeMatched = !selectedType || movie.type.indexOf(selectedType) !== -1;

      return queryMatched && regionMatched && typeMatched;
    }).slice(0, 96);

    results.innerHTML = filtered.map(createCard).join('\n');

    if (status) {
      status.textContent = filtered.length ? '已为你匹配到相关影片' : '暂无相关内容';
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });
  }

  [keyword, region, type].forEach(function (field) {
    if (field) {
      field.addEventListener('input', runSearch);
      field.addEventListener('change', runSearch);
    }
  });

  var params = new URLSearchParams(window.location.search);

  if (keyword && params.get('q')) {
    keyword.value = params.get('q');
  }

  runSearch();
})();
