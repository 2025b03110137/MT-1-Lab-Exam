const http = require("http");
const fs = require("fs");
const path = require("path");

const foods = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Pasta", category: "Italian", price: 180, availability: true },
  { id: 3, foodName: "Salad", category: "Healthy", price: 120, availability: false }
];

const server = http.createServer((req, res) => {
  // Add your route checks here.
});

server.listen(3000, () => {
  console.log("HTTP Server running at http://localhost:3000");
});