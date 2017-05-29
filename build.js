'use strict';


const fs = require('fs');


const replace = (path) => {
    fs.readdirSync(path).forEach((file) => {
        const fullName = `${path}/${file}`;

        if (fs.statSync(fullName).isDirectory()) {
            replace(fullName);
            return;
        }

        const contents = fs.readFileSync(fullName, 'utf-8')
            .replace('require("../../static/babylon")', '{default: BABYLON}');
        fs.writeFileSync(fullName, contents, 'utf-8');
    });
};


replace('./dist/compiled');