import { attr, el, frag } from '../lib/tez-dom.js';

const createTag = ({ name }) => {
    const tag = el('a.tag');
    attr(tag, 'href', '#' + name);
    tag.textContent = name;
    return tag;
};

class Tags extends HTMLElement {

    async connectedCallback() {

        this.tagsElem = el('#tags');

        this.appendChild(this.tagsElem);

        try {
    
            this.tags = await this.loadTags();
        
            const fragment = frag();
    
            const tagElems = this.tags.map(createTag);
    
            fragment.append(...tagElems);

            this.tagsElem.appendChild(fragment);
    
        } catch(e) {
    
            console.error(e);
        
        }
    
    }

    async loadTags() {
        const res = await fetch('https://dev.to/api/tags');
        const tags = await res.json();
        return tags;
    };

}

customElements.define('beast-tags', Tags);