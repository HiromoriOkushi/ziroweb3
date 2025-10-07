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

    const header = document.getElementById('header');
    const sparkleContainer = document.getElementById('sparkle-effect-container');

    // Performance-Optimized Glow Logic
    if (sparkleContainer) {
        const GLOW_POOL_SIZE = 10;
        const triggerGlow = (glowElement) => {
            const size = Math.random() * 300 + 250;
            const duration = Math.random() * 10 ;
            glowElement.style.width = `${size}px`;
            glowElement.style.height = `${size}px`;
            glowElement.style.top = `${Math.random() * 100}%`;
            glowElement.style.left = `${Math.random() * 100}%`;
            glowElement.style.animationDuration = `${duration}s`;
            glowElement.style.animationName = 'none';
            requestAnimationFrame(() => {
                glowElement.style.animationName = 'longTwinkle';
            });
        };
        for (let i = 0; i < GLOW_POOL_SIZE; i++) {
            const glow = document.createElement('div');
            glow.className = 'glow-spot';
            sparkleContainer.appendChild(glow);
            glow.addEventListener('animationend', () => {
                setTimeout(() => triggerGlow(glow), Math.random() * 3000);
            });
            setTimeout(() => triggerGlow(glow), Math.random() * 10000);
        }
    }
    
    // Mouse-Following Glow Logic
    if (sparkleContainer) {
        const mouseGlow = document.createElement('div');
        mouseGlow.className = 'mouse-glow';
        sparkleContainer.appendChild(mouseGlow);

        let isMouseGlowActive = false;

        window.addEventListener('mousemove', (e) => {
            if (!isMouseGlowActive) {
                mouseGlow.style.opacity = '1';
                isMouseGlowActive = true;
            }
            const x = e.clientX - 150;
            const y = e.clientY - 150;
            mouseGlow.style.transform = `translate(${x}px, ${y}px)`;
        });

        document.body.addEventListener('mouseleave', () => {
            mouseGlow.style.opacity = '0';
            isMouseGlowActive = false;
        });
    }

    const lenis = initScrollStack({
        itemDistance: 45,
        itemScale: 0.03,
        itemStackDistance: 30,
        stackPosition: '30%',
        scaleEndPosition: '20%',
        baseScale: 0.75,
        rotationAmount: 0,
        blurAmount: 0.5,
        onStackComplete: () => { console.log('Stack animation completed!'); }
    });

    if (lenis) {
        lenis.on('scroll', (e) => {
            if (e.scroll > 50) { header.classList.add('scrolled'); } 
            else { header.classList.remove('scrolled'); }

            if (sparkleContainer) {
                const yOffset = e.scroll * 0.3;
                const newPosition = `0px ${yOffset}px`;
                sparkleContainer.style.maskPosition = newPosition;
                sparkleContainer.style.webkitMaskPosition = newPosition;
            }
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (lenis && targetId) { lenis.scrollTo(targetId); } 
            else if (targetId) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) { targetElement.scrollIntoView({ behavior: 'smooth' }); }
            }
        });
    });

    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email-input');
            const messageEl = document.getElementById('form-message');
            const email = emailInput.value;
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (email && emailRegex.test(email)) {
                messageEl.textContent = 'Thank you! You have been added to the waitlist.';
                messageEl.className = 'text-green-400 mt-4 h-6';
                emailInput.value = '';
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
            animate(
                element,
                { opacity: 1, y: 0 },
                { duration: 0.7, delay: 0.1, ease: [0.25, 1, 0.5, 1] }
            );
        }, { amount: 0.2, once: true });
    });
});