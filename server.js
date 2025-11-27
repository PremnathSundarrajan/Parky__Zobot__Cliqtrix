require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1);

const bcrypt = require("bcrypt");
const { isAuthenticated } = require("./middleware/auth");
const sessionMiddleware = require("./config/sessionStore");
const PORT = 3000;
const bot_Router = require("./router/bot_Router");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


app.use(express.json());
app.use(sessionMiddleware); 
console.log(process.env.DATABASE_URL);
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



app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; // ✔ FIXED

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
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

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    return res.status(200).json({
      message: "Logged in successfully",
      session: req.session.user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});


app.get('/guest',(req,res)=>{
  const name = "Guest";

  res.status(200).json({name:name});
})
app.use("/api", isAuthenticated, bot_Router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
