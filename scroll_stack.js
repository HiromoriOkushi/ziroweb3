let lenis;
let animationFrameId;
let stackCompletedRef = false;

const config = {
    itemDistance: 30,
    itemScale: 0.03,
    itemStackDistance: 30,
    stickyTop: 180, // Fixed position below header where cards stick
    scaleEndPosition: 150,
    baseScale: 0.85,
    rotationAmount: 0,
    blurAmount: 0,
    onStackComplete: null,
};

let cards = [];
const lastTransforms = new Map();
let isUpdating = false;

const calculateProgress = (scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
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

    const endElement = document.querySelector('.scroll-stack-end');
    if (!endElement) {
        isUpdating = false;
        return;
    }

    const endElementTop = getElementOffset(endElement);

    cards.forEach((card, i) => {
        if (!card) return;

        const cardTop = getElementOffset(card);
        
        // Calculate when this card should start sticking
        const stickyStartScroll = cardTop - config.stickyTop - (i * config.itemStackDistance);
        const scaleStartScroll = stickyStartScroll;
        const scaleEndScroll = cardTop - config.scaleEndPosition;
        
        // Calculate when stacking ends (all cards should release)
        const releaseScroll = endElementTop - containerHeight / 2;

        // Scale progress
        const scaleProgress = calculateProgress(scrollTop, scaleStartScroll, scaleEndScroll);
        const targetScale = config.baseScale + i * config.itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);
        
        // Rotation
        const rotation = config.rotationAmount ? i * config.rotationAmount * scaleProgress : 0;

        // Calculate blur based on card depth in stack
        let blur = 0;
        if (config.blurAmount) {
            let topCardIndex = 0;
            for (let j = 0; j < cards.length; j++) {
                const jCardTop = getElementOffset(cards[j]);
                const jStickyStart = jCardTop - config.stickyTop - (j * config.itemStackDistance);
                if (scrollTop >= jStickyStart) {
                    topCardIndex = j;
                }
            }

            if (i < topCardIndex) {
                const depthInStack = topCardIndex - i;
                blur = Math.max(0, depthInStack * config.blurAmount);
            }
        }
        
        let translateY = 0;
        
        // Three states: before sticky, sticky, after release
        if (scrollTop < stickyStartScroll) {
            // Before sticky - card is in normal position
            translateY = 0;
        } else if (scrollTop >= stickyStartScroll && scrollTop < releaseScroll) {
            // Sticky - card sticks at fixed position
            translateY = scrollTop - cardTop + config.stickyTop + (i * config.itemStackDistance);
        } else {
            // After release - card moves with the release point
            translateY = releaseScroll - cardTop + config.stickyTop + (i * config.itemStackDistance);
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
            const isInView = scrollTop >= stickyStartScroll && scrollTop < releaseScroll;
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
    if (cards.length === 0) return;

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
    }, 100);

    window.addEventListener('resize', updateCardTransforms);

    return lenis;
}