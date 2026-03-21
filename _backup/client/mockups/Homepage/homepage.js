function clampIndex(index, length) {
    if (length <= 0) return 0;
    return ((index % length) + length) % length;
}

function initHeroSlider() {
    const slider = document.querySelector('.banner-slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.banner-slide'));
    if (!slides.length) return;

    const prevBtn = slider.querySelector('.slick-prev');
    const nextBtn = slider.querySelector('.slick-next');

    let activeIndex = 0;
    let autoTimer = null;

    const setActive = (nextIndex) => {
        activeIndex = clampIndex(nextIndex, slides.length);
        slides.forEach((slide, idx) => {
            if (idx === activeIndex) slide.classList.add('is-active');
            else slide.classList.remove('is-active');
        });
    };

    const startAuto = () => {
        stopAuto();
        autoTimer = window.setInterval(() => setActive(activeIndex + 1), 6500);
    };

    const stopAuto = () => {
        if (autoTimer) window.clearInterval(autoTimer);
        autoTimer = null;
    };

    setActive(0);
    startAuto();

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAuto();
            setActive(activeIndex - 1);
            startAuto();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAuto();
            setActive(activeIndex + 1);
            startAuto();
        });
    }

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopAuto();
            setActive(activeIndex - 1);
            startAuto();
        }
        if (e.key === 'ArrowRight') {
            stopAuto();
            setActive(activeIndex + 1);
            startAuto();
        }
    });
}



function initMoveTop() {
    const btn = document.getElementById('movetop');
    if (!btn) return;

    const sync = () => {
        btn.style.display = (document.documentElement.scrollTop > 20 || document.body.scrollTop > 20) ? 'block' : 'none';
    };

    sync();
    window.addEventListener('scroll', sync);

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initCounters() {
    const section = document.querySelector('.homeblock-stats');
    if (!section) return;

    const counters = Array.from(section.querySelectorAll('.timer.count-number[data-to]'));
    if (!counters.length) return;

    const animate = (el) => {
        const to = Number(el.getAttribute('data-to'));
        const speed = Number(el.getAttribute('data-speed')) || 1500;
        if (!Number.isFinite(to) || to <= 0) return;

        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / speed, 1);
            const value = Math.floor(to * progress);
            el.textContent = value.toLocaleString('vi-VN');
            if (progress < 1) window.requestAnimationFrame(step);
        };

        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            counters.forEach(animate);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.35 });

    observer.observe(section);
}

function initFaqAccordion() {
    const accordion = document.getElementById('accordionExample');
    if (!accordion) return;

    const getTransitionMs = (el) => {
        const style = window.getComputedStyle(el);
        const duration = style.transitionDuration.split(',')[0]?.trim() || '0s';
        const delay = style.transitionDelay.split(',')[0]?.trim() || '0s';
        const toMs = (value) => (value.endsWith('ms') ? Number(value.replace('ms', '')) : Number(value.replace('s', '')) * 1000);
        return toMs(duration) + toMs(delay);
    };

    const setButtonState = (button, isOpen) => {
        button.classList.toggle('collapsed', !isOpen);
        button.setAttribute('aria-expanded', String(isOpen));
    };

    const show = (collapseEl, button) => {
        const others = accordion.querySelectorAll('.accordion-collapse.show');
        others.forEach((el) => {
            if (el === collapseEl) return;
            const selector = `button.accordion-button[data-bs-target="#${el.id}"]`;
            const btn = accordion.querySelector(selector);
            hide(el, btn);
        });

        collapseEl.classList.remove('collapse');
        collapseEl.classList.remove('show');
        collapseEl.classList.add('collapsing');
        collapseEl.style.height = '0px';

        setButtonState(button, true);

        const targetHeight = collapseEl.scrollHeight;
        window.requestAnimationFrame(() => {
            collapseEl.style.height = `${targetHeight}px`;
        });

        const done = () => {
            collapseEl.classList.remove('collapsing');
            collapseEl.classList.add('collapse');
            collapseEl.classList.add('show');
            collapseEl.style.height = '';
        };

        const ms = getTransitionMs(collapseEl);
        if (ms <= 0) done();
        else collapseEl.addEventListener('transitionend', done, { once: true });
    };

    const hide = (collapseEl, button) => {
        if (!collapseEl.classList.contains('show') && !collapseEl.classList.contains('collapsing')) {
            if (button) setButtonState(button, false);
            return;
        }

        collapseEl.style.height = `${collapseEl.getBoundingClientRect().height}px`;
        collapseEl.classList.remove('collapse');
        collapseEl.classList.remove('show');
        collapseEl.classList.add('collapsing');

        if (button) setButtonState(button, false);

        collapseEl.getBoundingClientRect();
        window.requestAnimationFrame(() => {
            collapseEl.style.height = '0px';
        });

        const done = () => {
            collapseEl.classList.remove('collapsing');
            collapseEl.classList.add('collapse');
            collapseEl.style.height = '';
        };

        const ms = getTransitionMs(collapseEl);
        if (ms <= 0) done();
        else collapseEl.addEventListener('transitionend', done, { once: true });
    };

    const buttons = Array.from(accordion.querySelectorAll('button.accordion-button[data-bs-target]'));
    buttons.forEach((button) => {
        const target = button.getAttribute('data-bs-target');
        if (!target || !target.startsWith('#')) return;
        const collapseEl = accordion.querySelector(target);
        if (!collapseEl) return;

        const isOpen = collapseEl.classList.contains('show');
        setButtonState(button, isOpen);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            const openNow = collapseEl.classList.contains('show') || collapseEl.classList.contains('collapsing');
            if (openNow) hide(collapseEl, button);
            else show(collapseEl, button);
        });
    });
}

function initLatestBlogPosts() {
    const cards = Array.from(document.querySelectorAll('[data-blog-card]'));
    if (!cards.length) return;

    const fallbackImages = [
        '../images/download-1.jpg',
        '../images/download-2.jpg',
        '../images/download-3.jpg'
    ];

    const formatDate = (iso) => {
        try {
            return new Date(iso).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    const toBlogLink = (articleUrl) => {
        if (!articleUrl) return '../Blog/blog.html';
        return `../Blog/blog.html?open=${encodeURIComponent(articleUrl)}`;
    };

    fetch('https://dev.to/api/articles?tag=pets&per_page=3&page=1')
        .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to load')))
        .then((articles) => {
            if (!Array.isArray(articles) || !articles.length) return;
            cards.forEach((card, idx) => {
                const article = articles[idx];
                if (!article) return;

                const link = toBlogLink(article.url);

                const img = card.querySelector('[data-blog-image]');
                if (img) {
                    img.src = article.cover_image || article.social_image || fallbackImages[idx] || fallbackImages[0];
                    img.alt = article.title || 'Bài viết';
                }

                const dateEl = card.querySelector('[data-blog-date]');
                if (dateEl) dateEl.textContent = formatDate(article.published_at);

                const titleEl = card.querySelector('[data-blog-title]');
                if (titleEl) titleEl.textContent = article.title || '';

                const links = Array.from(card.querySelectorAll('[data-blog-link]'));
                links.forEach((a) => {
                    a.setAttribute('href', link);
                });
            });
        })
        .catch(() => {
        });
}

function initTestimonialsDots() {
    const carousel = document.getElementById('owl-demo1');
    if (!carousel) return;

    const wantedNames = new Set(['John wilson', 'Julia sakura', 'Roy Mmdson', 'Mike Thyson']);

    const items = Array.from(carousel.querySelectorAll('.item')).filter((item) => {
        const nameEl = item.querySelector('.peopl h3');
        const name = nameEl ? nameEl.textContent.trim() : '';
        return wantedNames.has(name);
    });
    if (!items.length) return;

    const parent = carousel.parentElement;
    if (!parent) return;

    const existingDots = parent.querySelector('.owl-dots');
    if (existingDots) existingDots.remove();

    const existingNav = parent.querySelector('.testimonials-nav');
    if (existingNav) existingNav.remove();

    let activeIndex = 0;
    let timer = null;

    const nav = document.createElement('div');
    nav.className = 'testimonials-nav';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'testi-arrow testi-prev';
    prevBtn.setAttribute('aria-label', 'Previous testimonial');

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'testi-arrow testi-next';
    nextBtn.setAttribute('aria-label', 'Next testimonial');

    const dots = document.createElement('div');
    dots.className = 'owl-dots';

    const dotButtons = items.map((_, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'owl-dot';
        btn.setAttribute('aria-label', `Slide ${idx + 1}`);
        const span = document.createElement('span');
        btn.appendChild(span);
        btn.addEventListener('click', () => {
            stop();
            setActive(idx);
            start();
        });
        dots.appendChild(btn);
        return btn;
    });

    const setActive = (idx) => {
        activeIndex = clampIndex(idx, items.length);
        items.forEach((item, i) => {
            if (i === activeIndex) item.classList.add('is-active');
            else item.classList.remove('is-active');
        });
        dotButtons.forEach((btn, i) => {
            if (i === activeIndex) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => setActive(activeIndex + 1), 7000);
    };

    const stop = () => {
        if (timer) window.clearInterval(timer);
        timer = null;
    };

    prevBtn.addEventListener('click', () => {
        stop();
        setActive(activeIndex - 1);
        start();
    });

    nextBtn.addEventListener('click', () => {
        stop();
        setActive(activeIndex + 1);
        start();
    });

    nav.appendChild(prevBtn);
    nav.appendChild(dots);
    nav.appendChild(nextBtn);

    carousel.after(nav);
    setActive(0);
    start();

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
}

document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    initMoveTop();
    initCounters();
    initFaqAccordion();
    initLatestBlogPosts();
    initTestimonialsDots();
});
