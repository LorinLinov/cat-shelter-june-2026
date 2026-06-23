import http from 'http';
import fs from 'fs/promises';

const server = http.createServer(async (req, res) => {
    console.log(req.url);
    console.log(res.url);
    if (req.url === '/styles/site.css') {
        const style = await fs.readFile('src/styles/site.css', 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(style);
        res.end();
        return;
    }

    const homePage = await fs.readFile('src/views/home/index.html', 'utf-8');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(homePage);

    res.end()
}).listen(5000, () => {
    console.log('Server running at http://localhost:5000/');
});