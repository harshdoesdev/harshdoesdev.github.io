export const getCharWidth = () => {
    const tempNode = document.createElement('span');

    tempNode.textContent = 'A';

    tempNode.style.cssText = `
        postition: absolute;
        top: -9999px;
        left: -9999px;
        width: min-content;
        font-family: monospace;
    `;

    document.body.appendChild(tempNode);

    const charWidth = tempNode.getBoundingClientRect().width;

    tempNode.remove();

    return charWidth;
};