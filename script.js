/* ========================================
   TECHISTA — Landing Page Scripts
   Clean & Functional Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ── PERSONALIZATION ENGINE ──────── */
    const Personalization = {
        // params: new URLSearchParams(window.__DEMO_PARAMS__ ?? window.location.search),

        params: (() => {

            // First try current page URL
            const local = new URLSearchParams(window.__DEMO_PARAMS__ ?? window.location.search);
            if (local.toString()) return local;

            // Fallback: check parent window (iframe scenario)
            try {
                if (window.parent && window.parent !== window) {
                    return new URLSearchParams(window.parent.location.search);
                }
            } catch (e) { /* cross-origin, ignore */ }

            return local;
        })(),

        init() {
            const rawName = this.params.get('n')?.trim().slice(0, 80);
            const rawCompany = this.params.get('e')?.trim().slice(0, 80);
            const phone = this.params.get('t');

            const company = rawCompany ? `${rawCompany} | Techos` : null;
            const name = rawName ? `${rawName} | Techista` : null;

            if (company) {
                this.apply({ type: 'company', value: company });
            } else if (name) {
                this.apply({ type: 'name', value: name });
            }

            if (phone) {
                this.applyPhone(phone);
            }
        },

        apply({ type, value }) {
            // Update page title
            document.title = `${value} | Servicio de Techos`;

            // Update all elements with data-dynamic attribute
            document.querySelectorAll('[data-dynamic]').forEach(el => {
                const key = el.dataset.dynamic;

                switch (key) {
                    case 'name':
                    case 'logo':
                    case 'footer-name':
                        // el.textContent = value;
                        el.textContent = `${value}`;
                        break;
                    case 'title':
                        el.textContent = `${value} | Servicio de Techos`;
                        break;
                }
            });

            // Update WhatsApp links with the name
            this.updateWhatsApp(value);

        },

        applyPhone(phone) {
            // Clean phone: remove spaces, dashes, parentheses
            const normalized = window.SiteSecurity.normalizePhone(phone);
            if (!normalized) return;
            const cleanPhone = normalized.national;

            // tel: links → use raw phone (ej: tel:1155551234)
            document.querySelectorAll('a[href^="tel:"]').forEach(el => {
                el.href = `tel:${cleanPhone}`;
            });

            // wa.me links → prepend 549 (ej: wa.me/5491155551234)
            const whatsappPhone = `549${cleanPhone}`;
            document.querySelectorAll('[data-whatsapp]').forEach(el => {
                const url = new URL(el.href);
                url.hostname = 'wa.me';
                url.pathname = `/${whatsappPhone}`;
                el.href = url.toString();
            });

            // Update displayed phone numbers (text content)
            const displayPhone = cleanPhone.replace(/(\d{4})(\d{4})/, '$1-$2');
            document.querySelectorAll('.contact__detail a[href^="tel:"], .footer__col a[href^="tel:"]').forEach(el => {
                el.textContent = displayPhone;
            });

            // Update the contact form WhatsApp number
            this._whatsappNumber = whatsappPhone;
        },

        updateWhatsApp(name) {
            const phone = this.params.get('t');
            const normalized = window.SiteSecurity.normalizePhone(phone ?? '1167967633');
            const phoneClean = normalized?.national || '';
            const whatsappPhone = `549${phoneClean}`;

            const message = encodeURIComponent(
                `Hola! Me comunico desde la página de ${name}. Quisiera hacer una consulta.`
            );

            document.querySelectorAll('[data-whatsapp]').forEach(el => {
                const baseUrl = `https://wa.me/${whatsappPhone}`;
                el.href = `${baseUrl}?text=${message}`;
            });
        },

    };

    Personalization.init();


    /* ── HEADER SCROLL EFFECT ─────────── */
    const header = document.getElementById('header');
    const mobileMenu = document.getElementById('mobileMenu');

    const handleHeaderScroll = () => {
        if (window.scrollY > 60) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();


    /* ── MOBILE MENU ──────────────────── */
    const burger = document.getElementById('burgerBtn');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

    const setMenuOpen = (open) => {
        burger.classList.toggle('active', open);
        mobileMenu.classList.toggle('active', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        mobileMenu.toggleAttribute('inert', !open);
        document.body.style.overflow = open ? 'hidden' : '';
    };

    const toggleMenu = () => setMenuOpen(burger.getAttribute('aria-expanded') !== 'true');
    const closeMenu = () => setMenuOpen(false);

    burger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
            closeMenu();
            burger.focus();
        }
    });


    /* ── SMOOTH SCROLL ─────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

            window.scrollTo({
                top: targetPosition,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        });
    });


    /* ── ANIMATED COUNTERS ────────────── */
    const counters = document.querySelectorAll('.counter__number');
    let countersAnimated = false;

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const suffix = counter.dataset.suffix || '';
            const duration = 2000;
            const isDecimal = target % 1 !== 0;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;

                if (isDecimal) {
                    counter.textContent = current.toFixed(1) + suffix;
                } else {
                    counter.textContent = Math.floor(current) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    const countersSection = document.querySelector('.counters');
    if (countersSection && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const countersObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    animateCounters();
                    countersObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        countersObserver.observe(countersSection);
    }


    /* ── CONTACT FORM → WHATSAPP ──────── */
    const contactForm = document.getElementById('contactForm');
    const defaultWhatsappNumber = '5491167967633';

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            // Use personalized phone if set via ?t= param
            const whatsappNumber = Personalization._whatsappNumber || defaultWhatsappNumber;

            // Build message
            let whatsappMessage = `Hola! Me comunico desde la página web.\n\n`;
            whatsappMessage += `👤 *Nombre:* ${name}\n`;
            whatsappMessage += `📞 *Teléfono:* ${phone}\n`;

            if (message) {
                whatsappMessage += `💬 *Mensaje:* ${message}\n`;
            }

            whatsappMessage += `\n¡Gracias!`;

            // Encode and open WhatsApp
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

            // Show feedback
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '¡Enviado! ✓';
            submitBtn.style.backgroundColor = '#25D366';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
                contactForm.reset();
            }, 2000);
        });
    }


    /* ── WHATSAPP FLOAT VISIBILITY ─────── */
    const whatsappFloat = document.getElementById('whatsappFloat');

    if (whatsappFloat) {
        const handleWhatsappVisibility = () => {
            if (window.scrollY > 300) {
                whatsappFloat.classList.add('visible');
            } else {
                whatsappFloat.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', handleWhatsappVisibility, { passive: true });
    }


    /* ── MOBILE STICKY CTA ────────────── */
    const mobileCta = document.getElementById('mobileCta');

    if (mobileCta) {
        const handleMobileCta = () => {
            if (window.scrollY > 400) {
                mobileCta.classList.add('visible');
            } else {
                mobileCta.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', handleMobileCta, { passive: true });
    }


    /* ── ACTIVE NAV HIGHLIGHT ──────────── */
    const sections = document.querySelectorAll('section[id]');

    const highlightNav = () => {
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.header__nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();


    /* ── CURRENT YEAR ──────────────────── */
    const yearElements = document.querySelectorAll('#currentYear');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(el => {
        el.textContent = currentYear;
    });

});

/* Scroll linked atmosphere: reading progress, parallax artwork and subtle reveals. */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const progress = document.getElementById('scrollProgress');
  const art = document.querySelector('.hero-art');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.section-header,.services__category,.counter,.differential,.gallery__item,.coverage__card,.testimonial,.contact__info,.contact__form-wrap');
  if ('IntersectionObserver' in window && !reduce) {
    root.classList.add('js-motion');
    revealTargets.forEach(node => node.classList.add('reveal'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(node => observer.observe(node));
  }
  let ticking = false;
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    if (art && !reduce && window.innerWidth > 700) {
      const travel = Math.min(window.scrollY, window.innerHeight * 1.15);
      art.style.setProperty('--scroll-y', `${travel * .12}px`);
      art.style.translate = `0 calc(-45% + ${travel * .12}px)`;
      art.style.opacity = String(Math.max(.12, 1 - travel / (window.innerHeight * 1.4)));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
  updateScroll();
});

/* Scroll the roof cutaway through inspection, repair, and protection. */
document.addEventListener('DOMContentLoaded', () => {
  const story = document.querySelector('[data-roof-story]');
  if (!story) return;
  const scene = story.querySelector('.roof-story__visual');
  const chapters = [...story.querySelectorAll('.roof-chapter')];
  const counter = document.getElementById('roofStoryCounter');
  const photo = story.querySelector('.roof-scene__gif');
  const status = document.getElementById('roofSceneStatus');
  const sceneCount = document.getElementById('roofSceneCount');
  const statuses = ['DIAGNÓSTICO EN CURSO', 'REPARACIÓN EN CURSO', 'PROTECCIÓN APLICADA'];
  let active = -1;
  const clamp = value => Math.max(0, Math.min(1, value));
  const update = () => {
    const rect = story.getBoundingClientRect();
    const range = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / range);
    const chapterIndex = Math.min(2, Math.floor(progress * 3));
    const chapterProgress = progress >= 1 ? 1 : progress * 3 - chapterIndex;
    story.style.setProperty('--story-progress', progress.toFixed(4));
    story.style.setProperty('--story-local', chapterProgress.toFixed(4));
    story.style.setProperty('--story-scale', String(.86 + chapterProgress * .22));
    story.style.setProperty('--story-shimmer', `${(progress * 100).toFixed(1)}%`);
    story.style.setProperty('--scan-position', `${16 + chapterProgress * 67}%`);
    scene.dataset.scene = String(chapterIndex);
    if (photo) photo.style.transform = `scale(${1.02 + progress * .065}) translate3d(${(progress - .5) * -18}px, ${(progress - .5) * -8}px, 0)`;
    if (active !== chapterIndex) {
      chapters.forEach((chapter, index) => {
        chapter.classList.toggle('is-active', index === chapterIndex);
        if (index === chapterIndex) chapter.setAttribute('aria-current', 'step');
        else chapter.removeAttribute('aria-current');
      });
      if (counter) counter.textContent = String(chapterIndex + 1);
      if (status) status.textContent = statuses[chapterIndex];
      if (sceneCount) sceneCount.textContent = `0${chapterIndex + 1} — 03`;
      active = chapterIndex;
    }
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
});
