const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// Static Folder
app.use(express.static(path.join(__dirname, "images")));
// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Connection To DB
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected To Data Base"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/driver", require("./routes/driverRoute"));
app.use("/api/orders", require("./routes/ordersRoute"));
app.use("/api/order-pay-receipt", require("./routes/orderPayReceiptRoute"));
app.use("/api/notifications", require("./routes/notificationsRoute"));
app.use("/api/vehicles", require("./routes/searchVehiclesRoute"));
app.use("/api/footer", require("./routes/footerRoute"));
app.use("/api/hero", require("./routes/heroRoute"));
app.use("/api/commission", require("./routes/commissionRoute"));
app.use("/api/term", require("./routes/termRoute"));

app.get('/', (req, res) => {
  return res.send('StackDeans');
})
// Running The Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
