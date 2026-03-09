
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'src', 'services', 'polzaModels.ts');
let content = fs.readFileSync(filePath, 'utf-8');

const mapping = {
    thinking: 'Модель с рассуждениями для задач высокой сложности.',
    advanced: 'Продвинутая модель для больших запросов и ответов.',
    fast: 'Быстрая модель для простых и частых задач.'
};

const regex = /{ id: '([^']+)', name: '([^']+)', category: '([^']+)', subCategory: '([^']+)', desc: '[^']+'/g;

content = content.replace(regex, (match, id, name, category, subCategory) => {
    const newDesc = mapping[subCategory] || 'Модель для различных задач.';
    return `{ id: '${id}', name: '${name}', category: '${category}', subCategory: '${subCategory}', desc: '${newDesc}'`;
});

fs.writeFileSync(filePath, content);
console.log('Descriptions updated successfully.');
