import { animate, inView } from 'https://esm.run/framer-motion';
import { initScrollStack } from './scroll_stack.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Initialize scroll stack with custom options
    const lenis = initScrollStack({
        itemDistance: 30,
        itemScale: 0.03,
        itemStackDistance: 30,
        stackPosition: '20%',
        scaleEndPosition: '10%',
        baseScale: 0.85,
        rotationAmount: 0,  // Set to 1-2 for subtle rotation effect
        blurAmount: 0,      // Set to 2-4 for depth blur effect
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
            // FIXED: Corrected email regex
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