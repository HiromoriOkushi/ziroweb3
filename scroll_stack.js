let lenis;
let animationFrameId;
let stackCompletedRef = false;

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

let cards = [];
let cardOriginalTops = []; // CACHE ORIGINAL POSITIONS
const lastTransforms = new Map();
let isUpdating = false;

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
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
};

const updateCardTransforms = () => {
    if (!cards.length || isUpdating) return;

    isUpdating = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(config.stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(config.scaleEndPosition, containerHeight);

    const endElement = document.querySelector('.scroll-stack-end');
    if (!endElement) {
        isUpdating = false;
        return;
    }

    const endElementTop = getElementOffset(endElement);

    cards.forEach((card, i) => {
        if (!card) return;

        // USE CACHED ORIGINAL POSITION
        const cardTop = cardOriginalTops[i];
        const triggerStart = cardTop - stackPositionPx - config.itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPositionPx;
        const pinStart = cardTop - stackPositionPx - config.itemStackDistance * i;
        const pinEnd = endElementTop - containerHeight / 2;

        const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
        const targetScale = config.baseScale + i * config.itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);
        const rotation = config.rotationAmount ? i * config.rotationAmount * scaleProgress : 0;

        // Calculate blur based on card depth in stack
        let blur = 0;
        if (config.blurAmount) {
            let topCardIndex = 0;
            for (let j = 0; j < cards.length; j++) {
                const jCardTop = cardOriginalTops[j];
                const jTriggerStart = jCardTop - stackPositionPx - config.itemStackDistance * j;
                if (scrollTop >= jTriggerStart) {
                    topCardIndex = j;
                }
            }

            if (i < topCardIndex) {
                const depthInStack = topCardIndex - i;
                blur = Math.max(0, depthInStack * config.blurAmount);
            }
        }
        
        let translateY = 0;
        const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

        if (isPinned) {
            translateY = scrollTop - cardTop + stackPositionPx + config.itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
            translateY = pinEnd - cardTop + stackPositionPx + config.itemStackDistance * i;
        }

        const newTransform = {
            translateY: Math.round(translateY * 100) / 100,
            scale: Math.round(scale * 1000) / 1000,
            rotation: Math.round(rotation * 100) / 100,
            blur: Math.round(blur * 100) / 100,
        };

        const lastTransform = lastTransforms.get(i);
        const hasChanged = !lastTransform ||
            Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
            Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
            Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
            Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

        if (hasChanged) {
            const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
            const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

            card.style.transform = transform;
            card.style.filter = filter;

            lastTransforms.set(i, newTransform);
        }

        // Check if last card is in view and trigger callback
        if (i === cards.length - 1) {
            const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
            if (isInView && !stackCompletedRef) {
                stackCompletedRef = true;
                config.onStackComplete?.();
            } else if (!isInView && stackCompletedRef) {
                stackCompletedRef = false;
            }
        }
    });

    isUpdating = false;
};

const setupLenis = () => {
    if (lenis) return;
    
    lenis = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
    });
    
    lenis.on('scroll', updateCardTransforms);

    function raf(time) {
        lenis.raf(time);
        animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);
};

export function initScrollStack(options = {}) {
    // Merge custom options with defaults
    Object.assign(config, options);

    cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
    
    console.log('Initializing scroll stack with', cards.length, 'cards');
    console.log('Config:', config);
    
    if (cards.length === 0) {
        console.error('No cards found with class .scroll-stack-card');
        return;
    }

    // CACHE ORIGINAL POSITIONS BEFORE ANY TRANSFORMS
    cardOriginalTops = cards.map(card => getElementOffset(card));
    console.log('Cached card positions:', cardOriginalTops);

    // Apply itemDistance as margin-bottom to all cards except the last
    cards.forEach((card, i) => {
        if (i < cards.length - 1) {
            card.style.marginBottom = `${config.itemDistance}px`;
        }
        card.style.willChange = 'transform, filter';
        card.style.transformOrigin = 'top center';
        card.style.backfaceVisibility = 'hidden';
        card.style.transform = 'translateZ(0)';
        card.style.webkitTransform = 'translateZ(0)';
        card.style.perspective = '1000px';
        card.style.webkitPerspective = '1000px';
    });

    setupLenis();
    
    setTimeout(() => {
        updateCardTransforms();
        console.log('Initial transform update complete');
    }, 100);

    window.addEventListener('resize', () => {
        // Recache positions on resize
        cardOriginalTops = cards.map(card => getElementOffset(card));
        updateCardTransforms();
    });

    return lenis;
}