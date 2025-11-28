const express = require("express");
const bot_Router = express.Router();
const {
  bot_greet,
  bot_explore,
  bot_explore_area,
  bot_book,
} = require("../controller/bot_Controller");

bot_Router.get("/bot", bot_greet);

bot_Router.post("/explore", bot_explore);

// bot_Router.post("/explore/area", bot_explore_area);

bot_Router.post("/explore/area/book", bot_book);

module.exports = bot_Router;
