import { clonePrompt } from "../lib/clone-prompt.js";
import { debounce } from "../lib/debounce.js";
import { getCharWidth } from "../lib/get-char-width.js";
import { parseCommand } from "../lib/parse-command.js";
import { ASCII_ART } from "./ascii-art.js";

const template = document.createElement('template');

template.innerHTML = `
<div class="output">
</div>
<div class="prompt flex gap-half-rem align-center">
    <div class="user">portfolio@harsh:~$</div>
    <div class="prompt-input">
        <div class="cmd"></div>
        <div class="caret"></div>
    </div>
</div>
`;

class CLIApplication extends HTMLElement {

    static fakeFiles = ['portfolio.txt', '.config', 'secret.txt', 'main.js'];

    static aboutMe = [
        ASCII_ART.join('\n'),
        "I'm A WEB DEVELOPER",
        "Contact Me: harshsingh[dot]js[at]gmail.com",
        "Location: Bharat 🇮🇳",
        { type: 'link', label: 'Github', href: 'https://github.com/theharshsingh', text: "@theharshsingh" },
        'Enter "projects" to see a list of the projects I have worked on.'
    ]

    static projects = [
        { text: 'Leave Management System', link: 'https://leave-management-system.web.app' },
        { text: 'PixelGrid - Pixel Art Editor', link: 'https://pixel-grid-app.surge.sh' },
        { text: 'CryptoPriceTracker', link: 'https://cryptopricetracker.surge.sh' },
        { text: 'LowCalDraw - A Toy-ish clone of ExcaliDraw', link: 'https://low-calorie-draw.surge.sh' }
    ]

    cmdPromptEl = null
    cmdEl = null
    caret = null
    output = null
    commandBtns = null

    charWidth = 7

    #caretPos = 0

    #initialized = false

    #commandHistory = []

    #commandHistoryPointer = 0

    constructor() {
        super();

        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        if(!this.#initialized) {
            this.init();

            this.#initialized = true;
        }
    }

    init() {
        this.cmdPromptEl = this.querySelector('.prompt');
        this.cmdEl = this.querySelector('.cmd');
        this.caret = this.querySelector('.caret');
        this.output = this.querySelector('.output');

        if('animate' in this.caret) {
            this.caretAnimation = this.caret.animate(
                [
                    {opacity: 1},
                    {opacity: 0},
                    {opacity: 1},
                ], {
                    easing: 'steps(2, end)',
                    duration: 800,
                    iterations: Infinity,
                }
            );
        }

        const loadingScreen = document.querySelector('.loading-screen');

        this.commandBtns = Array.from(document.querySelectorAll('.command-btn')).map(btn => {
            return { btn, command: btn.getAttribute('data-command') }
        });

        this.charWidth = getCharWidth();

        this.attachListeners();

        this.caretPostition = 5;
        this.execCommand('about');

        loadingScreen.classList.add('hide');
    }

    get caretPostition() {
        return this.#caretPos;
    }

    set caretPostition(value) {
        this.#caretPos = value;
        this.caret.style.left = `${this.caretPostition * this.charWidth}px`;
    }

    get cmdText() {
        return this.cmdEl.textContent;
    }

    set cmdText(value) {
        this.cmdEl.textContent = value;
    }

    clearOutput() {
        let c;
        while(c = this.output.lastChild) {
            c.remove();
        }
    }

    printLsOutput() {
        const container = document.createElement('div');
        container.className = 'cmd-output-container flex p-half-rem dir-col';
        const items = CLIApplication.fakeFiles.map(fileName => {
            const item = document.createElement('div');

            item.className = 'term-line';
            
            if(fileName[0] === '.') {
                item.className = 'hidden-file';
            }

            item.textContent = fileName;

            return item;
        });
        const fragment = document.createDocumentFragment();
        fragment.append(...items);
        container.appendChild(fragment);
        this.output.appendChild(container);
    }

    printAboutMe() {
        const container = document.createElement('div');
        container.className = 'cmd-output-container';
        const lines = CLIApplication.aboutMe.map(line => {
            const node = document.createElement('div');

            node.className = 'term-line';

            if(typeof line === 'string') {
                node.textContent = line;
            } else if(line.type === 'link') {
                if(line.label) {
                    node.appendChild(document.createTextNode(`${line.label}: `));
                }
                
                const link = document.createElement('a');
                link.href = line.href;
                link.textContent = line.text;
                node.appendChild(link);
            }

            return node;
        });
        const fragment = document.createDocumentFragment();
        fragment.append(...lines);
        container.appendChild(fragment);
        this.output.appendChild(container);
    }

    printProjects() {
        const container = document.createElement('div');
        container.className = 'cmd-output-container';
        const lines = CLIApplication.projects.map(({ link, text }) => {
            const node = document.createElement('div');

            const a = document.createElement('a');

            a.className = 'term-link';

            a.target = '_blank';
            
            a.href = link;

            a.textContent = text;

            node.appendChild(a);

            return node;
        });
        const fragment = document.createDocumentFragment();
        fragment.append(...lines);
        container.appendChild(fragment);
        this.output.appendChild(container);
    }

    handleCommand(input) {
        const { command, args } = parseCommand(input);
        switch(command) {
            case 'clear':
                this.clearOutput();
            break;
            case 'ls':
                this.printLsOutput();
            break;
            case 'about':
                this.printAboutMe();
            break;
            case 'projects':
                this.printProjects();
            break;
        }
    }

    execCommand(input) {
        const clone = clonePrompt(input);
        this.output.appendChild(clone);
        this.handleCommand(input);
        this.#commandHistory.push({
            cmdText: input,
            caretPosition: this.caretPostition
        });
        this.#commandHistoryPointer = this.#commandHistory.length;
        this.cmdText = '';
        this.caretPostition = 0;
        clone.scrollIntoView();
    }

    moveCommandHistory(n) {
        const result = this.#commandHistory[this.#commandHistoryPointer + n];

        if(result) {
            const { cmdText, caretPosition } = result;

            this.cmdText = cmdText;
            this.caretPostition = caretPosition;

            this.#commandHistoryPointer += n;
        } else if(this.#commandHistoryPointer + n === this.#commandHistory.length) {
            this.cmdText = '';
            this.caretPostition = 0;
            this.#commandHistoryPointer += n;
        }
    }

    attachListeners() {
        let timeout = null;
        const playPauseBlinkCaret = debounce(() => {
            this.caretAnimation.currentTime = 0;
            this.caretAnimation.pause();

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                this.caretAnimation.play();
            }, 800);
        }, 100);

        const handleKey = (e) => {
            e.preventDefault();

            const key = e.key;

            if(key === 'Shift' || key === 'Alt' || key === 'Control') {
        
            } else if(key === 'Backspace') {
                if(this.caretPostition <= 0) {
                    return;
                }
        
                const left = this.cmdText.slice(0, this.caretPostition - 1);
                const right = this.cmdText.slice(this.caretPostition);
                this.cmdText = left + right;
                this.caretPostition -= 1;
            } else if(key === 'Delete') {
                if(this.caretPostition >= this.cmdText.length) {
                    return;
                }
        
                const left = this.cmdText.slice(0, this.caretPostition);
                const right = this.cmdText.slice(this.caretPostition + 1);
                this.cmdText = left + right;
            } else if(key === 'ArrowLeft') {
                if(this.caretPostition <= 0) {
                    return;
                }
        
                this.caretPostition -= 1;
            } else if(key === 'ArrowRight') {
                if(this.caretPostition >= this.cmdText.length) {
                    return;
                }
                this.caretPostition += 1;
            } else if(key === 'ArrowUp') {
                this.moveCommandHistory(-1);
            } else if(key === 'ArrowDown') {
                this.moveCommandHistory(1);
            } else if(key === 'Enter') {
                this.execCommand(this.cmdText);
            } else {
                const left = this.cmdText.slice(0, this.caretPostition);
                const right = this.cmdText.slice(this.caretPostition);
                this.cmdText = left + key + right;
                this.caretPostition += 1;
                if(this.caretAnimation) {
                    playPauseBlinkCaret();
                }
            }
        };

        const setCommand = command => {
            this.cmdText = command;
            this.caretPostition = command.length;
        };

        this.commandBtns.forEach(({ btn, command }) => {
            if(command === 'enter') {
                btn.addEventListener('click', () => this.execCommand(this.cmdText));
            } else {
                btn.addEventListener('click', () => setCommand(command));
            }
        });

        window.addEventListener('keydown', handleKey);
    }

}

customElements.define('cli-app', CLIApplication);