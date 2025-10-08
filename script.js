import { animate, inView } from 'https://esm.run/framer-motion';
import { initScrollStack } from './scroll_stack.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    if (document.getElementById('particles-bg')) {
        particlesJS('particles-bg', {
            "particles": { "number": { "value": 160, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#ffffff" }, "shape": { "type": "circle" }, "opacity": { "value": 0.8, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } }, "size": { "value": 3.5, "random": true, "anim": { "enable": false } }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 0.4, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false } },
            "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": false }, "resize": true }, "modes": { "repulse": { "distance": 80, "duration": 0.4 } } },
            "retina_detect": true
        });
    }

    const sparkleContainer = document.getElementById('sparkle-effect-container');

    // SINE-WAVE DRIVEN ANIMATION LOGIC
    if (sparkleContainer) {
        const GRID_COLUMNS = 4, GRID_ROWS = 3, TOTAL_ZONES = GRID_COLUMNS * GRID_ROWS, ANIMATION_DURATION = 3500;
        const glowSpots = [], zoneIndexes = Array.from({ length: TOTAL_ZONES }, (_, i) => i), activeGlows = [];
        for (let i = 0; i < TOTAL_ZONES; i++) { const glow = document.createElement('div'); glow.className = 'glow-spot'; sparkleContainer.appendChild(glow); glowSpots.push(glow); }
        const animateGlows = (t) => {
            for (let i = activeGlows.length - 1; i >= 0; i--) {
                const g = activeGlows[i], e = t - g.startTime;
                if (e >= ANIMATION_DURATION) { g.element.style.opacity = 0; activeGlows.splice(i, 1); continue; }
                const p = e / ANIMATION_DURATION, s = Math.sin(p * Math.PI);
                g.element.style.opacity = s * 0.9; g.element.style.transform = `scale(${1 + s * 0.15})`;
            }
            requestAnimationFrame(animateGlows);
        };
        const triggerWave = () => {
            let a = [...zoneIndexes];
            for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
            const n = Math.floor(Math.random() * 3) + 3, z = a.slice(0, n);
            z.forEach(i => {
                const g = glowSpots[i], w = 100 / GRID_COLUMNS, h = 100 / GRID_ROWS, c = i % GRID_COLUMNS, r = Math.floor(i / GRID_COLUMNS);
                const jX = (Math.random() - 0.5) * w * 0.5, jY = (Math.random() - 0.5) * h * 0.5;
                const pX = c * w + w / 2 + jX, pY = r * h + h / 2 + jY, s = Math.random() * 350 + 300;
                g.style.width = `${s}px`; g.style.height = `${s}px`; g.style.left = `${pX}%`; g.style.top = `${pY}%`;
                activeGlows.push({ element: g, startTime: performance.now() });
            });
            setTimeout(triggerWave, ANIMATION_DURATION);
        };
        requestAnimationFrame(animateGlows);
        triggerWave();
    }
    
    // Mouse-Following Glow Logic
    if (sparkleContainer) {
        const mouseGlow = document.createElement('div'); mouseGlow.className = 'mouse-glow'; sparkleContainer.appendChild(mouseGlow);
        let isActive = false;
        window.addEventListener('mousemove', (e) => {
            if (!isActive) { mouseGlow.style.opacity = '1'; isActive = true; }
            mouseGlow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
        });
        document.body.addEventListener('mouseleave', () => { mouseGlow.style.opacity = '0'; isActive = false; });
    }

    const lenis = initScrollStack({
        itemDistance: 45, itemScale: 0.03, itemStackDistance: 30, stackPosition: '30%',
        scaleEndPosition: '20%', baseScale: 0.75, rotationAmount: 0, blurAmount: 0.5,
        onStackComplete: () => console.log('Stack animation completed!')
    });

    // --- NEW: HERO FADE LOGIC SETUP ---
    const imageHero = document.getElementById('image-hero');
    
    const handleHeroFade = (scrollValue) => {
        if (!imageHero) return;
        const fadeOutDistance = window.innerHeight * 0.6; // Fade out over 60% of the screen height

        if (scrollValue < fadeOutDistance) {
            const opacity = 1 - (scrollValue / fadeOutDistance);
            imageHero.style.opacity = Math.max(0, opacity).toFixed(2);
            imageHero.style.pointerEvents = 'auto'; // Keep it interactive while visible
        } else {
            imageHero.style.opacity = '0';
            imageHero.style.pointerEvents = 'none'; // Disable pointer events when faded out
        }
    };
    
    // --- EDITED: NEW ROBUST NAVBAR LOGIC ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.navbar-link');
    const navLamp = document.getElementById('navbar-lamp');
    const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    // Observer for Hero Section
    const heroSection = document.getElementById('hero');
    const heroObserver = new IntersectionObserver(([entry]) => {
        navbar.classList.toggle('hero-visible', entry.isIntersecting);
    }, { threshold: 0.1 });
    if (heroSection) heroObserver.observe(heroSection);

    // Observer for content sections to determine the most visible
    const visibleSections = new Map();
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
        });
        
        let maxRatio = 0;
        let mostVisibleId = null;

        visibleSections.forEach((ratio, id) => {
            if (ratio > maxRatio) {
                maxRatio = ratio;
                mostVisibleId = id;
            }
        });

        if (mostVisibleId) {
            navLinks.forEach(link => {
                // CORRECTED SYNTAX ERROR HERE
                const isActive = link.getAttribute('href') === `#${mostVisibleId}`;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    updateLampPosition(link);
                }
            });
        }
    }, { threshold: Array.from({ length: 51 }, (_, i) => i / 50) }); // Use 50 steps for good precision without being excessive

    sections.forEach(section => {
        if (section) sectionObserver.observe(section);
    });

    const updateLampPosition = (activeLink) => {
        if (!activeLink || !navLamp) return;
        const navRect = navLamp.parentElement.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const offsetX = linkRect.left - navRect.left;
        navLamp.style.width = `${linkRect.width}px`;
        navLamp.style.transform = `translateX(${offsetX}px)`;
    };

    // Main scroll handler
    if (lenis) {
        lenis.on('scroll', (e) => {
            if (sparkleContainer) sparkleContainer.style.maskPosition = `0px ${e.scroll * 0.3}px`;
            // NEW: Call the hero fade handler on scroll
            handleHeroFade(e.scroll);
        });
    } else {
        // Fallback for hero fade if Lenis isn't initialized
        window.addEventListener('scroll', () => handleHeroFade(window.scrollY));
    }
    
    // NEW: Initial check on load for hero fade
    handleHeroFade(window.scrollY);

    // Handle clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            updateLampPosition(this); 
            const targetId = this.getAttribute('href');
            if (lenis) lenis.scrollTo(targetId, { offset: -10 * 16 }); // 10rem offset
        });
    });

    document.querySelector('.navbar-cta-button').addEventListener('click', (e) => {
        e.preventDefault();
        if (lenis) lenis.scrollTo("#join");
    });
    
    // Initial state check
    setTimeout(() => {
        const activeLink = document.querySelector('.navbar-link.active');
        if (activeLink) {
            updateLampPosition(activeLink);
        }
    }, 200);
    // --- END OF NAVBAR LOGIC ---

    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
        // ... (This section is unchanged)
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email-input'), messageEl = document.getElementById('form-message'), email = emailInput.value;
            if (email && /^\S+@\S+\.\S+$/.test(email)) {
                messageEl.textContent = 'Thank you! You have been added to the waitlist.';
                messageEl.className = 'text-green-400 mt-4 h-6'; emailInput.value = '';
                setTimeout(() => { messageEl.textContent = ''; }, 5000);
            } else {
                messageEl.textContent = 'Please enter a valid email address.';
                messageEl.className = 'text-red-400 mt-4 h-6';
                setTimeout(() => { messageEl.textContent = ''; }, 3000);
            }
        });
    }

    document.querySelectorAll('.scroll-reveal').forEach(element => {
        inView(element, () => {
            animate(element, { opacity: 1, y: 0 }, { duration: 0.7, delay: 0.1, ease: [0.25, 1, 0.5, 1] });
        }, { amount: 0.2, once: true });
    });
});