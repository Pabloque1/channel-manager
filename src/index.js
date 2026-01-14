const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Channel Manager funcionando 🚀");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor activo en puerto " + PORT);
});
