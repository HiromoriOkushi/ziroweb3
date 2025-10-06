import { animate, inView } from 'https://esm.run/framer-motion';
import { initScrollStack } from './scroll_stack.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // Initialize Particles.js
    if (document.getElementById('particles-bg')) {
        particlesJS('particles-bg', {
            "particles": {
                "number": {
                    "value": 160, // Number of particles
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff" // Particle color
                },
                "shape": {
                    "type": "circle",
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 2, // Particle size
                    "random": true,
                    "anim": {
                        "enable": false,
                    }
                },
                "line_linked": {
                    "enable": false, // No lines connecting particles
                },
                "move": {
                    "enable": true,
                    "speed": 0.4, // Movement speed
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "repulse" // Particles move away from cursor
                    },
                    "onclick": {
                        "enable": false,
                    },
                    "resize": true
                },
                "modes": {
                    "repulse": {
                        "distance": 80,
                        "duration": 0.4
                    }
                }
            },
            "retina_detect": true
        });
    }

    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Initialize scroll stack with your new custom options
    const lenis = initScrollStack({
        itemDistance: 45,
        itemScale: 0.03,
        itemStackDistance: 30,
        stackPosition: '30%',
        scaleEndPosition: '20%',
        baseScale: 0.75,
        rotationAmount: 0,
        blurAmount: 0.5,
        onStackComplete: () => {
            console.log('Stack animation completed!');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (lenis && targetId) {
                lenis.scrollTo(targetId);
            } else if (targetId) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
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
                setTimeout(() => {
                    messageEl.textContent = '';
                }, 5000);
            } else {
                messageEl.textContent = 'Please enter a valid email address.';
                messageEl.className = 'text-red-400 mt-4 h-6';
                 setTimeout(() => {
                    messageEl.textContent = '';
                }, 3000);
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