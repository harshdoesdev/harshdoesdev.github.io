import { clonePrompt } from "./lib/clone-prompt.js";
import { debounce } from "./lib/debounce.js";
import { getCharWidth } from "./lib/get-char-width.js";
import { parseCommand } from "./lib/parse-command.js";
import { commands, quickCommands } from "./lib/commands.js";

const MOD_KEYS = ['Shift', 'Alt', 'CapsLock'];

const template = document.createElement('template');
template.innerHTML = `
<div class="output"></div>
<div class="prompt flex gap-half-rem align-center">
    <div class="user">portfolio@harsh:~$</div>
    <div class="prompt-input">
        <div class="cmd"></div>
        <div class="caret"></div>
    </div>
</div>
<div class="command-btns">
    <!-- Buttons for each command will be inserted here -->
</div>
`;

class CLIApplication extends HTMLElement {
    cmdPromptEl = null;
    cmdEl = null;
    caret = null;
    output = null;
    charWidth = 7;
    commandButtonsEl = null;

    #caretPos = 0;
    #initialized = false;
    #commandHistory = [];
    #commandHistoryPointer = 0;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        if (!this.#initialized) {
            this.init();
            this.#initialized = true;
        }
    }

    init() {
        this.cmdPromptEl = this.querySelector('.prompt');
        this.cmdEl = this.querySelector('.cmd');
        this.caret = this.querySelector('.caret');
        this.output = this.querySelector('.output');
        this.commandButtonsEl = this.querySelector('.command-btns');

        this.charWidth = getCharWidth();
        this.attachListeners();
        this.caretPosition = 5;
        this.execCommand('about');
        this.createCommandButtons();

        document.querySelector('.loading-screen').classList.add('hide');

        if ('animate' in this.caret) {
            this.caretAnimation = this.caret.animate(
                [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
                { easing: 'steps(2, end)', duration: 800, iterations: Infinity }
            );
        }
    }

    createCommandButtons() {
        quickCommands.forEach(command => {
            const button = document.createElement('button');
            button.textContent = command;
            button.classList.add('command-btn');
            button.addEventListener('click', () => {
                this.execCommand(command);
            });
            this.commandButtonsEl.appendChild(button);
        });
    }

    get caretPosition() {
        return this.#caretPos;
    }

    set caretPosition(value) {
        this.#caretPos = value;
        this.caret.style.left = `${this.caretPosition * this.charWidth}px`;
    }

    get cmdText() {
        return this.cmdEl.textContent;
    }

    set cmdText(value) {
        this.cmdEl.textContent = value;
    }

    clearOutput() {
        while (this.output.lastChild) {
            this.output.lastChild.remove();
        }
    }

    printOutput(items, type = 'text') {
        const container = document.createElement('div');
        container.className = 'cmd-output-container flex p-half-rem dir-col';
        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            const line = document.createElement('div');
            line.className = type === 'link' ? 'term-link' : 'term-line';

            if (typeof item === 'string') {
                line.textContent = item;
            } else if (item.type === 'link') {
                const link = document.createElement('a');
                link.href = item.link;
                link.target = '_blank';
                link.textContent = item.text;
                line.textContent = item.label ? `${item.label}: ` : '';
                line.appendChild(link);
            } else if (item.text) {
                line.textContent = item.text;

                if (item.fontSize) {
                    line.style.fontSize = item.fontSize;
                }

                if (item.bold) {
                    line.classList.add('bold');
                }

                if (item.animation) {
                    if (item.animation === 'glitch') {
                        line.setAttribute('data-text', item.text);
                    }

                    line.classList.add(item.animation);
                }
            }

            fragment.appendChild(line);
        });

        container.appendChild(fragment);
        this.output.appendChild(container);
    }

    handleCommand(input) {
        const { command } = parseCommand(input);

        if (commands[command]) {
            commands[command](this);
        } else {
            this.printOutput([`Command not found: ${command}`], 'text');
        }
    }

    execCommand(input) {
        const clone = clonePrompt(input);
        this.output.appendChild(clone);
        this.handleCommand(input);
        this.#commandHistory.push({ cmdText: input, caretPosition: this.caretPosition });
        this.#commandHistoryPointer = this.#commandHistory.length;
        this.cmdText = '';
        this.caretPosition = 0;
        clone.scrollIntoView();
    }

    moveCommandHistory(n) {
        const history = this.#commandHistory[this.#commandHistoryPointer + n];
        if (history) {
            const { cmdText, caretPosition } = history;
            this.cmdText = cmdText;
            this.caretPosition = caretPosition;
            this.#commandHistoryPointer += n;
        } else if (this.#commandHistoryPointer + n === this.#commandHistory.length) {
            this.cmdText = '';
            this.caretPosition = 0;
            this.#commandHistoryPointer += n;
        }
    }

    attachListeners() {
        const playPauseBlinkCaret = debounce(() => {
            this.caretAnimation.currentTime = 0;
            this.caretAnimation.pause();
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.caretAnimation.play(), 800);
        }, 100);
        
        const handleKey = (e) => {
            if (MOD_KEYS[MOD_KEYS.indexOf(e.key)] === e.key) {
                return;
            }

            if (e.metaKey || e.ctrlKey) {
                return;
            }
        
            e.preventDefault();
            const key = e.key;
            const isMovementKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key);
        
            if (isMovementKey) {
                this.handleMovement(key);
            } else if (key === 'Backspace' || key === 'Delete') {
                this.handleDeletion(key);
            } else if (key === 'Enter') {
                this.execCommand(this.cmdText);
            } else {
                this.handleTextInput(key);
                playPauseBlinkCaret();
            }
        };
    
        window.addEventListener('keydown', handleKey);
    }    
    
    handleMovement(key) {
        if (key === 'ArrowLeft' && this.caretPosition > 0) {
            this.caretPosition--;
        } else if (key === 'ArrowRight' && this.caretPosition < this.cmdText.length) {
            this.caretPosition++;
        } else if (key === 'ArrowUp') {
            this.moveCommandHistory(-1);
        } else if (key === 'ArrowDown') {
            this.moveCommandHistory(1);
        }
    }

    handleDeletion(key) {
        if (this.cmdText.length > 0) {
            const left = this.cmdText.slice(0, this.caretPosition - 1);
            const right = this.cmdText.slice(this.caretPosition);
            this.cmdText = left + right;
            if (key === 'Backspace') {
                this.caretPosition--;
            }
        }
    }

    handleTextInput(key) {
        const left = this.cmdText.slice(0, this.caretPosition);
        const right = this.cmdText.slice(this.caretPosition);
        this.cmdText = left + key + right;
        this.caretPosition++;
    }
}

customElements.define('cli-app', CLIApplication);
