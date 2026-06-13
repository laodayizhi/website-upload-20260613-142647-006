(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-menu]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === heroIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var input = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var empty = document.querySelector('[data-empty-state]');
    var grid = cards.length ? cards[0].parentElement : null;

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var minYear = Number(yearFilter && yearFilter.value ? yearFilter.value : 0);
      var typeValue = typeFilter ? typeFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var year = Number(card.getAttribute('data-year') || 0);
        var type = card.getAttribute('data-type') || '';
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !minYear || year >= minYear;
        var matchesType = !typeValue || type === typeValue;
        var shouldShow = matchesKeyword && matchesYear && matchesType;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function applySort() {
      if (!grid || !sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'year-asc') {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        }
        if (value === 'title-asc') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilters();
    }

    [input, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }
  });
})();
