const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
require("dotenv").config();

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
app.use("/api/blogs", require("./routes/blogsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));
app.use("/api/driver", require("./routes/driverRoute"));
app.use("/api/orders", require("./routes/ordersRoute"));
app.use("/api/section", require("./routes/frontEndSettingsRoute"));

// Running The Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
