export const parseCommand = v => {
    const [command, ...args] = v.trim().split(/\s+/);

    return { command, args };
};