const fs = require('fs');
const path = require('path');

// Directorio raíz del proyecto
const projectRoot = path.resolve(__dirname);

// Archivos de salida
const outputFile = path.join(projectRoot, 'codigo.txt');

// Extensiones válidas para extraer código
const validExtensions = ['.js', '.css', '.html'];

// Función para recorrer el directorio
function extractCode(dir, collectedCode = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursión para subdirectorios
      extractCode(fullPath, collectedCode);
    } else {
      const ext = path.extname(file);
      if (validExtensions.includes(ext)) {
        // Leer y agregar contenido del archivo al array
        const code = fs.readFileSync(fullPath, 'utf8');
        collectedCode.push(`/* === ${fullPath} === */\n${code}\n`);
      }
    }
  });

  return collectedCode;
}

// Recopilamos el código desde el proyecto
const code = extractCode(projectRoot).join('\n');

// Escribir código en el archivo de salida
fs.writeFileSync(outputFile, code, 'utf8');
console.log(`Código extraído con éxito en: ${outputFile}`);
