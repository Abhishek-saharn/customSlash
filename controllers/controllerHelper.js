import moment from "moment";
import workCodes from "../api/workCodes";
import helpCommands from "../api/helpCommands";

import responseHelper from "../utils/responseHelper";

import Users from "../models/Users";
import WorkStatus from "../models/WorkStatus";
import StatusTimeMachine from "../models/StatusTimeMachine";

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
      return reject("");
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
    return new Promise((resolve, reject) => {
      Users.findUser(correctedText, teamId)
        .then(user => {
          return WorkStatus.findStatus(user.user_id, user.user_team_id, dayBefore, dayAfter);
        })
        .then(dataStatus => {
          status = dataStatus.status;
          let dataToPass = {
            text: `*<@${correctedText}>* is *${status}*`
          };
          return resolve(dataToPass);
        }).catch(findUserError => {
          let message;
          if (findUserError.TypeError === "Cannot read property 'user_id' of null") {
            message = "User doest not exist!\nTry `/pinpoint help`.";
          }
          return reject(message);
        });
    });
  },
  /**
   * @param {*Object} reqData -req
   */
  updateWhereabouts(reqData) {
    const {
      userId,
      teamId,
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
    return new Promise((resolve, reject) => {
      WorkStatus.updateWhereabouts(userId, teamId, weekWhereabouts)
        .then(() => {
          return StatusTimeMachine.insertwb(weekWhereabouts);
        })
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
          return resolve(message);
        })
        .catch((updateWhereaboutsError) => {
          console.log("GOT ERROR WHILE DISPLAYING", updateWhereaboutsError);
          return reject(updateWhereaboutsError);
        });
    });
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

    return new Promise((resolve, reject) => {
      let str = "Follow codes below:";
      Object.keys(workCodes).forEach(key => {
        str = `${str}\n${key} - ${workCodes[key]}`;
      });

      const message = {
        text: str
      };
      // responseHelper.postMessage(str, accessToken, channelId);
      return resolve(message);
    });
  },

  updateTodaysStatus(reqData) {
    const {
      userId,
      teamId,
      textArr
    } = reqData;
    const code = textArr[2];
    const today = new Date(moment().format());
    // today.setHours(0, 0, 0, 0);
    const dayBefore = moment().subtract(1, "days").hour(23).minute(59);
    const dayAfter = moment().add(1, "days").hour(0).minute(0);

    const newStatus = workCodes[code];
    return new Promise((resolve, reject) => {
      WorkStatus.updateTodaysStatus(userId, teamId, today, newStatus, dayBefore, dayAfter)
        .then(data => {
          if (data.nModified === 1) {
            const str = `<@${userId}> changed status to ${newStatus}`;
            const att = [{
              text: str,
              color: "good"
            }];
            let message = {
              text: `Your status is updated to ${newStatus}`
            };
            const wabt = {
              user_id: userId,
              user_team_id: teamId,
              date: today,
              status: newStatus
            };
            StatusTimeMachine.insertwb([wabt])
              .then(() => {
                const responseData = {
                  channelAttachment: att,
                  personalMessage: message
                };
                return resolve(responseData);
              })
              .catch(timeMachineError => {
                console.log("Error OCCUR AT UPDATING TIME MACHINE ERROR ", timeMachineError);
                const tmError = "Error! Try again later.";
                return reject(tmError);
              });
          } else {
            const str = "Error! May be you are updating same status again.";
            return reject(str);
          }
        })
        .catch(err => {
          console.log("HERE WE FOUND ERROR IN UPDATETODAYSSTATUS WHILE UPDATING>>", err);
          const str = "Error! Status not updated. Please Try again.";
          return reject(str);
        });
    });
  },
  /**
   * This function will fetch Stats of a person within specified date.
   */
  getUserStats(reqData) {
    const {
      teamId,
      textArr
    } = reqData;
    const correctedTargetUsername = textArr[1].substring(1);
    // /pinpoint stats @Abhishek 11/1/2017 11/3/2017
    return new Promise((resolve, reject) => {
      if (!moment(textArr[2], "MM-DD-YYYY").isValid() || !moment(textArr[3], "MM-DD-YYYY").isValid()) {
        const errorMessage = "Date must be in \"MM/DD/YYYY\"";
        return reject(errorMessage);
      }
      const startDate = moment(textArr[2], "MM-DD-YYYY").hour(0).minute(0).second(0);
      const startEpoch = Math.floor(startDate.valueOf() / 1000);
      const endDate = moment(textArr[3], "MM-DD-YYYY").hour(23).minute(59).second(59);
      const endEpoch = Math.floor(endDate.valueOf() / 1000);
      console.log(startEpoch, endEpoch);
      let total = 0;

      Users.findUser(correctedTargetUsername, teamId)
        .then(data => {
          const targetUserId = data.user_id;
          const targetTeamId = data.user_team_id;

          WorkStatus.getUserStats(targetUserId, targetTeamId, startDate, endDate)
            .then(statsdata => {
              let str = `Stats of <@${targetUserId}> from <!date^${startEpoch}^{date}|${startDate.format("MMM Do YY")}> to <!date^${endEpoch}^{date}|${endDate.format("MMM Do YY")}>:`;
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
              return resolve(message);
            })
            .catch(error => {
              console.log("HERE WE GOT ERROR IN GET STATS:>>", error);
              const str = "Something happened while fetching Stats. Please check your command again.";
              return reject(str);
            });
        }).catch(findUserError => {
          let message;
          message = "User doest not exist!\nEnter correct user or try `/pinpoint help`.";
          return reject(message);
        });
    });
  },

  getHelp() {
    return new Promise((resolve, reject) => {
      const helpData = {
        str: "Following are the commands available:",
        att: [{
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
        }]
      };

      return resolve(helpData);
    });
  }
};
export default controllerHelper;