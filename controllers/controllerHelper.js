import moment from "moment";
import workCodes from "../api/workCodes";
import Users from "../models/Users";
import WorkStatus from "../models/WorkStatus";
import helpCommands from "../api/helpCommands";

import StatusTimeMachine from "../models/StatusTimeMachine";
import responseHelper from "../utils/responseHelper";
const controllerHelper = {

  /**
   * getMemberStatus will help in fetching member's status( on site, offsite, off) from database.
   */
  getMemberStatus(reqData) {
    const {
      accessToken,
      userId,
      teamId,
      channelId,
      responseUrl,
      textArr
    } = reqData;
    if (/^\d+$/.test(reqData.textArr[0])) {
      postMessageError(accessToken, userId, channelId);
      return;
    }
    const correctedText = textArr[0].substring(1);

    let status;
    /**
     * To get Status of a member, userid of that user will be required.
     * This can be fetched from database once we get a entered username.
     * Here userId fetched by username and to get the status of present date
     * we can compare a date between previous and next date.
     */
    const dayBefore = moment().subtract(1, "days").hour(23).minute(59);
    const dayAfter = moment().add(1, "days").hour(0).minute(0);
    Users.findUser(correctedText, teamId).then(user => {
      WorkStatus.findStatus(user.user_id, user.user_team_id, dayBefore, dayAfter)
        .then(dataStatus => {
          status = dataStatus.status;
          let dataToPass = {
            // response_type: "in_channel", // public to the channel
            text: `*<@${correctedText}>* is *${status}*`
          };
          responseHelper.displayMessage(responseUrl, dataToPass);
        }).catch((findStatusError) => {
          console.log("HERE WE GOT ERROR IN findStatus>>", findStatusError);
          responseHelper.postMessageError(accessToken, userId, channelId);
        });
    }).catch(findUserError => {
      console.log("HERE WE GOT AN ERROR IN findUser>> ", findUserError);
      responseHelper.postMessageError(accessToken, userId, channelId);
    });
  },
  /**
   * This will help mempers to update their weekly status.
   */
  updateWhereabouts(reqData) {
    const {
      accessToken,
      userId,
      teamId,
      channelId,
      responseUrl,
      textArr
    } = reqData;
    const codeArr = textArr[1].split("");
    const momentObj = moment();
    const weekWhereabouts = [];


    codeArr.forEach((code) => {
      const d = new Date(momentObj);
      const dayObj = {
        user_id: userId,
        user_team_id: teamId,
        date: d,
        status: workCodes[code]
      };
      momentObj.add(1, "days");
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
        responseHelper.displayMessage(responseUrl, message);

        StatusTimeMachine.insertwb(weekWhereabouts)
          .then()
          .catch(stmError => {
            console.log("HERE WE GOT ERROR IN STATETIMEMACHINE", stmError);
          });
      })
      .catch((err) => (console.log("GOT ERROR WHILE DISPLAYING", err)));
  },
  /**
   * showWhereaboutCodes will show the codes that can be used in updating whereabout codes.
   */
  showWhereaboutCodes(reqData) {
    const {
      accessToken,
      userId,
      teamId,
      channelId,
      responseUrl,
      textArr
    } = reqData;
    let str = "Follow codes below:";
    Object.keys(workCodes).forEach(key => {
      str = `${str}\n${key} - ${workCodes[key]}`;
    });

    const message = {
      text: str
    };

    // responseHelper.postMessage(str, accessToken, channelId);
    responseHelper.displayMessage(responseUrl, message);
  },

  updateTodaysStatus(reqData) {
    const {
      accessToken,
      userId,
      teamId,
      channelId,
      responseUrl,
      textArr
    } = reqData;
    const code = textArr[2];
    const today = new Date(moment().format());
    // today.setHours(0, 0, 0, 0);
    const dayBefore = moment().subtract(1, "days").hour(23).minute(59);
    const dayAfter = moment().add(1, "days").hour(0).minute(0);

    const newStatus = workCodes[code];
    WorkStatus.updateTodaysStatus(userId, teamId, today, newStatus, dayBefore, dayAfter)
      .then(data => {
        if (data.nModified === 1) {
          const str = `<@${userId}> changed status to ${newStatus}`;
          const att = [{
            text: str,
            color: "good"
          }];
          responseHelper.postMessage("", accessToken, "#general", att);
          let message = {
            text: `Your status is updated to ${newStatus}`
          };
          responseHelper.displayMessage(responseUrl, message);

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
        responseHelper.postMessageError(accessToken, userId, channelId);
      });
  },
  /**
   * This function will fetch Stats of a person within specified date.
   */
  getUserStats(reqData) {
    const {
      accessToken,
      userId,
      teamId,
      channelId,
      responseUrl,
      textArr
    } = reqData;
    const correctedTargetUsername = textArr[1].substring(1);
    // /pinpoint stats @Abhishek 11/1/2017 11/3/2017
    if (!moment(textArr[2], "MM-DD-YYYY").isValid() || !moment(textArr[3], "MM-DD-YYYY").isValid()) {
      const errorMessage = "Date must be in \"MM/DD/YYYY\"";
      responseHelper.postMessageError(accessToken, userId, channelId, errorMessage);
      return;
    }
    const startDate = moment(textArr[2], "MM-DD-YYYY").hour(0).minute(0).second(0);
    const endDate = moment(textArr[3], "MM-DD-YYYY").hour(23).minute(59).second(59);
    console.log(startDate, endDate);
    let total = 0;
    Users.findUser(correctedTargetUsername, teamId).then(data => {
      const targetUserId = data.user_id;
      const targetTeamId = data.user_team_id;

      WorkStatus.getUserStats(targetUserId, targetTeamId, startDate, endDate)
        .then(statsdata => {
          let str = `Stats of <@${targetUserId}> till now:`;
          Object.keys(statsdata).forEach(key => {
            total += statsdata[key].count;
          });
          Object.keys(statsdata).forEach(key => {
            const count = statsdata[key].count;
            const countPer = Math.ceil((count / total) * 100);
            str = `${str}\n*${count}* days or ${countPer}% on *${statsdata[key]._id}* `;
          });
          const message = {
            text: str
          };
          responseHelper.displayMessage(responseUrl, message);
        })
        .catch(error => {
          console.log("HERE WE GOT ERROR IN GET STATS:>>", error);
          responseHelper.postMessageError(accessToken, userId, channelId);
        });
    }).catch(findUserError => {
      console.log("HERE WE GOT AN ERROR IN findUser>> ", findUserError);
      responseHelper.postMessageError(accessToken, userId, channelId);
    });
  },

  getHelp(reqData) {
    const {
      accessToken,
      userId,
      teamId,
      channelId,
      responseUrl,
      textArr
    } = reqData;
    let str = "Following are the commands available:";
    const att = [{
      fallback: "Upgrade your Slack client to use messages like these.",
      color: "3AA3E3",
      attachment_type: "default",
      callback_id: "select_remote_commands",
      actions: [{
        name: "command_list",
        text: "For which command you want help?",
        type: "select",
        options: helpCommands.options
      }]
    }];
    responseHelper.postEphemeralMessage(str, userId, accessToken, channelId, att);
  }
};
export default controllerHelper;
