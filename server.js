require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const { isAuthenticated } = require("./middleware/auth");
const sessionMiddleware = require("./config/sessionStore");
const PORT = 3000;
const bot_Router = require("./router/bot_Router");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));
// app.use(sessionMiddleware); 
console.log(process.env.DATABASE_URL);
app.get("/",(req,res)=>{

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log(name);

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashed,
        isGuest: false,
        feedback: false
      }
    });

    return res.status(200).json({
      message: "User registered successfully",
      data: user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post('/login',async(req,res)=>{
  const {email, password} = req.body;

   
   console.log(email);
   //console.log(zoho_visitor_id);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email:email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account does not have a password. Guest login is not supported."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const botToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.SESSION_SECRET, { expiresIn: "1h" });
     const updData = await prisma.user.update({where:{email:email},
        data:{
          botToken:botToken,
         
        }
    })
    res.json({botToken:botToken,message:" login successful"});


})

app.post("/token",async(req,res)=>{
  const body= req.body;
  console.log("/token API called");
  console.log(body);
  console.log(body.email);
  if (!body.email) {
    console.log('email ID is required');
        return res.status(400).json({ message: 'email ID is required' });
    }

    const user = await prisma.user.findUnique({where:{email:body.email}});
    if (!user || !user.botToken) {
        return res.status(404).json({ message: 'Bot key not found or user not linked.' });
    }

    res.json({
      success: true,
      token:user.botToken
    });
})

// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body; // ✔ FIXED
//     console.log(email);
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email }
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!user.password) {
//       return res.status(400).json({
//         message: "This account does not have a password. Guest login is not supported."
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//      const botToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.SESSION_SECRET, { expiresIn: "1h" });
//     // req.session.user = {
//     //   id: user.id,
//     //   name: user.name,
//     //   email: user.email,
//     //   phone: user.phone
//     // };
//     const updData = await prisma.user.update({where:{email:email},
//         data:{
//           botToken:botToken
//         }
//     })


//     return res.status(200).json({
//       message: "Logged in successfully",
//       botToken, 
//       email:user.email,
//       name:user.name
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Login failed" });
//   }
// });

// app.get('/botToken',async(req,res)=>{
//   const data = await prisma.user.fin
// })
app.get('/guest',(req,res)=>{
  const name = "Guest";

  res.status(200).json({name:name});
})
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(isAuthenticated);
app.use("/api", bot_Router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
