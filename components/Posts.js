import { template } from "../lib/elemental.js";
import { attr, el, frag, on, qs } from "../lib/tez-dom.js";

const createPost = (post, key) => {

    const { title, url, description, readable_publish_date } = post;
    
    const postEl = el('.post');
    
    const link = el('a.post-link');
    
    attr(link, 'href', url);

    link.textContent = title;
    
    const descriptionEl = el('p.post-description');
    
    descriptionEl.textContent = description;
    
    const postedOnEl = el('div.posted-on');
    
    postedOnEl.textContent = readable_publish_date;
    
    postEl.append(link, descriptionEl, postedOnEl);
    
    attr(postEl, 'data-post', key);
    
    return { node: postEl, data: post };

};

const postsTemplate = template`

    <style>
        
        *, *::before, *::after {
            box-sizing: border-box;
        }

        a, a:hover {
            text-decoration: none;
        }

        #posts {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        
        .post-link {
            color: var(--link-color);
            font-size: x-large;
            font-weight: bold;
        }
        
        .post-link:hover {
            text-decoration: underline;
        }
        
        .post-description {
            margin: .5rem 0;
            color: #fff;
        }
        
        .posted-on {
            margin-bottom: .5rem;
            color: #d4dcdd;
        }
    </style>

    <div id="posts"></div>

`;

class Posts extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {

        this.shadowRoot.appendChild(postsTemplate.content.cloneNode(true));

        this.postsOutlet = qs('#posts', this.shadowRoot);

        this.username = attr(this, 'username');

        const searchBar = qs('.search-bar');
        
        try {
        
            this.posts = await this.loadPosts();
        
            this.sortedPosts = this.posts
                .sort((a, b) => Date.parse(b.published_timestamp) - Date.parse(a.published_timestamp))
                .map(createPost);

            const fragment = frag();

            this.sortedPosts.forEach(({ node }) => {
                fragment.appendChild(node);
            });
                
            this.postsOutlet.appendChild(fragment);

            on(searchBar, 'input', e => {

                const query = e.target.value.trim().toLowerCase();

                this.sortedPosts
                    .forEach(post => {
                        post.node.style.order = this.searchPostData(post, ['title', 'description'], query) 
                            ? 0 
                            : 1;
                    });
        
            });
        
        } catch(e) {
        
            console.error(e);

            this.postsOutlet.textContent = 'Error Loading Posts. Please Try Refreshing The Page';

        }

    }

    async loadPosts() {
        const res = await fetch(`https://dev.to/api/articles${
            !!this.username 
            ? `?username=${this.username}` 
            : ''
        }`);
        const posts = await res.json();
        return posts;
    }

    searchPostData (post, props, query) {
        return Object.entries(post.data)
            .filter(([prop]) => props.includes(prop))
            .some(([_, value]) => value.toLowerCase().includes(query));
    };

}

customElements.define('beast-posts', Posts);