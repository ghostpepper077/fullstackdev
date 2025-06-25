const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());

// CORS setup
app.use(cors({ origin: process.env.CLIENT_URL }));

// Firebase Admin
// const admin = require("firebase-admin");
// const serviceAccount = require("./firebaseServiceAccountKey.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the learning space.");
});

const userRoute = require('./routes/user');
app.use("/user", userRoute);

const authRoutes = require('./routes/auth');
app.use("/api/auth", authRoutes);

// DB Sync
const db = require('./models');
db.sequelize.sync({ alter: true }).then(() => {
  const port = process.env.APP_PORT || 5000;
  app.listen(port, () => {
    console.log(`⚡ Server running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error(err);
});
