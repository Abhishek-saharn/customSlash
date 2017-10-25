import moment from "moment";
import workCodes from "../api/workCodes";
import Users from "../models/Users";
import {
  displayMessage,
  postMessage,
  postMessageError
} from "../utils/misc";
import {
  gtoken
} from "../controllers/commands.controller";

/**
 * getMemberStatus will help in fetching member's status( on site, offsite, off) from database.
 */
export function getMemberStatus(userId, textArr, channelId, responseUrl) {
  if (/^\d+$/.test(textArr[0])) {
    res.send("You put a Wrong entry.");
    return;
  }
  let status;
  let todayMoment = moment();
  console.log(textArr);
  Users.findStatus(textArr[0]).then(data => {
    if (data !== null) {
      data.forEach(d => {
        d.work_status.forEach((s) => {
          if (todayMoment.isSame(moment(s.date), "Date")) {
            console.log("MATTTCCHCHHHHEEEDDDD");
            status = s.status;
          }
        });
        let dataToPass = {
          // response_type: "in_channel", // public to the channel
          text: `*${textArr[0]}* is *${status}*`
        };

        displayMessage(responseUrl, dataToPass);
      });
    } else {
      postMessageError(gtoken, channelId);
    }
  }).catch((err) => {
    console.log("HERE WE GOT ERROR IN GETTING MEMBERS STATUS >>", err);
    postMessageError(gtoken, channelId);
  });
}

/**
 * This will help mempers to update their weekly status.
 */

export function updateWhereabouts(userId, codeString, channelId, responseUrl) {
  const codeArr = codeString.split("");
  const mom = moment();
  const weekWhereabouts = [];


  codeArr.forEach((code) => {
    const d = new Date(mom);
    // d.setHours(0, 0, 0, 0);
    const dayObj = {
      date: d,
      status: workCodes[code]
    };
    mom.add(1, "days");
    weekWhereabouts.push(dayObj);
  });

  Users.updateWhereabouts(userId, weekWhereabouts)
    .then(() => {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let str = "Your next weeks whereabouts have been logged as follows:\n";
      weekWhereabouts.forEach((weekWhereabout) => {
        const epochTime = Math.floor(weekWhereabout.date.getTime() / 1000);
        str = `${str} *${days[weekWhereabout.date.getDay()]}* <!date^${epochTime}^{date}|${moment(weekWhereabout.date).format("MMM Do YY")}> - *${weekWhereabout.status}*\n`;
      });

      const message = {
        text: str
      };
      displayMessage(responseUrl, message);
    })
    .catch((err) => (console.log("GOT ERROR WHILE DISPLAYING", err)));
}

/**
 * showWhereaboutCodes will show the codes that can be used in updating whereabout codes.
 */
export function showWhereaboutCodes(userId, channelId, responseUrl) {
  let str = "Follow codes below:";
  Object.keys(workCodes).forEach(key => {
    str = `${str}\n${key} - ${workCodes[key]}`;
  });
  postMessage(str, gtoken, channelId);
  // displayMessage(responseUrl, message);
}

export function updateTodaysStatus(userId, code, channelId, responseUrl) {
  const today = new Date(moment().format());
  today.setHours(0, 0, 0, 0);
  const newStatus = workCodes[code];
  Users.updateTodaysStatus(userId, today, newStatus)
    .then(data => {

      if (data.nModified === 1) {
        const str = `<@${userId}> changed status to ${newStatus}`;
        const att = [{
          text: str,
          color: "good"
        }];
        postMessage("", gtoken, "#general", att);
        let message = {
          // response_type: "in_channel", // public to the channel
          text: `Your status is updated to ${newStatus}`
        };
        displayMessage(responseUrl, message);
      }
    }).catch(err => {
      console.log("|||||||||||||", err);
      postMessageError(gtoken, channelId);
    });
}