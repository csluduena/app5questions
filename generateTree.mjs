import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build'];
const IGNORE_FILES = ['.env', '.DS_Store'];

function generateTree(path, prefix = '') {
    let tree = '';
    const items = readdirSync(path);

    items.forEach((item, index) => {
        if (IGNORE_DIRS.includes(item) || IGNORE_FILES.includes(item)) return;

        const isLast = index === items.length - 1;
        const itemPath = join(path, item);
        const isDirectory = statSync(itemPath).isDirectory();

        // Añadir elemento actual
        tree += `${prefix}${isLast ? '└─ ' : '├─ '}${item}\n`;

        // Si es directorio, procesar recursivamente
        if (isDirectory) {
            tree += generateTree(
                itemPath,
                `${prefix}${isLast ? '   ' : '│  '}`
            );
        }
    });

    return tree;
}
try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const projectTree = generateTree(__dirname);
    console.log('Estructura del proyecto:');
    console.log(projectTree);
} catch (error) {
    console.error('Error al generar el árbol:', error);
}