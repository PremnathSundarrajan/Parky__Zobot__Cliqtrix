

const bot_greet =  (req, res) => {
  
  
  res
    .status(200)
    .send(
      `Hi  there! 👋 Welcome to UrbPark . I’m here to help you book a parking slot quickly and easily. How can I assist you today?`
    );
}

const bot_explore =  (req, res) => {
  res
    .status(200)
    .send(
      "Great choice! 🌆 Here are the available parking locations you can explore. Each place includes details like total slots, nearby landmarks, and availability to help you choose the perfect spot. Just select a location to see more information or book a slot instantly!"
    );
  //parking area cities will be suggested here
};

const bot_explore_area = (req, res) => {
    console.log("/explore/area api called");
     const body = req.body;
     console.log(body);
    
  //city name varum, then we need to suggests parking areas of chennai here
  res.status(200).send(`${body.place} has 20 parking areas`);
 
};

const bot_book =  (req, res) => {
  const body = req.body;
  console.log(body);
  if (body.area && body.area == "Tambaram") {
    res.status(200).send("Booked Tambaram slot successfully");
  } else if (body.area && body.area == "Chrompet") {
    res.status(200).send("Booked Chrompet slot Successfully");
  } else {
    res.status(404).send("Please mention area");
  }
}


module.exports = {bot_greet,bot_explore, bot_explore_area, bot_book};