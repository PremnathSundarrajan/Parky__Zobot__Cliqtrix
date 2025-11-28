const express = require("express");
const bot_Router = express.Router();
const {
  bot_greet,
  bot_explore,
  // bot_explore_area,
  bot_book,
} = require("../controller/bot_Controller");

bot_Router.post("/bot", bot_greet);

bot_Router.get("/explore", bot_explore);

// bot_Router.post("/explore/area", bot_explore_area);

bot_Router.get("/explore/area/book", bot_book);

module.exports = bot_Router;
