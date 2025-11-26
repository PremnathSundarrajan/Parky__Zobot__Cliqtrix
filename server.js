const express = require("express");
const app = express();
const PORT = 3000;
const bot_Router = require("./router/bot_Router");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
app.use(express.json());

app.post("/signup",async(req,res)=>{
  const body = req.body;

  const data =await prisma.user.create({data:body});

  console.log(data);

  res.status(200).json({data:data, message : "User added sucessfully"});
})

app.post("/login",async(req,res)=>{
  const body = req.body;
  const data = await prisma.user.findUnique({where:{email:body.email, password:body.password}});
  if(data){
    res.status(200).json({data:data, message : "User signed-in sucessfully"});
  }else{
    res.status(404).json({ message : "User not found"});
  }
})

app.use("/api", bot_Router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
