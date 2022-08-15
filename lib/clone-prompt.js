export const clonePrompt = text => {
    const prompt = document.createElement('div');
    const user = document.createElement('div');
    const promptInput = document.createElement('div');
    const cmdClone = document.createElement('div');

    prompt.className = 'prompt flex gap-half-rem align-center';

    user.className = 'user';

    promptInput.className = 'promptInput';

    cmdClone.className = 'cmd';

    prompt.append(user, promptInput);

    user.textContent = 'portfolio@harsh:~$';

    promptInput.appendChild(cmdClone);

    cmdClone.textContent = text;

    return prompt;
};