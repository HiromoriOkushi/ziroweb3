const DEFAULT_CONFIG = {
    position: 'bottom',
    strength: 2,
    height: '6rem',
    divCount: 5,
    exponential: false,
    zIndex: 10,
    opacity: 1,
    curve: 'linear',
    target: 'parent',
    className: '',
    style: {}
};

const PRESETS = {
    top: { position: 'top', height: '6rem' },
    bottom: { position: 'bottom', height: '6rem' },
    left: { position: 'left', height: '6rem' },
    right: { position: 'right', height: '6rem' },
    subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
    intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
    smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
    sharp: { height: '5rem', curve: 'linear', divCount: 4 },
    header: { position: 'top', height: '8rem', curve: 'ease-out' },
    footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
    'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
    'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
};

const CURVE_FUNCTIONS = {
    linear: p => p,
    bezier: p => p * p * (3 - 2 * p),
    'ease-in': p => p * p,
    'ease-out': p => 1 - Math.pow(1 - p, 2),
    'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};

const getGradientDirection = position => ({
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right'
}[position] || 'to bottom');

export default class GradualBlur {
    constructor(elementOrSelector, props = {}) {
        this.element = typeof elementOrSelector === 'string' ? document.querySelector(elementOrSelector) : elementOrSelector;
        if (!this.element) {
            console.error('GradualBlur: Target element not found for selector:', elementOrSelector);
            return;
        }

        const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {};
        this.config = { ...DEFAULT_CONFIG, ...presetConfig, ...props };
        
        this.init();
    }

    init() {
        this.injectGlobalStyles();
        this.applyContainerStyles();
        this.renderBlurDivs();
    }

    applyContainerStyles() {
        const { position, target, zIndex, style, className, height, width } = this.config;
        const isVertical = ['top', 'bottom'].includes(position);
        const isHorizontal = ['left', 'right'].includes(position);
        const isPageTarget = target === 'page';

        const baseStyle = {
            position: isPageTarget ? 'fixed' : 'absolute',
            pointerEvents: 'none',
            zIndex: zIndex,
            ...style
        };

        if (isVertical) {
            baseStyle.height = height;
            baseStyle.width = width || '100%';
            baseStyle[position] = 0;
            baseStyle.left = 0;
            baseStyle.right = 0;
        } else if (isHorizontal) {
            baseStyle.width = width || height;
            baseStyle.height = '100%';
            baseStyle[position] = 0;
            baseStyle.top = 0;
            baseStyle.bottom = 0;
        }

        Object.assign(this.element.style, baseStyle);
        this.element.className += ` gradual-blur ${isPageTarget ? 'gradual-blur-page' : 'gradual-blur-parent'} ${className}`;
    }

    renderBlurDivs() {
        const { divCount, strength, curve, exponential, position, opacity } = this.config;
        const innerContainer = document.createElement('div');
        innerContainer.className = 'gradual-blur-inner';
        
        const fragment = document.createDocumentFragment();
        const increment = 100 / divCount;
        const curveFunc = CURVE_FUNCTIONS[curve] || CURVE_FUNCTIONS.linear;

        for (let i = 1; i <= divCount; i++) {
            let progress = i / divCount;
            progress = curveFunc(progress);

            let blurValue;
            if (exponential) {
                blurValue = Math.pow(2, progress * 4) * 0.0625 * strength;
            } else {
                blurValue = 0.0625 * (progress * divCount + 1) * strength;
            }
            
            const p1 = Math.round((increment * i - increment) * 10) / 10;
            const p2 = Math.round(increment * i * 10) / 10;
            const p3 = Math.round((increment * i + increment) * 10) / 10;
            const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

            let gradient = `transparent ${p1}%, black ${p2}%`;
            if (p3 <= 100) gradient += `, black ${p3}%`;
            if (p4 <= 100) gradient += `, transparent ${p4}%`;

            const direction = getGradientDirection(position);
            
            const div = document.createElement('div');
            const divStyle = {
                position: 'absolute',
                inset: '0',
                maskImage: `linear-gradient(${direction}, ${gradient})`,
                WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
                backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                opacity: opacity,
            };
            Object.assign(div.style, divStyle);
            fragment.appendChild(div);
        }

        innerContainer.appendChild(fragment);
        this.element.innerHTML = '';
        this.element.appendChild(innerContainer);
    }

    injectGlobalStyles() {
        if (document.getElementById('gradual-blur-styles')) return;
        const styleElement = document.createElement('style');
        styleElement.id = 'gradual-blur-styles';
        styleElement.textContent = `
          .gradual-blur { 
              pointer-events: none; 
              isolation: isolate; 
          }
          .gradual-blur-inner { 
              position: relative; 
              width: 100%; 
              height: 100%; 
              pointer-events: none; 
          }
          .gradual-blur-inner > div {
              -webkit-backdrop-filter: inherit;
              backdrop-filter: inherit;
          }
          @supports not (backdrop-filter: blur(1px)) {
            .gradual-blur-inner > div {
              background: rgba(5, 5, 5, 0.7);
            }
          }
        `;
        document.head.appendChild(styleElement);
    }
}
