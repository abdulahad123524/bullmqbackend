const moongose = require("mongoose");

const connectDB = async () => {
  try {
    await moongose.connect(process.env.MONGO_URI);
    console.log("MOngo DB successfully");
  } catch (error) {
    console.log("Mongo DB connection error", error);
    process.exit(1);
  }
};
module.exports = connectDB;
