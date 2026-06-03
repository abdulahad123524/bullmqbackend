const express = require("express");
const cors = require("cors");
const { jsonBodyLimit, maxBulkProducts } = require("./config/limits");

const app = express();
app.use(cors());
app.use(express.json({ limit: jsonBodyLimit }));

app.use("/api/products", require("./routes/product.route"));

app.use((err, _req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: `Request body too large. Max size is ${jsonBodyLimit}. Upload at most ${maxBulkProducts} products per file, or split into smaller files.`,
      limit: jsonBodyLimit,
      maxProducts: maxBulkProducts,
    });
  }
  next(err);
});

module.exports = app;
