class CanvasManager {
    constructor() {
        this.canvas = document.querySelector('#content');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }
}

class TextRenderer {
    constructor(canvas, ctx, fillColor = '#00FF00') {
        this.canvas = canvas;
        this.ctx = ctx;
        this.padding = 20;
        this.lineSpacing = 10;
        this.fontSize = 32;
        this.fontFamily = 'Apple2TerminalFont';
        this.fillColor = fillColor;
        this.scrollOffset = 0;
        this.maxLines = Math.floor((canvas.height - this.padding * 2) / (this.fontSize + this.lineSpacing));
    }

    async loadFont() {
        try {
            await document.fonts.load(`${this.fontSize}px ${this.fontFamily}`);
            this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        } catch (error) {
            console.error('Font failed to load:', error);
        }
    }

    drawText(textArray) {
        const maxWidth = this.canvas.width - this.padding * 2;
        let yPosition = this.padding + this.fontSize - this.scrollOffset;
    
        this.ctx.fillStyle = this.fillColor;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        let totalHeight = 0;
    
        textArray.forEach(text => {
            const words = text.split(' ');
            let currentLine = '';
    
            words.forEach(word => {
                const testLine = currentLine + word + ' ';
                const testWidth = this.ctx.measureText(testLine).width;
    
                if (testWidth > maxWidth) {
                    if (yPosition >= this.padding) {
                        this.ctx.fillText(currentLine, this.padding, yPosition);
                    }
                    currentLine = word + ' ';
                    yPosition += this.lineSpacing + this.fontSize;
                    totalHeight += this.lineSpacing + this.fontSize;
                } else {
                    currentLine = testLine;
                }
            });
    
            if (yPosition >= this.padding) {
                this.ctx.fillText(currentLine, this.padding, yPosition);
            }
            yPosition += this.lineSpacing + this.fontSize;
            totalHeight += this.lineSpacing + this.fontSize;
        });
    
        totalHeight += this.padding;
        const visibleHeight = this.canvas.height - this.padding * 2;
    
        const maxScroll = Math.max(totalHeight - visibleHeight, 0);
        if (totalHeight > visibleHeight) {
            this.scrollOffset = maxScroll;
        } else {
            this.scrollOffset = 0;
        }
    }    
}

class WebGLEffects {
    constructor() {
        this.setupCanvas();
        this.initGL();
        this.createShaders();
        this.setupBuffers();
        this.setupBlending();
        this.animate();
    }

    setupCanvas() {
        this.overlay = document.getElementById('overlay');
        this.gl = this.overlay.getContext('webgl', { alpha: true });
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.body.appendChild(this.overlay);
    }

    resize() {
        this.overlay.width = window.innerWidth;
        this.overlay.height = window.innerHeight;
        this.gl.viewport(0, 0, this.overlay.width, this.overlay.height);
    }

    initGL() {
        this.vertexShaderSource = `
            attribute vec2 position;
            varying vec2 uv;
            void main() {
                uv = position * 0.5 + 0.8;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        this.fragmentShaderSource = `
            precision highp float;
            varying vec2 uv;
            uniform float time;
            
            void main() {
                float scanline = sin(uv.y * 100.0) * 0.1;
                vec3 color = vec3(0.0, 1.0, 0.0);
                vec2 cuv = uv * 2.0 - 1.0;
                float vignette = 1.0 - dot(cuv, cuv) * 0.3;
                float flicker = sin(time * 50.0) * 0.03;
                vec3 final = color * (vignette + scanline + flicker);
                gl_FragColor = vec4(final, 0.5);
            }
        `;
    }

    createShaders() {
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader, this.vertexShaderSource);
        this.gl.compileShader(vertexShader);

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader, this.fragmentShaderSource);
        this.gl.compileShader(fragmentShader);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
    }

    setupBuffers() {
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.timeLocation = this.gl.getUniformLocation(this.program, 'time');
    }

    setupBlending() {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    render(time) {
        this.gl.uniform1f(this.timeLocation, time * 0.001);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(t => this.render(t));
    }

    animate() {
        requestAnimationFrame(t => this.render(t));
    }
}

class TerminalPrompt {
    constructor(canvas, ctx, textRenderer) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.textRenderer = textRenderer;
        this.prompt = '>';
        this.currentInput = '';
        this.caretVisible = true;
        this.caretBlinkRate = 530;
        this.startCaretAnimation();
        this.setupInputHandling();
        this.commandMap = this.initializeCommands();
        this.textContent = [];
    }

    initializeCommands() {
        const projects = [
            { id: 'fastn', text: 'fastn - an easy-to-learn open-source programming language written in Rust.', link: 'https://fastn.com' },
            { id: 'rayql', text: 'RayQL - A schema definition and query language for SQLite.', link: 'https://rayql.com' },
            { id: 'shuru', text: 'Shuru - A task runner and version manager for Node.js and Python, written in Rust.', link: 'https://shuru.run' },
            { id: 'bottlecap', text: 'Bottlecap.js - A 2D Game Framework written in Javascript', link: 'https://bottlecap.js.org' },
            { id: 'squareroot', text: 'Squareroot - A Short Video Platform for Math Enthusiasts.', link: 'https://sqrroot.web.app' },
            { id: 'pixelgrid', text: 'PixelGrid - Pixel Art Editor', link: 'https://pixel-grid-app.surge.sh' },
        ];
    
        return {
            projects: () => {
                const header = "Available projects (use 'open <PROJECT_ID>' to open a project):";
                const projectList = projects.map(project => `- ${project.id}: ${project.text}\n  [${project.link}]`);
                return [header, ...projectList];
            },            
            open: (id) => {
                const project = projects.find(p => p.id === id);
                if (project) {
                    window.open(project.link, '_blank');
                    return `Opening project "${id}" in a new window...`;
                }
                return `Project with ID "${id}" not found. Use 'projects' to see available IDs.`;
            },
            fullscreen: () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.error(`Error attempting fullscreen: ${err.message}`);
                        return "Failed to enter fullscreen.";
                    });
                    return "Entering fullscreen mode...";
                } else {
                    document.exitFullscreen().catch(err => {
                        console.error(`Error exiting fullscreen: ${err.message}`);
                        return "Failed to exit fullscreen.";
                    });
                    return "Exiting fullscreen mode...";
                }
            },
            ls: () => {
                return 'Nothing.';
            },
            clear: () => {
                this.textContent = [];
                this.textRenderer.drawText([]);
                return '';
            },
            help: () => {
                return `Available commands: projects, open <PROJECT_ID>, fullscreen, ls, clear, help`;
            }
        };
    }    

    async executeCommand(input) {
        if (!input.length) {
            this.currentInput = '';
            this.textContent.push(this.prompt);
            await this.redraw();
            return;
        }
    
        const [command, ...args] = input.split(' ');
        if (this.commandMap[command]) {
            try {
                const result = await this.commandMap[command](...args);
                if (result && result.length) {
                    this.textContent.push(this.prompt + ' ' + input);
    
                    if (Array.isArray(result)) {
                        result.forEach(line => this.textContent.push(line));
                    } else {
                        this.textContent.push(result);
                    }
                }
            } catch (error) {
                this.textContent.push(`Error executing command: ${error.message}`);
            }
        } else {
            this.textContent.push(this.prompt + ' ' + input);
            this.textContent.push(`Unknown command: ${command}. Type "help" for available commands.`);
        }
        this.currentInput = '';
        await this.redraw();
    }    

    startCaretAnimation() {
        setInterval(async () => {
            this.caretVisible = !this.caretVisible;
            await this.redraw();
        }, this.caretBlinkRate);
    }

    async setupInputHandling() {
        document.addEventListener('keydown', async (e) => {
            if (e.key.length === 1) {
                this.currentInput += e.key.toUpperCase();
                await this.redraw();
            } else if (e.key === 'Backspace') {
                this.currentInput = this.currentInput.slice(0, -1);
                await this.redraw();
            } else if (e.key === 'Enter') {
                const command = this.currentInput.trim().toLowerCase();
                this.executeCommand(command);
            }
        });
    }

    async redraw() {
        await this.textRenderer.loadFont();
        const displayText = this.prompt + ' ' + this.currentInput + (this.caretVisible ? '█' : ' ');
        this.textRenderer.drawText([...this.textContent, displayText]);
    }
}

class TerminalApp {
    constructor() {
        this.canvasManager = new CanvasManager();
        this.textRenderer = new TextRenderer(this.canvasManager.canvas, this.canvasManager.ctx);
        this.effects = new WebGLEffects();
        
        this.textContent = [
            "Welcome, Human.",
            "Boot successful. You are now in Harsh Singh's Portfolio ][.",
            "A 21-year-old software developer from India, compiling life one line at a time.",
            "",
            "Find him on GitHub at https://github.com/harshdoesdev.",
            "",
            "Type 'projects' to see the list of systems I've contributed to.",
            ""
        ];

        this.init();
    }

    async init() {
        this.prompt = new TerminalPrompt(
            this.canvasManager.canvas, 
            this.canvasManager.ctx,
            this.textRenderer
        );
        this.prompt.textContent = this.textContent;
        this.prompt.redraw();
        window.addEventListener('resize', () => this.prompt.redraw());
    }
}

const app = new TerminalApp();
