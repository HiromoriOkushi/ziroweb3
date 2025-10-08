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

    // --- START: NEW SINE-WAVE DRIVEN ANIMATION LOGIC ---
    if (sparkleContainer) {
        // --- Configuration ---
        const GRID_COLUMNS = 4;
        const GRID_ROWS = 3;
        const TOTAL_ZONES = GRID_COLUMNS * GRID_ROWS;
        const ANIMATION_DURATION = 3500; // 3.5 seconds in milliseconds

        const glowSpots = [];
        const zoneIndexes = Array.from({ length: TOTAL_ZONES }, (_, i) => i);
        const activeGlows = [];

        // --- Create a pool of 12 glow spot elements ---
        for (let i = 0; i < TOTAL_ZONES; i++) {
            const glow = document.createElement('div');
            glow.className = 'glow-spot';
            sparkleContainer.appendChild(glow);
            glowSpots.push(glow);
        }

        // --- The main animation loop ---
        const animateGlows = (currentTime) => {
            for (let i = activeGlows.length - 1; i >= 0; i--) {
                const glow = activeGlows[i];
                const elapsed = currentTime - glow.startTime;

                if (elapsed >= ANIMATION_DURATION) {
                    // Animation is over, remove it from the active list
                    glow.element.style.opacity = 0;
                    activeGlows.splice(i, 1);
                    continue;
                }

                // Calculate progress as a value from 0 to 1
                const progress = elapsed / ANIMATION_DURATION;
                
                // The core of the effect: Math.sin() from 0 to PI gives a perfect 0 -> 1 -> 0 curve.
                const sineValue = Math.sin(progress * Math.PI);

                // Apply the sine wave to opacity and scale
                const currentOpacity = sineValue * 0.9; // Max opacity of 0.9 for a softer feel
                const currentScale = 1 + sineValue * 0.15; // Pulse from 100% to 115% scale
                
                glow.element.style.opacity = currentOpacity;
                glow.element.style.transform = `scale(${currentScale})`;
            }

            // Keep the loop running
            requestAnimationFrame(animateGlows);
        };

        // --- The function to trigger a new wave of lights ---
        const triggerWave = () => {
            let availableZones = [...zoneIndexes];
            for (let i = availableZones.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableZones[i], availableZones[j]] = [availableZones[j], availableZones[i]];
            }

            const numToActivate = Math.floor(Math.random() * 3) + 3;
            const zonesForThisWave = availableZones.slice(0, numToActivate);

            zonesForThisWave.forEach(zoneIndex => {
                const glowSpot = glowSpots[zoneIndex];

                const zoneWidth = 100 / GRID_COLUMNS;
                const zoneHeight = 100 / GRID_ROWS;
                const col = zoneIndex % GRID_COLUMNS;
                const row = Math.floor(zoneIndex / GRID_COLUMNS);
                const jitterX = (Math.random() - 0.5) * zoneWidth * 0.5;
                const jitterY = (Math.random() - 0.5) * zoneHeight * 0.5;
                const posX = col * zoneWidth + zoneWidth / 2 + jitterX;
                const posY = row * zoneHeight + zoneHeight / 2 + jitterY;

                const size = Math.random() * 350 + 300;
                glowSpot.style.width = `${size}px`;
                glowSpot.style.height = `${size}px`;
                glowSpot.style.left = `${posX}%`;
                glowSpot.style.top = `${posY}%`;

                // Add this spot to the list of actively animating glows
                activeGlows.push({
                    element: glowSpot,
                    startTime: performance.now()
                });
            });

            // Schedule the next wave
            setTimeout(triggerWave, ANIMATION_DURATION);
        };

        // --- Start the animation loop and the first wave ---
        requestAnimationFrame(animateGlows);
        triggerWave();
    }
    // --- END: SINE-WAVE DRIVEN ANIMATION LOGIC ---
    
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
            const targetElement = document.querySelector(targetId);
    
            if (targetElement) {
                // The height of the top blur is '10rem'. We convert this to pixels for the offset.
                const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
                const offset = 10 * remInPixels;
    
                if (lenis) {
                    // For Lenis, a negative offset stops the scroll *before* the target element.
                    // This leaves a 10rem space at the top, preventing the blur from covering the header.
                    lenis.scrollTo(targetElement, { offset: -offset });
                } else {
                    // Fallback for when Lenis isn't available.
                    // We manually calculate the target scroll position minus the offset.
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
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