// Scroll reveal. Content stays visible if this script never runs.
(function () {
    var SELECTOR = '.reveal, .project-card, .making-card, .decision, .stat, ' +
        '.reflection-grid > div, .case-figure, .figure-row figure, .full-width-image';

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var els = document.querySelectorAll(SELECTOR);
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            // Reveal on entry, and anything already scrolled past (e.g. after a #hash jump)
            if (e.isIntersecting || e.boundingClientRect.top < 0) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) {
        // Skip hiding anything already on screen at load so nothing flashes
        if (el.getBoundingClientRect().top < vh) return;
        el.classList.add('will-reveal');
        io.observe(el);
    });
})();
