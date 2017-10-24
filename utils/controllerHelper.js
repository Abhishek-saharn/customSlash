import moment from "moment";
import workCodes from "../api/workCodes";
import Users from "../models/Users";
import {
  displayMessage
} from "../utils/misc";

export function updateWhereabouts(userId, codeString, response_url) {
  const codeArr = codeString.split("");
  const mom = moment();
  const weekWhereabouts = [];


  codeArr.forEach((code) => {
    const d = new Date(mom);
    d.setHours(0, 0, 0, 0);
    const dayObj = {
      date: d,
      status: workCodes[code]
    };
    mom.add(1, "days");
    console.log("THIS IS TODAY>>>>>>>>><<<<<<<<<<<<", dayObj);
    weekWhereabouts.push(dayObj);
  });


  Users.updateWhereabouts(userId, weekWhereabouts)
    .then((data) => {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let str = "Your next weeks whereabouts have been logged as follows:\n";
      weekWhereabouts.forEach((weekWhereabout) => {
        str = `${str} *${days[weekWhereabout.date.getDay()]}* ${moment(weekWhereabout.date).format("MMM Do YY")} - *${weekWhereabout.status}*\n`;
      });

      const message = {
        response_type: "in_channel",
        text: str
      };
      displayMessage(response_url, message);
    })
    .catch((err) => (console.log("GOT ERROR WHILE DISPLAYING", err)));
}

export function getMemberStatus(userId, textArr, response_url) {
  if (/^\d+$/.test(textArr[0])) {
    res.send("You put a Wrong entry.");
    return;
  }
  let status;
  let today = new Date(moment().format());
  today.setHours(0, 0, 0, 0);
  console.log(textArr);
  Users.findStatus(textArr[0]).then(data => {
    data.forEach(d => {
      d.work_status.forEach((s) => {
        if (s.date.getTime() === today.getTime()) {
          status = s.status;
        }
      });
      let dataToPass = {
        response_type: "in_channel", // public to the channel
        text: `${textArr[0]} is ${status}`
      };

      displayMessage(response_url, dataToPass);
    });
  }).catch(() => {});
}