(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var backTop = document.querySelector('.back-top');
    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('show', window.scrollY > 520);
        });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    var activeSlide = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5600);
    }

    selectAll('.filter-bar').forEach(function (bar) {
        var buttons = selectAll('.filter-btn', bar);
        var cards = selectAll('.movie-card');
        var empty = document.querySelector('.empty-state');
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                var shown = 0;
                cards.forEach(function (card) {
                    var text = card.getAttribute('data-filter-text') || '';
                    var visible = value === 'all' || text.indexOf(value) !== -1;
                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.style.display = shown ? 'none' : 'block';
                }
            });
        });
    });

    var searchForms = selectAll('.search-form');
    var movies = window.SITE_MOVIES || [];
    searchForms.forEach(function (form) {
        var input = form.querySelector('.site-search-input');
        var panel = form.querySelector('.search-panel');
        if (!input || !panel) {
            return;
        }
        function render(query) {
            var q = query.trim().toLowerCase();
            if (!q) {
                panel.classList.remove('open');
                panel.innerHTML = '';
                return;
            }
            var result = movies.filter(function (movie) {
                return movie.text.toLowerCase().indexOf(q) !== -1;
            }).slice(0, 10);
            if (!result.length) {
                panel.innerHTML = '<div class="search-result"><div></div><div><strong>没有找到相关影片</strong><small>换个关键词试试</small></div></div>';
                panel.classList.add('open');
                return;
            }
            panel.innerHTML = result.map(function (movie) {
                return '<a class="search-result" href="' + movie.url + '"><img src="' + movie.image + '" alt="' + movie.title + '"><div><strong>' + movie.title + '</strong><small>' + movie.year + ' · ' + movie.type + ' · ' + movie.genre + '</small></div></a>';
            }).join('');
            panel.classList.add('open');
        }
        input.addEventListener('input', function () {
            render(input.value);
        });
        input.addEventListener('focus', function () {
            render(input.value);
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var q = input.value.trim().toLowerCase();
            if (!q) {
                return;
            }
            var first = movies.find(function (movie) {
                return movie.text.toLowerCase().indexOf(q) !== -1;
            });
            if (first) {
                window.location.href = first.url;
            }
        });
        document.addEventListener('click', function (event) {
            if (!form.contains(event.target)) {
                panel.classList.remove('open');
            }
        });
    });

    window.MoviePlayer = {
        init: function (videoId, buttonId, streamUrl) {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            if (!video || !button || !streamUrl) {
                return;
            }
            var ready = false;
            var hls = null;
            function prepare() {
                if (ready) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    });
                } else {
                    video.src = streamUrl;
                }
            }
            function start() {
                prepare();
                button.classList.add('is-hidden');
                var playTask = video.play();
                if (playTask && playTask.catch) {
                    playTask.catch(function () {});
                }
            }
            button.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
            });
        }
    };
})();
