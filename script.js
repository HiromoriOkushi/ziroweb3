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

    const imageHero = document.getElementById('image-hero');
    const handleHeroFade = (scrollValue) => {
        if (!imageHero) return;
        const fadeOutDistance = window.innerHeight * 0.6;
        if (scrollValue < fadeOutDistance) {
            const opacity = 1 - (scrollValue / fadeOutDistance);
            imageHero.style.opacity = Math.max(0, opacity).toFixed(2);
            imageHero.style.pointerEvents = 'auto';
        } else {
            imageHero.style.opacity = '0';
            imageHero.style.pointerEvents = 'none';
        }
    };
    
    // --- NEW UNIFIED NAVBAR LOGIC ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.navbar-link');
    const navLamp = document.getElementById('navbar-lamp');

    // Step 1: Create a single, ordered array of all sections.
    const allSections = [
        document.getElementById('image-hero'),
        document.getElementById('hero'),
        document.getElementById('problem'),
        document.getElementById('why'),
        document.getElementById('what'),
        document.getElementById('how'),
        document.getElementById('use-cases'),
        document.getElementById('tech'),
        document.getElementById('roadmap'),
        document.getElementById('join')
    ].filter(Boolean); // Filter out any nulls if an ID doesn't exist

    const updateLampPosition = (activeLink) => {
        if (!activeLink || !navLamp) return;
        const navRect = navLamp.parentElement.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const offsetX = linkRect.left - navRect.left;
        navLamp.style.width = `${linkRect.width}px`;
        navLamp.style.transform = `translateX(${offsetX}px)`;
    };

    // Step 2: Create a single function to manage the navbar's entire state.
    const updateNavbarState = () => {
        const triggerPoint = window.innerHeight * 0.3; // Highlight triggers 30% from the top
        let latestActiveIndex = -1; // -1 means no section is active yet

        // Find the index of the current section
        allSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            // If the section's top has passed the trigger point, it's a candidate
            if (rect.top <= triggerPoint) {
                latestActiveIndex = index;
            }
        });

        // Step 3: Apply the master rules based on the active index
        // The first two sections (index 0 and 1) are the hero sections
        if (latestActiveIndex < 2) {
            // RULE 1: We are in a hero section. Suppress the navbar.
            navbar.classList.add('nav-suppressed');
            // Ensure no links are marked as active
            navLinks.forEach(link => link.classList.remove('active'));
        } else {
            // RULE 2: We are in a content section. Activate the navbar.
            navbar.classList.remove('nav-suppressed');
            const activeSection = allSections[latestActiveIndex];
            if (!activeSection) return;

            // Highlight the correct link
            navLinks.forEach(link => {
                const targetId = link.getAttribute('href').substring(1);
                const isActive = targetId === activeSection.id;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    updateLampPosition(link);
                }
            });
        }
    };

    // --- SIMPLIFIED SCROLL HANDLER ---
    const handleScroll = (scrollValue) => {
        if (sparkleContainer) sparkleContainer.style.maskPosition = `0px ${scrollValue * 0.3}px`;
        handleHeroFade(scrollValue);
        updateNavbarState(); // Call our single, unified function
    };

    if (lenis) {
        lenis.on('scroll', (e) => handleScroll(e.scroll));
    } else {
        window.addEventListener('scroll', () => handleScroll(window.scrollY));
    }
    
    // Initial call on page load to set the correct starting state.
    handleScroll(window.scrollY);

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (lenis) lenis.scrollTo(targetId, { offset: -10 * 16 });
        });
    });

    document.querySelector('.navbar-cta-button').addEventListener('click', (e) => {
        e.preventDefault();
        if (lenis) lenis.scrollTo("#join");
    });
    
    setTimeout(() => {
        const activeLink = document.querySelector('.navbar-link.active');
        if (activeLink) {
            updateLampPosition(activeLink);
        }
    }, 200);
    // --- END OF NAVBAR LOGIC ---

    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
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