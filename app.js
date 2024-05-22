// app.js
const express = require('express');
const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const driver = neo4j.driver(
  'neo4j://34.232.57.230:7687',
  neo4j.auth.basic('neo4j', 'internship-2024')
);

const session = driver.session();

app.use(express.json());
app.use(express.static('public'));

// Endpoint pentru rețete cu paginare și căutare
app.get('/recipes', async (req, res) => {
  const { page = 1, search = '' } = req.query;
  const limit = 20;
  const skip = (page - 1) * limit;
  const searchQuery = search ? `WHERE r.name CONTAINS $search` : '';

  try {
    const result = await session.run(
      `MATCH (r:Recipe) ${searchQuery}
       RETURN r
       ORDER BY r.name
       SKIP $skip
       LIMIT $limit`,
      { skip: parseInt(skip), limit: parseInt(limit), search }
    );

    const recipes = result.records.map(record => {
      const properties = record.get('r').properties;
      return {
        name: properties.name,
        author: properties.author,
        numIngredients: properties.ingredients ? properties.ingredients.length : 0,
        skillLevel: properties.skillLevel
      };
    });

    res.json(recipes);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Servirea fișierului index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
