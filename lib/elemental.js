const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
    "`": "&grave;"
};

const htmlEscapeReg = /[&<>"'`/]/ig;

export const sanitize = str => str.replace(htmlEscapeReg, match => htmlEscapeMap[match]);

export const style = (strings, ...values) => {

    const stylesheet = new CSSStyleSheet;

    stylesheet.replaceSync(
        values.reduce((css, value, index) => css + value + strings[index + 1], strings[0])
    );

    return stylesheet;

};

export const template = (strings, ...values) => {

    const tmpl = document.createElement('template');

    tmpl.innerHTML = values.reduce(

        (html, value, index) => html + sanitize(value) + strings[index + 1], 
        
        strings[0]
    
    );

    return tmpl;

};