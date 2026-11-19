const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const menuPath = path.join(__dirname, 'public', 'menu.html');

const foods = [
  { id: 1, foodName: 'Margherita Pizza', category: 'Pizza', price: 250, availability: true },
  { id: 2, foodName: 'Paneer Tikka Wrap', category: 'Wraps', price: 180, availability: true },
  { id: 3, foodName: 'Classic Cold Coffee', category: 'Beverages', price: 120, availability: false }
];

const requiredFields = ['id', 'foodName', 'category', 'price', 'availability'];

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(data));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', chunk => {
      body += chunk;
    });

    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', error => {
      reject(error);
    });
  });
}

const server = http.createServer(async (request, response) => {
  const { method, url } = request;

  // GET /
  if (method === 'GET' && url === '/') {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    response.end(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Gather &amp; Grain</title>
        </head>
        <body>
          <h1>Welcome to Gather &amp; Grain</h1>
          <p>Good food, made easy.</p>
          <a href="/menu">View the menu</a>
        </body>
      </html>
    `);
    return;
  }

  // GET /foods: show only available items
  if (method === 'GET' && url === '/foods') {
    const availableFoods = foods.filter(food => food.availability);
    sendJson(response, 200, availableFoods);
    return;
  }

  // GET /about
  if (method === 'GET' && url === '/about') {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    response.end('<h1>About Gather &amp; Grain</h1><p>A neighborhood kitchen serving fresh favorites.</p>');
    return;
  }

  // GET /menu: read the HTML file using fs
  if (method === 'GET' && url === '/menu') {
    fs.readFile(menuPath, 'utf8', (error, content) => {
      if (error) {
        response.writeHead(500, {
          'Content-Type': 'text/plain; charset=utf-8'
        });
        response.end('Unable to load the menu right now.');
        return;
      }

      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      response.end(content);
    });
    return;
  }

  // POST /add-food
  if (method === 'POST' && url === '/add-food') {
    try {
      const food = await readJsonBody(request);

      if (!food || typeof food !== 'object' || Array.isArray(food)) {
        sendJson(response, 400, { error: 'Request body must be a JSON object.' });
        return;
      }

      const missingFields = requiredFields.filter(field =>
        food[field] === undefined || food[field] === null || food[field] === ''
      );

      if (missingFields.length > 0) {
        sendJson(response, 400, {
          error: 'Missing required fields.',
          fields: missingFields
        });
        return;
      }

      const id = Number(food.id);
      const price = Number(food.price);

      if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(price) || price <= 0) {
        sendJson(response, 400, {
          error: 'id and price must be positive numbers.'
        });
        return;
      }

      if (typeof food.availability !== 'boolean') {
        sendJson(response, 400, {
          error: 'availability must be true or false.'
        });
        return;
      }

      if (foods.some(item => item.id === id)) {
        sendJson(response, 400, {
          error: 'A food item with this id already exists.'
        });
        return;
      }

      const newFood = {
        ...food,
        id,
        price
      };

      foods.push(newFood);

      sendJson(response, 201, {
        message: 'Food item added successfully',
        food: newFood
      });
    } catch (error) {
      sendJson(response, 400, {
        error: 'Request body must contain valid JSON.'
      });
    }
    return;
  }

  // Any other method or URL
  sendJson(response, 404, { error: 'Route not found.' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});