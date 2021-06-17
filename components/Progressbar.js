import { template } from "../lib/elemental.js";
import { on, qs } from "../lib/tez-dom.js";

const progressBarTemplate = template`
    <style>
    .progress-bar-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
    }
    
    .progress-bar {
        width: 10%;
        background-color: #00ffbf;
        transition: width .3s;
    }
    
    .progress-bar.show {
        height: .1rem;
        width: 100%;
    }
    </style>

    <div class="progress-bar-container">
        <div class="progress-bar show"></div>
    </div>
`;

class Progressbar extends HTMLElement {

    connectedCallback() {

        this.appendChild(progressBarTemplate.content.cloneNode(true));

        this.progressBar = qs('.progress-bar', this);

        on(window, 'beforeunload', () => {
            this.progressBar.classList.add('show');
        });
    
        on(window, 'load', () => {
            this.progressBar.classList.remove('show');
        });

    }

}

customElements.define('beast-progress-bar', Progressbar);