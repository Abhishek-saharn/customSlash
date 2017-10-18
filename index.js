import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";

import router from "./routes/main.routes";
import config from "./config/config";
const app = express();

mongoose.connect(config.database, (error) => {
  if (error) {
    console.log("Is mongo running");
    throw error;
  } else {
    console.log("Mongo Running");
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
const pathC = path.join(__dirname, "/public");
app.use(express.static(pathC));


app.use(router);

app.listen(process.env.PORT || 8000, () => {
  console.log("server Listening at", process.env.PORT || 8000);
});
