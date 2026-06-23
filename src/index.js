import http from 'http';
import fs from 'fs/promises';
import cats from './catsArr.js';
import { URLSearchParams } from 'url';
import { v4 } from 'uuid';
import breeds from './breeds.js';


const server = http.createServer(async (req, res) => {
    if(req.method === 'POST' && req.url === '/cats/add-breed') {
        let formData = '';
        req.on('data', chunk => {
            formData += chunk.toString();
        });

        req.on('end', () => {
            const breedData = new URLSearchParams(formData);
            const breedName = breedData.get('breed');
            breeds.push({ id: v4(), name: breedName });
        });
    }

    // if(req.method === 'POST' && req.url === '/cats/add-cat') {
    //     let formData = '';
    //     req.on('data', chunk => {
    //         formData += chunk.toString();
    //     });

    //     req.on('end', () => {
    //         const catData = new URLSearchParams(formData);
    //         const catName = catData.get('name');
    //         const catDescription = catData.get('description');
    //         const catBreed = catData.get('breed');
    //         cats.push({ id: (cats.length + 1).toString(), name: catName, description: catDescription, breed: catBreed });
    //     });
    // }
    if (req.url === '/styles/site.css') {
        const style = await fs.readFile('src/styles/site.css', 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(style);
        res.end();
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });

    let htmlContent = '';

    if (req.url === '/') {
        htmlContent = await fs.readFile('src/views/home/index.html', 'utf-8');

        htmlContent = htmlContent.replace('{{cats}}', cats.map(cat => `<li>
                    <img src="${cat.imageUrl}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    ${cat.price ? `<p><span>Price: </span>${cat.price}</p>` : ''}
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                        <li class="btn edit"><a href="">Change Info</a></li>
                        <li class="btn delete"><a href="">New Home</a></li>
                    </ul>
                </li>`).join('\n'));
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('src/views/addBreed.html', 'utf-8');
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await fs.readFile('src/views/addCat.html', 'utf-8');
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('src/views/addBreed.html', 'utf-8');
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await fs.readFile('src/views/addCat.html', 'utf-8');
    }else{
        htmlContent = await fs.readFile('src/views/404.html', 'utf-8');
    }

    res.write(htmlContent);
    res.end();
}).listen(5000, () => {
    console.log('Server running at http://localhost:5000/');
});