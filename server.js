require("dotenv").config();
const express = require("express");
const app = express();
app.set("trust proxy", 1);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const cors = require('cors')
app.use(cors({
    origin: "https://parky-zobot-cliqtrix.onrender.com",
    credentials: true
}));

const { isAuthenticated } = require("./middleware/auth");
const sessionMiddleware = require("./config/sessionStore");
const PORT = 3000;
const bot_Router = require("./router/bot_Router");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require('path');

app.use("/img", express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.static('public'));
// app.use(sessionMiddleware); 
console.log(process.env.DATABASE_URL);
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
})
app.get("/home",(req,res)=>{
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
      data: user,
      
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
      console.log("Token generated in /login");
 res.cookie("botToken", botToken, {
    httpOnly: true,
    secure: true, 
    sameSite: "Lax",
    maxAge: 3600 * 1000 // 1 hour
});

return res.json({
  message: "Login successful",
  botToken: botToken
});



})

app.get("/token",async(req,res)=>{
  const {email}= req.query;
  console.log("/token API called");

  console.log(email);
  if (!email) {
    console.log('email ID is required');
        return res.status(400).json({ message: 'email ID is required' });
    }

    const user = await prisma.user.findUnique({where:{email:email}});
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
app.get("/api/explore/area",async(req,res)=>{
    const {place} = req.query;
    console.log("/explore/area api called");
    console.log(place);
    const area = await prisma.parkingArea.findMany({
        where: {
    city: place
  },
  select: { name: true }
    })
    const areaList = area.map((u) => u.name);
    const uniquearea = [...new Set(areaList)];
    const total_area = uniquearea.length;

    res.status(200).json({reply:`${place} has ${total_area} parking areas`,area:uniquearea});

});

app.get("/api/explore/area/slot",async(req,res)=>{
  const {area} = req.query;
  const area_det = await prisma.parkingArea.findUnique({where:{name:area}});
  // const availability = await prisma.parkingSlot.findMany({where:{parkingId:area_det.id, isAvailable:true}, select:{slotNumber:true}});
   const availability = await prisma.parkingSlot.findMany({where:{parkingId:area_det.id}, select:{slotNumber:true}});
  const slotList = availability.map((u)=>u.slotNumber);
  const available = slotList.length;
  res.status(200).json({reply : `There are ${area_det.totalSlots} slots in ${area}`});
})

app.get("/api/history",async(req,res)=>{
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ reply: false });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        paymentStatus: true,
        amount: true,
        slot: {
          select: {
            slotNumber: true,
            parkingArea: {
              select: {
                name: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (bookings.length === 0) {
      return res.status(200).json({
        reply: "You don't have any booking history yet."
      });
    }

    // Format nicely for chatbot output
    const historyMessage = bookings.map((b, index) => {
      const start = new Date(b.startTime).toLocaleString();
      const end = new Date(b.endTime).toLocaleString();
      const status = b.paymentStatus ? "Paid" : "Pending";

      return `
${index + 1}) 📍 *${b.slot.parkingArea.name}* - ${b.slot.parkingArea.city}
🅿 Slot: ${b.slot.slotNumber}
🕒 From: ${start}
🕔 To: ${end}
💰 Amount: ₹${b.amount}
💳 Status: ${status}
───────────────────────`;
    }).join("");

    return res.status(200).json({
      reply: `Here is your booking history:\n${historyMessage}`
    });

  } catch (err) {
    console.error("Error fetching booking history:", err);
    return res.status(500).json({
      reply: "Failed to fetch booking history"
    });
  }
})

app.get("/api/feedback",async(req,res)=>{
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ reply: "Not authenticated" });
        }

        // Fetch user to check feedback column
        const feed = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (feed.feedback) {
            return res.status(200).json({ reply: false });
        }

        // If feedback is false, get the latest booking
        const latestBooking = await prisma.booking.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                amount: true,
                slot: {
                    select: {
                        slotNumber: true,
                        parkingArea: {
                            select: { name: true, city: true }
                        }
                    }
                }
            }
        });

        if (!latestBooking) {
            return res.status(200).json({ reply:false });
        }

        // Format a message for user feedback
        const start = new Date(latestBooking.startTime).toLocaleString();
        const end = new Date(latestBooking.endTime).toLocaleString();
        const change = await prisma.user.update({where:{id:feed.id},
          data:{
            feedback:true
          }
        });

        const message = `Hi ${user.name}, we noticed you haven't given feedback yet! 🙏
Your latest booking:
📍 ${latestBooking.slot.parkingArea.name} - ${latestBooking.slot.parkingArea.city}
🅿 Slot: ${latestBooking.slot.slotNumber}
🕒 From: ${start} To: ${end}
💰 Amount: ₹${latestBooking.amount}

Please provide your feedback.`;

        return res.status(200).json({ reply: message });

    } catch (err) {
        console.error("Error fetching feedback info:", err);
        return res.status(500).json({ reply: "Failed to fetch feedback information." });
    }
});

app.use("/api", bot_Router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
