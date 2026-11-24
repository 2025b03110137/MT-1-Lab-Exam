const express = require("express");
const app = express();

app.use(express.json());

const foods = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Pasta", category: "Italian", price: 180, availability: true },
  { id: 3, foodName: "Salad", category: "Healthy", price: 120, availability: false }
];

// Add your routes here.

app.listen(4000, () => {
  console.log("Express Server running at http://localhost:4000");
});