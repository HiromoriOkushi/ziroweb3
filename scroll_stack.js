let lenis;
let animationFrameId;

const config = {
    itemScale: 0.03,
    itemStackDistance: 15,
    stackPosition: '20%',
    scaleEndPosition: '10%',
    baseScale: 0.85,
};

let cards = [];
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
        const cardTop = getElementOffset(card);
        const triggerStart = cardTop - stackPositionPx - config.itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPositionPx;
        
        const pinStart = triggerStart;
        const pinEnd = endElementTop - containerHeight / 2;

        const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
        const targetScale = config.baseScale + i * config.itemScale;
        const scale = 1 - scaleProgress * (1 - targetScale);
        
        let translateY = 0;
        const isPinned = scrollTop >= pinStart && scrollTop < pinEnd;

        if (isPinned) {
            translateY = scrollTop - cardTop + stackPositionPx + config.itemStackDistance * i;
        } else if (scrollTop >= pinEnd) {
            translateY = pinEnd - cardTop + stackPositionPx + config.itemStackDistance * i;
        }

        const newTransform = {
            translateY: Math.round(translateY * 100) / 100,
            scale: Math.round(scale * 1000) / 1000,
        };

        const lastTransform = lastTransforms.get(i);
        const hasChanged = !lastTransform ||
            Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
            Math.abs(lastTransform.scale - newTransform.scale) > 0.001;

        if (hasChanged) {
            card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale})`;
            lastTransforms.set(i, newTransform);
        }
    });

    isUpdating = false;
};

const setupLenis = () => {
    if (lenis) return;
    
    lenis = new Lenis();
    
    lenis.on('scroll', updateCardTransforms);

    function raf(time) {
        lenis.raf(time);
        animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);
};

export function initScrollStack() {
    cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
    if (cards.length === 0) return;

    setupLenis();
    
    setTimeout(() => {
        updateCardTransforms();
    }, 100);

    window.addEventListener('resize', updateCardTransforms);

    return lenis;
}
