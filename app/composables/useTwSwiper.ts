export const useTwSwiper = () => {


    const arrayToRGBString = (rgb: number[], opacity?: number) => {
        if (opacity !== undefined) return `rgba(${rgb.join(',')}, ${opacity})`

        return `rgb(${rgb.join(',')})`
    };

    const hexToRGBArray = (hex: string) => hex.match(/[A-Za-z0-9]{2}/g)!.map(v => parseInt(v, 16));

    const hexToRGBString = (hex: string, opacity?: number) => arrayToRGBString(hexToRGBArray(hex), opacity);

    function swiperOverflowVisible() {
        return `
    .swiper {
        overflow: visible;
    }`
    }

    /*   function swiperPagination(color?: string) {
        const background = hexToRGBString("#ffffff", .1);

        return `
        .swiper {
            overflow: visible;
            padding-bottom: 60px;
        }

        .swiper-pagination-bullet {
            --swiper-pagination-bottom: 0;
            --swiper-pagination-bullet-horizontal-gap: 12px;
            --swiper-pagination-bullet-size: 12px;
            --swiper-theme-color: #ffffff;
            --swiper-pagination-bullet-inactive-opacity: 0.5;
            --swiper-pagination-bullet-inactive-color: #ffffff;
        }
    `;
      }*/


// Another example

    type SwiperPaginationOptions = {
        swiper?: { padding?: string },
        pagination?: { paddingBottom?: string }
        theme?: 'white' | 'yellow-300'
    };

    function swiperPagination(options?: SwiperPaginationOptions) {

        const defaultOptions = {
            swiper: {
                padding: '0 0 0 0'
            },
            pagination: {
                paddingBottom: '16px'
            },
            theme: 'yellow-300'
        }

        const mergedOptions = {

            swiper: {
                ...defaultOptions.swiper,
                ...(options?.swiper || {})
            },
            pagination: {
                ...defaultOptions.pagination,
                ...(options?.pagination || {})
            },
            theme: options?.theme || defaultOptions.theme

        };

        return `
    :host { 
        height: 100%; 
    }

    .swiper {
        padding: ${mergedOptions.swiper.padding};
    }

    .swiper-horizontal>.swiper-pagination-bullets, .swiper-pagination-bullets.swiper-pagination-horizontal {
        --swiper-pagination-bottom: ${mergedOptions.pagination.paddingBottom};
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 3rem;
    }

    .swiper-pagination-bullets {
        counter-reset: swiper-pagination-bullet;
    }

    .swiper-pagination-bullet {
        background: transparent;
        opacity: 1;
        width: auto;
        height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        color: var(--color-white);
        font-size: 14px;
        transition: transform 0.3s ease, color 0.3s ease;
        counter-increment: swiper-pagination-bullet;
    }
    
    .swiper-pagination-bullet::before {
        content: counter(swiper-pagination-bullet);
    }

    .swiper-pagination-bullet::after {
        content: '';
        display: inline-block;
        opacity: 0; 
        overflow: hidden;
        background-color: currentcolor;
        
        mask: url('/svg/icons/arrow-top-brazier.svg');
        mask-position: center;
        mask-size: contain;
        mask-repeat: no-repeat;
        
        transition: height 0.3s ease, opacity 0.3s ease, margin-top 0.3s;
        width: 1em;
        height: 0px;
    }
    
    .swiper-pagination-bullet-active {
        color: var(--color-gold-400);
    }
    
    .swiper-pagination-bullet-active::after {
        opacity: 1; 
        height: 1em;
        margin-top: 4px;
    }
      `
    }

    function swiperProgressbar(options?: { colorVar?: string, height?: string, gap?: string }) {
        const colorVar = options?.colorVar || 'var(--color-yellow-300)';
        const height = options?.height || '4px';
        const gap = options?.gap || '48px';
        return `
    .swiper {
      padding-bottom: ${gap};
    }
    .swiper-horizontal>.swiper-pagination-progressbar, .swiper-pagination-progressbar.swiper-pagination-horizontal {
      left: 0;
      width: 100%;
      height: ${height};
      top: auto;
      bottom: 0;
      background: #232323;
    }
    .swiper-pagination-progressbar .swiper-pagination-progressbar-fill {
      background: ${colorVar};
    }
    `
    }

    return {
        swiperPagination,
        swiperOverflowVisible,
        swiperProgressbar
    }

}