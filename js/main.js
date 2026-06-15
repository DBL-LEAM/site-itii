/* =========================================================
   ITII Champagne-Ardenne — Interactions
   ========================================================= */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. Navbar : non fixe, défile avec la page (reste transparente) ---------- */

    /* ---------- 2. Menu mobile (burger) ---------- */
    const burger = document.getElementById('burger');
    const nav = document.getElementById('primary-nav');
    const closeMenu = () => {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
    };
    burger.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });

    /* ---------- 3. Dropdown "Formations" (clic + mobile) ---------- */
    const subToggle = document.querySelector('.navbar__sub-toggle');
    const subItem = document.querySelector('.navbar__has-sub');
    if (subToggle && subItem) {
        subToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const open = subItem.classList.toggle('is-open');
            subToggle.setAttribute('aria-expanded', String(open));
        });
        document.addEventListener('click', (e) => {
            if (!subItem.contains(e.target)) {
                subItem.classList.remove('is-open');
                subToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Fermer le menu mobile sur clic d'un lien (mais pas le toggle du sous-menu)
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    /* ---------- 4. Scroll reveal (IntersectionObserver) ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('is-visible'));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('is-visible'), (i % 4) * 80);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(el => io.observe(el));
    }

    /* ---------- 5. Compteurs animés ---------- */
    const counters = document.querySelectorAll('[data-count]');
    const fmt = n => n.toLocaleString('fr-FR');
    const animateCount = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(Math.floor(eased * target)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = fmt(target) + suffix;
        };
        requestAnimationFrame(tick);
    };
    if (reduceMotion || !('IntersectionObserver' in window)) {
        counters.forEach(el => { el.textContent = fmt(parseInt(el.dataset.count, 10)) + (el.dataset.suffix || ''); });
    } else {
        const countIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { animateCount(entry.target); countIO.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach(el => countIO.observe(el));
    }

    /* ---------- 7. Formulaire de recherche (démo) ---------- */
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(searchForm);
            const selected = [...data.entries()].filter(([, v]) => v.trim() !== '');
            const btn = searchForm.querySelector('.search__submit');
            const original = btn.innerHTML;
            btn.disabled = true;
            btn.textContent = selected.length
                ? `Recherche en cours… (${selected.length} critère${selected.length > 1 ? 's' : ''})`
                : 'Indiquez un mot-clé ou un filtre';
            setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1400);
        });
    }

    /* ---------- 8. Bandeau bleu « Nos diplômes » : s'arrête au milieu des tuiles ---------- */
    const aboutSection = document.querySelector('.about');
    const aboutTiles = document.querySelector('.about__tiles');
    if (aboutSection && aboutTiles) {
        // offsetTop cumulé (insensible aux transforms .reveal)
        const offsetWithin = (el, ancestor) => {
            let y = 0;
            while (el && el !== ancestor) { y += el.offsetTop; el = el.offsetParent; }
            return y;
        };
        const setBandHeight = () => {
            const h = offsetWithin(aboutTiles, aboutSection) + aboutTiles.offsetHeight / 2;
            aboutSection.style.setProperty('--about-band-h', `${Math.round(h)}px`);
        };
        setBandHeight();
        window.addEventListener('resize', setBandHeight);
        window.addEventListener('load', setBandHeight);
    }

    /* ---------- 9. Menus déroulants personnalisés (filtres de recherche) ---------- */
    const drops = document.querySelectorAll('.fdrop');
    if (drops.length) {
        const closeAll = (except) => {
            drops.forEach(d => {
                if (d !== except) {
                    d.classList.remove('is-open');
                    d.querySelector('.fdrop__toggle').setAttribute('aria-expanded', 'false');
                }
            });
        };

        drops.forEach(drop => {
            const toggle = drop.querySelector('.fdrop__toggle');
            const valueEl = drop.querySelector('.fdrop__value');
            const input = drop.querySelector('input[type="hidden"]');
            const options = drop.querySelectorAll('.fdrop__opt');

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const willOpen = !drop.classList.contains('is-open');
                closeAll(drop);
                drop.classList.toggle('is-open', willOpen);
                toggle.setAttribute('aria-expanded', String(willOpen));
            });

            options.forEach(opt => {
                opt.addEventListener('click', () => {
                    options.forEach(o => {
                        o.classList.remove('is-selected');
                        o.setAttribute('aria-selected', 'false');
                    });
                    opt.classList.add('is-selected');
                    opt.setAttribute('aria-selected', 'true');
                    valueEl.textContent = opt.textContent;
                    input.value = opt.dataset.value;
                    drop.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                });
            });
        });

        document.addEventListener('click', () => closeAll(null));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(null); });
    }
})();
