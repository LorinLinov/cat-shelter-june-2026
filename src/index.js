import http from 'http';
import fs from 'fs/promises';

const server = http.createServer(async (req, res) => {

    if (req.url === '/styles/site.css') {
        const style = await fs.readFile('src/styles/site.css', 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(style);
        res.end();
        return;
    }

    console.log(req.url);

    res.writeHead(200, { 'Content-Type': 'text/html' });

    let htmlContent = '';
    
    if (req.url === '/') {
        htmlContent = await fs.readFile('src/views/home/index.html', 'utf-8');
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('src/views/addBreed.html', 'utf-8');
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await fs.readFile('src/views/addCat.html', 'utf-8');
    }

    res.write(htmlContent);
    res.end();
}).listen(5000, () => {
    console.log('Server running at http://localhost:5000/');
});