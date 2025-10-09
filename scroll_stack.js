// FILE: scroll_stack.js

let lenis;
let animationFrameId;
let stackCompletedRef = false;

// --- CONFIGURATION ---
const config = {
    itemDistance: 30,
    itemScale: 0.1,
    itemStackDistance: 20,
    stackPosition: '35%',
    scaleEndPosition: '10%',
    baseScale: 0.7,
    rotationAmount: 0,
    blurAmount: 0,
    onStackComplete: null,
};
const DESKTOP_BREAKPOINT = 768; // The width (in px) above which the animation will run

// --- PRIVATE VARIABLES ---
let cards = [];
let cardOriginalTops = [];
const lastTransforms = new Map();
let isUpdating = false;
let stickyHeaderElement;

// --- HELPER FUNCTIONS (Desktop Only) ---
const calculateProgress = (scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
};

const parsePercentage = (value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
        return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
};

const getScrollData = () => ({
    scrollTop: window.scrollY,
    containerHeight: window.innerHeight,
});

const getElementOffset = (element) => {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
};

// --- CORE ANIMATION LOGIC (Desktop Only) ---
const updateCardTransforms = () => {
    if (!cards.length || isUpdating) return;
    isUpdating = true;

    const { scrollTop, containerHeight } = getScrollData();
    
    // --- START OF PADDING FIX ---
    // The `.sticky-header` in style.css has a `margin-bottom: -1rem` (-16px).
    // To maintain a true 24px padding, we must add 16px to our calculation
    // to counteract this negative margin.
    const PADDING_COMPENSATION = 16; 
    const stackPositionPx = stickyHeaderElement 
        ? stickyHeaderElement.offsetHeight + 24 + PADDING_COMPENSATION 
        : parsePercentage(config.stackPosition, containerHeight);
    // --- END OF PADDING FIX ---
    
    const scaleEndPositionPx = parsePercentage(config.scaleEndPosition, containerHeight);
    const endTextElement = document.getElementById('final-stack-text');

    if (!endTextElement) {
        isUpdating = false;
        return;
    }

    const endTextElementTop = getElementOffset(endTextElement);
    const desiredFinalTop = containerHeight * 0.75;
    const pinEnd = endTextElementTop - desiredFinalTop;

    if (stickyHeaderElement) {
        if (scrollTop > pinEnd) {
            const mainHeaderHeight = 72;
            const scrollDelta = scrollTop - pinEnd;
            const newTop = mainHeaderHeight - scrollDelta;
            stickyHeaderElement.style.top = `${newTop}px`;
        } else {
            stickyHeaderElement.style.top = `var(--header-height)`;
        }
    }

    cards.forEach((card, i) => {
        const cardTop = cardOriginalTops[i];
        const pinStart = cardTop - stackPositionPx - (config.itemStackDistance * i);
        const triggerStart = pinStart;
        const triggerEnd = cardTop - scaleEndPositionPx;
        const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
        const targetScale = config.baseScale + i * config.itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);
        const rotation = config.rotationAmount ? i * config.rotationAmount * scaleProgress : 0;
        let blur = 0;

        if (config.blurAmount) {
            let topCardIndex = 0;
            for (let j = 0; j < cards.length; j++) {
                if (scrollTop >= (cardOriginalTops[j] - stackPositionPx - (config.itemStackDistance * j))) {
                    topCardIndex = j;
                }
            }
            if (i < topCardIndex) {
                blur = Math.max(0, (topCardIndex - i) * config.blurAmount);
            }
        }
        
        let translateY = 0;
        const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isPinned) {
            translateY = scrollTop - cardTop + stackPositionPx + (config.itemStackDistance * i);
        } else if (scrollTop > pinEnd) {
            translateY = pinEnd - cardTop + stackPositionPx + (config.itemStackDistance * i);
        }

        const newTransform = {
            translateY: Math.round(translateY * 100) / 100,
            scale: Math.round(scale * 1000) / 1000,
            rotation: Math.round(rotation * 100) / 100,
            blur: Math.round(blur * 100) / 100,
        };

        const lastTransform = lastTransforms.get(i);
        if (!lastTransform || Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 || Math.abs(lastTransform.scale - newTransform.scale) > 0.001 || Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 || Math.abs(lastTransform.blur - newTransform.blur) > 0.1) {
            const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
            const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';
            card.style.transform = transform;
            card.style.filter = filter;
            lastTransforms.set(i, newTransform);
        }
    });

    isUpdating = false;
};

// --- SETUP FUNCTIONS (Desktop Only) ---
const setupLenis = () => {
    if (lenis) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', updateCardTransforms);
    function raf(time) {
        lenis.raf(time);
        animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);
};

// --- PRIMARY EXPORTED FUNCTION ---
export function initScrollStack(options = {}) {
    // --- DEVICE CHECK ---
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
        const mobileCards = Array.from(document.querySelectorAll('.scroll-stack-glass'));
        const mobileHeader = mobileCards.length > 0 ? mobileCards[0].closest('.section-with-sticky')?.querySelector('.sticky-header') : null;

        if (mobileHeader) {
            mobileHeader.style.position = 'static';
        }

        mobileCards.forEach(card => {
            card.style.marginBottom = '24px';
        });
        
        console.log('ScrollStack: Mobile view detected. Animation disabled.');
        return; // Exit the function early for mobile.
    }

    // --- DESKTOP INITIALIZATION ---
    console.log('ScrollStack: Desktop view detected. Initializing animation.');
    Object.assign(config, options);

    cards = Array.from(document.querySelectorAll('.scroll-stack-glass'));
    if (cards.length === 0) return;

    const parentSection = cards[0].closest('.section-with-sticky');
    if (parentSection) {
        stickyHeaderElement = parentSection.querySelector('.sticky-header');
    }

    cardOriginalTops = cards.map(card => getElementOffset(card));

    cards.forEach((card, i) => {
        if (i < cards.length - 1) {
            card.style.marginBottom = `${config.itemDistance}px`;
        }
        card.style.willChange = 'transform, filter';
        card.style.transformOrigin = 'top center';
    });

    setupLenis();
    
    setTimeout(() => updateCardTransforms(), 100);

    window.addEventListener('resize', () => {
        window.location.reload();
    });

    return lenis;
}