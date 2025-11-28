
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // optional for form data

const bot_greet =  (req, res) => {
    const user = req.user;
    console.log(user.name);

  
  res
    .status(200)
    .send(
      `Hi ${user.name}! 👋 Welcome to UrbPark . I’m here to help you book a parking slot quickly and easily. How can I assist you today?`
    );
}

const bot_explore =  async(req, res) => {
    const users = await prisma.parkingArea.findMany({
  select: { city: true }
});

// Convert objects → array of only email strings
const cityList = users.map(u => u.city);

// Remove duplicates using Set
const uniquecity = [...new Set(cityList)];

console.log(uniquecity);
  res
    .status(200)
    .json({
      reply:"Great choice! 🌆 Here are the available parking locations you can explore. Each place includes details like total slots, nearby landmarks, and availability to help you choose the perfect spot. Just select a location to see more information or book a slot instantly!",
      city:uniquecity
});
  //parking area cities will be suggested here
};

// const bot_explore_area = (req, res) => {
//     console.log("/explore/area api called");
//      const body = req.body;
//      console.log(body);
    
//   //city name varum, then we need to suggests parking areas of chennai here
//   res.status(200).send(`${body.place} has 20 parking areas`);
 
// };

const bot_book =  (req, res) => {
  // const body = req.body;
  // console.log(body);
  // if (body.area && body.area == "Tambaram") {
  //   res.status(200).send("Booked Tambaram slot successfully");
  // } else if (body.area && body.area == "Chrompet") {
  //   res.status(200).send("Booked Chrompet slot Successfully");
  // } else {
    res.status(404).send("Please mention area");
  // }
}


module.exports = {bot_greet,bot_explore, bot_book};