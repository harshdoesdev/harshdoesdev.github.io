const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October',	'November', 'December'
];

const getMonth = d => months[d.getMonth()];

export const formatDate = date => 
    `${getMonth(date)} ${date.getDate()} ${date.getFullYear()}`;