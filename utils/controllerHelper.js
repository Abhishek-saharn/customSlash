import moment from "moment";
import workCodes from "../api/workCodes";
import Users from "../models/Users";
import WorkStatus from "../models/WorkStatus";
import StatusTimeMachine from "../models/StatusTimeMachine";
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
export function getMemberStatus(userId, teamId, textArr, channelId, responseUrl) {
  if (/^\d+$/.test(textArr[0])) {
    postMessageError(gtoken, channelId);
    return;
  }
  const correctedText = textArr[0].substring(1);

  let status;
  console.log(textArr);
/**
 * To get Status of a member, userid of that user will be required.
 * This can be fetched from database once we get a entered username.
 * Here userId fetched by username and to get the status of present date
 * we can compare a date between previous and next date.
 */

  Users.findUser(correctedText, teamId).then(data => {
    const dayBefore = moment().subtract(1, "days").hour(23).minute(59);
    const datyAfter = moment().add(1, "days").hour(0).minute(0);

    console.log("THESE ARE<<<<DDAATTAA>>>>> BEFORE AND AFTER DATES ", data.user_team_id, dayBefore, datyAfter);
    WorkStatus.findStatus(data.user_id, data.user_team_id, dayBefore, datyAfter).then(dataStatus => {
      status = dataStatus.status;
      let dataToPass = {
        // response_type: "in_channel", // public to the channel
        text: `*<@${correctedText}>* is *${status}*`
      };
      displayMessage(responseUrl, dataToPass);
    }).catch((findStatusError) => {
      console.log("HERE WE GOT ERROR IN findStatus>>", findStatusError);
      postMessageError(gtoken, channelId);
    });
  }).catch(findUserError => {
    console.log("HERE WE GOT AN ERROR IN findUser>> ", findUserError);
    postMessageError(gtoken, channelId);
  });
}

/**
 * This will help mempers to update their weekly status.
 */

export function updateWhereabouts(userId, teamId, codeString, channelId, responseUrl) {
  const codeArr = codeString.split("");
  const mom = moment();
  const weekWhereabouts = [];


  codeArr.forEach((code) => {
    const d = new Date(mom);
    const dayObj = {
      user_id: userId,
      user_team_id: teamId,
      date: d,
      status: workCodes[code]
    };
    mom.add(1, "days");
    weekWhereabouts.push(dayObj);
  });
  WorkStatus.updateWhereabouts(userId, teamId, weekWhereabouts)
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

      StatusTimeMachine.insertwb(weekWhereabouts)
        .then()
        .catch(stmError => {
          console.log("HERE WE GOT ERROR IN STATETIMEMACHINE", stmError);
        });
    })
    .catch((err) => (console.log("GOT ERROR WHILE DISPLAYING", err)));
}

/**
 * showWhereaboutCodes will show the codes that can be used in updating whereabout codes.
 */
export function showWhereaboutCodes(userId, teamId, channelId, responseUrl) {
  let str = "Follow codes below:";
  Object.keys(workCodes).forEach(key => {
    str = `${str}\n${key} - ${workCodes[key]}`;
  });

  const message = {
    text: str
  };

  // postMessage(str, gtoken, channelId);
  displayMessage(responseUrl, message);
}

export function updateTodaysStatus(userId, teamId, code, channelId, responseUrl) {
  const today = new Date(moment().format());
  // today.setHours(0, 0, 0, 0);
  const dayBefore = moment().subtract(1, "days").hour(23).minute(59);
  const datyAfter = moment().add(1, "days").hour(0).minute(0);

  const newStatus = workCodes[code];
  WorkStatus.updateTodaysStatus(userId, teamId, today, newStatus, dayBefore, datyAfter)
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

        const wabt = {
          user_id: userId,
          user_team_id: teamId,
          date: today,
          status: newStatus
        };

        StatusTimeMachine.insertwb([wabt])
          .then()
          .catch((error) => {
            console.log("EERROR WHILE INSERT WABT>>>>", error);
          });
      }
    }).catch(err => {
      console.log("HERE WE FOUND ERROR IN UPDATETODAYSSTATUS WHILE UPDATING>>", err);
      postMessageError(gtoken, channelId);
    });
}
