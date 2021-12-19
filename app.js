const express = require('express');
const path = require('path');
const api = require('./server/api');

const app = express();

const port = process.env.PORT || 4000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', api);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at ${port}`);
});
