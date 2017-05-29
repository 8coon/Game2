'use strict';

const fs = require('fs');
const express = require('express');

const path = `${__dirname}/node_modules/jsworks/dist/`;
const testsPath = `${__dirname}/spec`;
const app = express();


app.use('/', express.static(`${__dirname}/dist/out`));
app.use('/static', express.static(`${__dirname}/static`));
app.use('/jsworks', express.static(path));
app.use('/babylonjs', express.static(`${__dirname}/node_modules/babylonjs`));


app.get('/', (req,res) => {
    res.sendFile(__dirname + '/application.html');
});

app.use((req, res, next) => {
    res.sendFile(__dirname + '/application.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Test Application server listening on port ${PORT}!`);
    console.log(`JSWorks is in ${path}`);
});
