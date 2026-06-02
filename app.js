const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/products", require("./routes/product.route"));

module.exports = app;
