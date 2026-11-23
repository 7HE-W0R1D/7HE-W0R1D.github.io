// Calm ambient background: soft mint blobs that drift slowly (CSS) and
// lean gently toward the mouse, plus a faint light that trails the cursor.
// Purely decorative: aria-hidden, no pointer events, and it does nothing
// extra when the visitor asks for reduced motion.
(function () {
    var layer = document.createElement('div');
    layer.className = 'ambient';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
        '<span class="blob blob-a"></span>' +
        '<span class="blob blob-b"></span>' +
        '<span class="blob blob-c"></span>' +
        '<span class="cursor-glow"></span>';
    document.body.prepend(layer);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (reduce.matches || !finePointer.matches) return;

    var glow = layer.querySelector('.cursor-glow');
    // target = where the mouse is; current = eased position we draw
    var tx = 0.5, ty = 0.35, cx = tx, cy = ty;
    var running = false;

    function frame() {
        // Slow easing keeps it calm: ~6% of the remaining distance per frame
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        var w = window.innerWidth, h = window.innerHeight;
        // Blobs read -1..1 offsets; each blob scales them by its own depth
        layer.style.setProperty('--mx', (cx - 0.5) * 2);
        layer.style.setProperty('--my', (cy - 0.5) * 2);
        glow.style.translate = (cx * w) + 'px ' + (cy * h) + 'px';

        if (Math.abs(tx - cx) > 0.0005 || Math.abs(ty - cy) > 0.0005) {
            requestAnimationFrame(frame);
        } else {
            running = false; // settle, stop burning frames
        }
    }

    window.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        tx = e.clientX / window.innerWidth;
        ty = e.clientY / window.innerHeight;
        layer.classList.add('is-tracking');
        if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });

    // Mouse leaves the window: fade the light out
    document.documentElement.addEventListener('mouseleave', function () {
        layer.classList.remove('is-tracking');
    });
})();
