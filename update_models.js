
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'polzaModels.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const mapping = {
    thinking: 'Модель с рассуждениями для задач высокой сложности.',
    advanced: 'Продвинутая модель для больших запросов и ответов.',
    fast: 'Быстрая модель для простых и частых задач.'
};

// Regex to find and replace desc based on subCategory in the same object
const regex = /{ id: '([^']+)', name: '([^']+)', category: '([^']+)', subCategory: '([^']+)', desc: '[^']+'/g;

content = content.replace(regex, (match, id, name, category, subCategory) => {
    const newDesc = mapping[subCategory] || 'Модель для различных задач.';
    return `{ id: '${id}', name: '${name}', category: '${category}', subCategory: '${subCategory}', desc: '${newDesc}'`;
});

fs.writeFileSync(filePath, content);
console.log('Descriptions updated successfully.');
