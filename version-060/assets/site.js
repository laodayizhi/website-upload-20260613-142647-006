(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        start();
    }

    function setupMissingImages() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            });
        });
    }

    function setupLocalFilters() {
        qsa('[data-local-filter], [data-global-filter]').forEach(function (form) {
            var root = form.closest('main') || document;
            var grid = qs('[data-filter-grid]', root);
            var input = qs('[data-filter-input]', form);
            var yearFilter = qs('[data-year-filter]', form);
            var typeFilter = qs('[data-type-filter]', form);
            var clear = qs('[data-clear-filter]', form);
            var activeCategory = '';
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';

            if (!grid) {
                return;
            }
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            qsa('[data-category-filter]', root).forEach(function (button) {
                button.addEventListener('click', function () {
                    qsa('[data-category-filter]', root).forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    button.classList.add('is-active');
                    activeCategory = button.getAttribute('data-category-filter') || '';
                    apply();
                });
            });

            function apply() {
                var query = normalize(input ? input.value : '');
                var year = yearFilter ? yearFilter.value : '';
                var type = typeFilter ? typeFilter.value : '';
                qsa('[data-movie-card]', grid).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var okQuery = !query || haystack.indexOf(query) !== -1;
                    var okYear = !year || card.getAttribute('data-year') === year;
                    var okType = !type || card.getAttribute('data-type') === type;
                    var okCategory = !activeCategory || card.getAttribute('data-category') === activeCategory;
                    card.classList.toggle('is-hidden', !(okQuery && okYear && okType && okCategory));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', apply);
            }
            if (typeFilter) {
                typeFilter.addEventListener('change', apply);
            }
            if (clear) {
                clear.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (yearFilter) {
                        yearFilter.value = '';
                    }
                    if (typeFilter) {
                        typeFilter.value = '';
                    }
                    activeCategory = '';
                    qsa('[data-category-filter]', root).forEach(function (item) {
                        item.classList.toggle('is-active', (item.getAttribute('data-category-filter') || '') === '');
                    });
                    apply();
                });
            }
            apply();
        });
    }

    function setupPlayers() {
        qsa('[data-player]').forEach(function (player) {
            var video = qs('video', player);
            var trigger = qs('[data-play-trigger]', player);
            var source = player.getAttribute('data-src');
            var hls = null;

            if (!video || !trigger || !source) {
                return;
            }

            function load() {
                player.classList.add('is-playing');
                if (window.Hls && window.Hls.isSupported()) {
                    if (!hls) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    }
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                    video.load();
                }
            }

            trigger.addEventListener('click', load);
            video.addEventListener('click', function () {
                if (!video.src) {
                    load();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupMissingImages();
        setupLocalFilters();
        setupPlayers();
    });
})();
