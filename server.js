const express = require("express");
const app = express();
const PORT = 3000;
const bot_Router = require("./router/bot_Router");

app.use(express.json());

app.use("/api", bot_Router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
