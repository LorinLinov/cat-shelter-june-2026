import http from 'http';
import fs from 'fs/promises';
import cats from './catsArr.js';
import { URLSearchParams } from 'url';
import { v4 } from 'uuid';
import breeds from './breeds.js';


const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        let formData = '';
        req.on('data', chunk => {
            formData += chunk.toString();
        });

        req.on('end', () => {
            const breedData = new URLSearchParams(formData);
            const breedName = breedData.get('breed');
            breeds.push({ id: v4(), name: breedName });
        });

        return res.writeHead(302, { 'Location': '/' }).end();
    }

    if (req.method === 'POST' && req.url === '/cats/add-cat') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const catData = new URLSearchParams(body);
            const catName = catData.get('name');
            const catImageUrl = catData.get('upload');
            const catDescription = catData.get('description');
            const catBreed = catData.get('breed');
            cats.push({ id: v4(), imageUrl: catImageUrl, name: catName, description: catDescription, breed: catBreed });
        });
        return res.writeHead(302, { 'Location': '/' }).end();
    }

    if (req.method === "POST" && req.url.startsWith('/cats/edit-cat/')) {
        const catId = req.url.split('/').pop();
        const catIndex = cats.findIndex(c => c.id === catId);
        let body = '';

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {

            const catData = new URLSearchParams(body);
            const catName = catData.get('name');
            const catImageUrl = catData.get('upload');
            const catDescription = catData.get('description');
            const catBreed = catData.get('breed');

            if (catIndex !== -1) {
                cats[catIndex] = { id: catId, imageUrl: catImageUrl, name: catName, description: catDescription, breed: catBreed };
            }

            res.writeHead(302, { 'Location': '/' });
            res.end();
        });

        return;
    }

    if (req.method === "POST" && req.url.startsWith('/cats/delete-cat/')) {
        const catId = req.url.split('/').pop();
        const catIndex = cats.findIndex(c => c.id === catId);

        if (catIndex !== -1) {
            cats.splice(catIndex, 1);
            res.writeHead(302, { 'Location': '/' });
            res.end();
            return;
        }
    }

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
                        <li class="btn edit"><a href="/cats/edit-cat/${cat.id}">Change Info</a></li>
                        <li class="btn delete"><a href="/cats/delete-cat/${cat.id}">New Home</a></li>
                    </ul>
                </li>`).join('\n'));
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('src/views/addBreed.html', 'utf-8');
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await fs.readFile('src/views/addCat.html', 'utf-8');
        const breedOptions = breeds.map(breed => `<option value="${breed.name}">${breed.name}</option>`).join('\n');
        htmlContent = htmlContent.replace('{{breeds}}', breedOptions);
    } else if (req.url.startsWith('/cats/edit-cat/')) {
        const catId = req.url.split('/').pop();
        const cat = cats.find(c => c.id === catId);

        if (cat) {
            htmlContent = await fs.readFile('src/views/editCat.html', 'utf-8');
            htmlContent = htmlContent.replace('{{catId}}', cat.id);
            htmlContent = htmlContent.replaceAll("{{catName}}", cat.name);
            htmlContent = htmlContent.replace('{{catDescription}}', cat.description);
            htmlContent = htmlContent.replace('{{catImageUrl}}', cat.imageUrl);
            htmlContent = htmlContent.replace('{{breeds}}', breeds.map(breed => breed.name === cat.breed ? `<option value="${breed.name}" selected>${breed.name}</option>` : `<option value="${breed.name}">${breed.name}</option>`).join('\n'));
        } else {
            res.writeHead(404);
            res.end();
            return;
        }
    } else if (req.url.startsWith('/cats/delete-cat/')) {
        const catId = req.url.split('/').pop();
        const cat = cats.find(c => c.id === catId);
        htmlContent = await fs.readFile('src/views/catShelter.html', 'utf-8');

        htmlContent = htmlContent.replaceAll('{{catId}}', catId)
            .replaceAll('{{catName}}', cat.name)
            .replaceAll('{{catDescription}}', cat.description)
            .replaceAll('{{catImageUrl}}', cat.imageUrl)
            .replaceAll('{{catBreed}}', cat.breed);
    } else if (req.url.startsWith('/search')) {
        const searchText = req.url.split('?')[1].split('=')[1];
        const searchCats = cats.filter(cat => cat.name.toLowerCase().includes(searchText.toLowerCase()));

        htmlContent = await fs.readFile('src/views/home/index.html', 'utf-8');
        htmlContent = htmlContent.replace('{{cats}}', searchCats.map(cat => `<li>
                    <img src="${cat.imageUrl}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    ${cat.price ? `<p><span>Price: </span>${cat.price}</p>` : ''}
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                        <li class="btn edit"><a href="/cats/edit-cat/${cat.id}">Change Info</a></li>
                        <li class="btn delete"><a href="/cats/delete-cat/${cat.id}">New Home</a></li>
                    </ul>
                </li>`).join('\n'));
    } else {
        htmlContent = await fs.readFile('src/views/404.html', 'utf-8');
    }

    res.write(htmlContent);
    res.end();
}).listen(5000, () => {
    console.log('Server running at http://localhost:5000/');
});