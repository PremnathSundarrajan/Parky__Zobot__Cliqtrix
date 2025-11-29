const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // optional for form data

const bot_greet = (req, res) => {
  const user = req.user;
  console.log(user.name);

  res
    .status(200)
    .send(
      `Hi ${user.name}! 👋 Welcome to UrbPark . I’m here to help you book a parking slot quickly and easily. How can I assist you today?`
    );
};

const bot_explore = async (req, res) => {
  const users = await prisma.parkingArea.findMany({
    select: { city: true },
  });

  // Convert objects → array of only email strings
  const cityList = users.map((u) => u.city);

  // Remove duplicates using Set
  const uniquecity = [...new Set(cityList)];

  console.log(uniquecity);
  res.status(200).json({
    reply:
      "Great choice! 🌆 Here are the available parking locations you can explore. Each place includes details like total slots, nearby landmarks, and availability to help you choose the perfect spot. Just select a location to see more information or book a slot instantly!",
    city: uniquecity,
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

const bot_book = async(req, res) => {
  const {area} = req.query;
  const user = req.user;
  const user_det = await prisma.user.findUnique({where:{id:user.id}});
  const area_det = await prisma.parkingArea.findUnique({where:{name:area}});
  const slot_det = await prisma.parkingSlot.findMany({where:{parkingId:area_det.id, isAvailable:true},select:{id:true}});
  const id_slot = slot_det.map((u)=> u.id);
  const id = id_slot[0];
  const get_slot = await prisma.parkingSlot.findUnique({where:{id:id}});
  if(!slot_det){
    res.status(200).json({reply:"All slots are currently full 😕 Please check again in a few minutes — a spot may open soon!"});
  }
  else{
    const book = await prisma.booking.create({data:{userId:user.id,slotId:id,startTime:"2025-11-29 00:00:00", endTime:"2025-11-29 00:00:00", phone:user_det.phone, paymentStatus:"Pending",amount:0.0, createdAt:new Date(), updatedAt: new Date()}});
    if(book){
      res.status(200).json({reply:`Booked a slot number ${get_slot.slotNumber} in ${area} successfully`});
    }else{
      res.status(500).json({reply:"Unable to book"});    
    }
  }
  
  
};

module.exports = { bot_greet, bot_explore, bot_book };
