const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleweare
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Nova Homes Server Site Activate!");
});

app.listen(port, () => {
  console.log("Server is running on port :", port);
});
