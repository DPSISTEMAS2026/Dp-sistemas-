const fs = require('fs');

const files = ['automatizacion.html', 'chatbots.html', 'sistemas-verticales.html', 'index.html'];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    
    // Regex que busca la apertura <a href="mailto: ... > precediendo a un </button> dentro del mismo bloque
    const brokenRegex = /<a href="mailto:[^>]*>([\s\S]*?)<\/button>/g;

    let count = 0;
    content = content.replace(brokenRegex, (match, inner) => {
        count++;
        // Reemplazamos la etiqueta de cierre errónea por </a>
        return match.replace(/<\/button>/g, '</a>');
    });

    if (count > 0) {
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Corregidos ${count} tags de cierre en ${f}`);
    } else {
        console.log(`Nivel de tags correcto en ${f}`);
    }
});
console.log("Completado.");
