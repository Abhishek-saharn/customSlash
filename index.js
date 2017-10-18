import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";

import router from "./routes/main.routes";
import config from "./config/config";
import Teams from "./models/Teams";
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
export let allMembers;

app.use(router);

// app.use((req, res, next) => {
//   Teams.findAll()
//     .then(all => {
//       allMembers = all;
//       console.log(":::::::::::::::::::::::::", allMembers);
//       next();
//     })
//     .catch(error => {
//       console.log(":::::::::::::::::::::::::>>><<<");
//       next(error);
//     });
// });

app.use(function (req, res, next) {
  Teams.findAll().then(all => {
    console.log(":::::::::<<<<<<>>>>>>>>>", all);
    next();
  }).catch(err => {
    if (err) return next(err);
  });
});


const pathC = path.join(__dirname, "/public");
app.use(express.static(pathC));

app.listen(process.env.PORT || 8000, () => {
  console.log("server Listening at", process.env.PORT || 8000);
});
