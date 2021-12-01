import { attr, el, frag, on, qs, ready, setStyle, text } from "./lib/tejas.js";

const createChildEl = v => {
    if(typeof v === 'string' || typeof v === 'number') {
        return text(v);
    } else {
        const { type, children = [], props = {}, style = {} } = v;

        const elem = el(type);

        if(type === 'img') {

            const { src, width = 200, height = 200 } = props;

            if(!src) throw new Error('No Image Source Has Been Provided');

            const placeholder = createChildEl({
                type: 'div',
                props: {
                    class: 'placeholder'
                },
                style: {
                    width: width + 'px', 
                    height: height + 'px'
                },
                children: ["Loading..."]
            });

            elem.onload = () => placeholder.replaceWith(elem);

            elem.src = src;

            return placeholder;

        } else {

            const fragment = frag();
            const childEls = children.map(createChildEl);
            fragment.append(...childEls);

            setStyle(elem, style);

            Object.entries(props).forEach(([prop, val]) => attr(elem, prop, val));

            elem.appendChild(fragment);

            return elem;

        }

    }
};

const createSlideEl = ({ title, children, style }) => {

    const slide = el('div.slide');

    const childEls = children.map(createChildEl);

    const fragment = frag();

    fragment.append(...childEls);

    setStyle(slide, style);

    slide.appendChild(fragment);
    
    return slide;

};

const app = () => {

    const container = qs('.container');
    const slidesContainer = qs('.slides');

    const prevSlideBtn = qs('#prevSlideBtn');
    const nextSlideBtn = qs('#nextSlideBtn');
    const pagination = qs('.pagination');

    const fragment = frag();

    const slides = [
        { 
            children: [
                { type: "h1", children: ["Hello world"] }
            ],
            style: { 
                background: "lightblue" 
            }
        },
        { 
            children: [
                { type: "h1", children: ["This is a test"] }
            ]
        },
        {
            children: [
                { type: "h1", children: ["This is a random image"] },
                { type: "img", props: { src: "https://picsum.photos/200/300" } }
            ]
        },
        {
            children: [
                { type: "h1", children: ["This is some long text"] },
                { type: "p", children: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."] }
            ]
        }
    ];

    const slideEls = slides.map(createSlideEl);

    let currentSlide = 0;

    const updatePagination = () => {
        pagination.textContent = `${currentSlide + 1} / ${slideEls.length}`;
        if(currentSlide === 0) {
            prevSlideBtn.disabled = true;
        } else {
            prevSlideBtn.disabled = false;
        }
        if(currentSlide === slideEls.length - 1) {
            nextSlideBtn.disabled = true;
        } else {
            nextSlideBtn.disabled = false;
        }
    };

    updatePagination();

    const bringIntoView = id => {
        slideEls[id].scrollIntoView();
        currentSlide = id;
        updatePagination();
    };

    fragment.append(...slideEls);

    slidesContainer.appendChild(fragment);

    const handlePrevSlideBtn = () => {
        if(currentSlide !== 0) {
            bringIntoView(currentSlide - 1);
        }
    };

    const handleNextSlideBtn = () => {
        if(currentSlide !== slideEls.length - 1) {
            bringIntoView(currentSlide + 1);
        }
    };

    const handleKeys = e => {
        if(e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            container.requestFullscreen();
        } else if(e.key === 'ArrowRight') {
            e.preventDefault();
            handleNextSlideBtn();
        } else if(e.key === 'ArrowLeft') {
            e.preventDefault();
            handlePrevSlideBtn();
        }
    };

    const handleRoute = () => {
        const slideId = parseInt(location.hash.substr(1));
        if(!isNaN(slideId)) {
            bringIntoView(slideId - 1);
        }
    };

    handleRoute();

    on(prevSlideBtn, 'click', handlePrevSlideBtn);
    on(nextSlideBtn, 'click', handleNextSlideBtn);
    on(window, 'keydown', handleKeys);
    on(window, 'hashchange', handleRoute);

};

ready(app);