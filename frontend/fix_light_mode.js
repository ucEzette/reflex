const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const original = lines[i];
                let line = original;

                // Keep text-white for buttons or elements with strong backgrounds
                if (!line.match(/bg-(primary|blue-500|red-500|emerald-500|amber-500|green-500|indigo-500|violet-500|zinc-800)/) &&
                    !line.match(/bg-gradient/) &&
                    !line.includes('button')) {
                    line = line.replace(/text-white/g, 'text-foreground');
                    line = line.replace(/text-slate-[23]00/g, 'text-foreground');
                }

                if (line !== original) {
                    lines[i] = line;
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

processDirectory('./src');
console.log("Done");
