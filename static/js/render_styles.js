function renderStyles(values){
    return  `
        ${"#" + values.contId} {
            position: relative;
            width: calc(max(320px, 60vw));
            //outline: 2px solid red;
        }
        @keyframes fadeInDown {
            0% {
                opacity: 0;
                -webkit-transform: translate3d(0, -100%, 0);
                transform: translate3d(0, -100%, 0);
            }
            to {
                opacity: 1;
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
        }
        .fadeInDown {
            -webkit-animation-name: fadeInDown;
            animation-name: fadeInDown;
        }
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                -webkit-transform: translate3d(0, 100%, 0);
                transform: translate3d(0, 100%, 0);
            }
            to {
                opacity: 1;
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }
        }
        .fadeInUp {
            -webkit-animation-name: fadeInUp;
            animation-name: fadeInUp;
        }
        @keyframes fadeOutDown {
            0% {
                opacity: 1;
            }
            to {
                opacity: 0;
                -webkit-transform: translate3d(0, 100%, 0);
                transform: translate3d(0, 100%, 0);
            }
        }
        .fadeOutDown {
            -webkit-animation-name: fadeOutDown;
            animation-name: fadeOutDown;
        }
        .animated {
            -webkit-animation-duration: 1s;
            animation-duration: 1s;
            -webkit-animation-fill-mode: both;
            animation-fill-mode: both;
        }
        .item {
            ${values.item}
        }
        .card-body::first-letter {
            font-family: 'arabic-large';
            font-size: 3rem;
            text-transform: uppercase;
        }
        game-card {
            contain: layout style;
        }
        game-card *:is(h1, h2, h3) {
            margin: 0;
        }
        game-card [data-gamecard-img] {
            transition: transform 0.4s ease;
        }
        game-card:hover [data-gamecard-img] {
            transform: scale(1.5);
        }
        *:has(> game-card) {
            container: game-card-container;
            container-type: inline-size;
        }
        @container game-card-container (max-width: 600px) {
            game-card {
                padding: 0.125rem 0rem !important;
                margin: ${values.itemMarginSmall}px !important;
                --use-small-margin: 1;
            }
            game-card > div:first-child {
                height: ${values.cardHeightSmall} !important;
                font-size: 0.5rem !important;
                padding: 0rem 0rem !important;
            }
            game-card > div:last-child {
                height: ${values.cardHeightSmall} !important;
                width: calc(${values.cardHeightSmall} * ${values.aspectRatio}) !important;
            }
            .card-body::first-letter {
                font-size: 1rem !important;
            }
        }
        :root {
            --inset: 5%;
            --x: 0px;
            --y: 0px;
            --hue: 0;
            --size: 100vmin;
            --hsize: calc(var(--size) / 2);
            --xc: calc(var(--x) - var(--hsize));
            --yc: calc(var(--y) - var(--hsize));
            --glow: radial-gradient(circle at 50% 50%, hsl(var(--hue) 90% 80% / 0.9) 0%, hsl(var(--hue) 80% 70% / 0.6) 50%, transparent 60%) var(--xc) var(--yc) / var(--size) var(--size) no-repeat fixed;
            --inner-glow: 7px;
            --outer-glow: calc(var(--inner-glow) * 2);
            --thickness: calc(var(--outer-glow) - var(--inner-glow));
            --border-inner-radius: clamp(0rem, 1rem, 50%);
            --border-outer-radius: calc(var(--border-inner-radius) + var(--thickness));
        }
        #card-container-wrapper::after {
            position: absolute;
            display: block;
            content: '';
            pointer-events: none;
            z-index: -1;
            background: var(--glow);
            inset: calc(-1 * var(--inner-glow));
            filter: blur(var(--outer-glow));
            mask: linear-gradient(to right, hsl(160 100% 100% /0.9) 0%, transparent var(--inset), transparent 100%), linear-gradient(to bottom, hsl(160 80% 50% /0.9) 0%, transparent var(--inset), transparent 100%), linear-gradient(to left, hsl(160 80% 50% /0.3) 0%, transparent var(--inset), transparent 100%), linear-gradient(to top, hsl(160 80% 50% /0.3) 0%, transparent var(--inset), transparent 100%);
            mask-mode: luminance;
            border-radius: var(--border-outer-radius);
        }
        #card-container-wrapper::before {
            position: absolute;
            display: block;
            content: '';
            pointer-events: none;
            z-index: -2;
            background: var(--glow);
            inset: calc(-1 * var(--outer-glow));
            filter: blur(var(--inner-glow));
            border-radius: border-radius: var(--border-outer-radius);
            mix-blend-mode: hard-light;
        }
    `
}

export const render = renderStyles;