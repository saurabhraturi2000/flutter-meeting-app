require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { MONGO_DB_CONFIG } = require("./config/app.config");
const http = require("http");
const server = http.createServer(app);
const { initMeetingServer } = require("./meeting-server");

initMeetingServer(server);

mongoose.promise = global.Promise;
mongoose
  .connect(MONGO_DB_CONFIG.DB, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB: ", err);
  });

app.use(express.json());
app.use("/api", require("./routes/app.routes"));

server.listen(process.env.PORT, function () {
  console.log("Server is running");
});
