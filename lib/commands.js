import { fakeFiles, aboutMe, projects } from '../resources/about.js';

const randomQuotes = [
    "Nice try!",
    "Close, but no cigar.",
    "Almost there!",
    "Better luck next time!",
    "You almost had it!",
    "Good effort!",
    "Nice one, but not quite.",
    "Keep going, you're getting there!",
    "So close, yet so far!",
    "Not bad, not bad at all!"
];

export const commands = {
    clear(cliApp) {
        cliApp.clearOutput();
    },
    ls(cliApp) {
        cliApp.printOutput(fakeFiles);
    },
    about(cliApp) {
        cliApp.printOutput(aboutMe);
    },
    projects(cliApp) {
        cliApp.printOutput(projects, 'link');
    },
    cat(cliApp) {
        const randomQuote = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
        cliApp.printOutput([randomQuote]);
    }
};

export const quickCommands = ['about', 'projects', 'clear'];
