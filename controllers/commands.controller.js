import controllerHelper from "./controllerHelper.js";
import responseHelper from "../utils/responseHelper";
import slackAuthHelpers from "../utils/slackAuthHelper";
import Teams from "../models/Teams";
const commandsControllers = {
  /**
   *  "index.html" contains a button that will let users authorize / commands. After clicking button
   *  an auth page will be shown to user, that will redirect to route "/slack" this same route is
   *  also provided in slack app "Oauth" url .
   * {*Object} req
   *  {*Object} res
   */
  indexButton(req, res) {
    res.sendFile(`${process.env.PWD}/public/ui/index.html`);
  },
  /**
   *
   * {*Object} res
   */
  slashHome(req, res) {
    res.status(200).end();

    const text = (req.body.text).toLowerCase();
    const textArr = text.trim().split(" ");

    const teamId = req.body.team_id;
    const userId = req.body.user_id;
    const channelId = req.body.channel_id;
    const responseUrl = req.body.response_url;
    const accessToken = req.access_token;

    const reqData = {
      userId: userId,
      teamId: teamId,
      accessToken: accessToken,
      channelId: channelId,
      responseUrl: responseUrl,
      textArr: textArr
    };
    if (textArr.length === 1 && textArr[0].charAt(0) === "@") {
      controllerHelper.getMemberStatus(reqData)
        .then(statusDataToPass => {
          responseHelper.displayMessage(responseUrl, statusDataToPass);
        })
        .catch(statusDataToPassError => {
          console.log("Here we got error in getting status of user: ", statusDataToPassError);
          responseHelper.postMessageError(accessToken, userId, channelId, statusDataToPassError);
        });
    } else {
      switch (textArr[0]) {
      case "whereabouts":

        if (/^[0-9]+$/.test(textArr[1]) && textArr.length === 2) {
          controllerHelper.updateWhereabouts(reqData)
            .then((message) => {
              responseHelper.displayMessage(responseUrl, message);
            })
            .catch((updateWhereaboutsError => {
              console.log("GOT ERROR WHILE DISPLAYING", updateWhereaboutsError);
              responseHelper.postMessageError(access_token, user_id, channelId);
            }));
        } else if (textArr[1] === "codes" && textArr.length === 2) {
          controllerHelper.showWhereaboutCodes(reqData)
            .then((message) => {
              responseHelper.displayMessage(responseUrl, message);
            })
            .catch();
        } else {
          responseHelper.postMessageError(accessToken, userId, channelId);
        }

        break;
      case "update":
        if (textArr[1] === "status" && /^[1-6]$/.test(textArr[2]) && textArr.length === 3) {
          controllerHelper.updateTodaysStatus(reqData)
            .then(updateToday => {
              responseHelper.postMessage("", accessToken, "#general", updateToday.chchannelAttachment);
              responseHelper.displayMessage(responseUrl, updateToday.personalMessage);
            })
            .catch(updateTodayError => {
              responseHelper.postMessageError(accessToken, userId, channelId, updateTodayError);
            });
        } else {
          responseHelper.postMessageError(accessToken, userId, channelId);
        }
        break;
      case "stats":
        if(textArr.length === 4) {
          controllerHelper.getUserStats(reqData)
            .then(message => {
              responseHelper.displayMessage(responseUrl, message);
            })
            .catch((statsErrorMessage)=>{
              responseHelper.postMessageError(accessToken, userId, channelId, statsErrorMessage);
            });
        } else {
          responseHelper.postMessageError(accessToken, userId, channelId);
        }
        break;
      case "help":
        if (textArr.length === 1) {
          controllerHelper.getHelp()
            .then(helpData => {
              responseHelper.postEphemeralMessage(helpData.str, accessToken, userId, channelId, helpData.att);
            })
            .catch();
        }else {
          responseHelper.postMessageError(accessToken, userId, channelId);
        }
        break;
      default:
        responseHelper.postMessageError(reqData);
        break;
      }
    }
  },
  slackAuth(req, res) {
    /**
     * access denied. This will check whether its first time or not,
     * if 1st time. Then redirect to /index.
     */
    if (!req.query.code) {
      res.redirect("/index");
      return;
    }
    /*
     *  Below data is POSTed to the oauth.access and a token is then stored.
     */
    slackAuthHelpers.oauthAccess(req.query.code)
      .then(redirectLink => {
        res.redirect(redirectLink);
      })
      .catch(oauthAccessError => {
        console.log("ERROR GOT IN oauthAccessError>>>>", oauthAccessError);
      });
  },
  /**
   * approvedAction is required as it is used for menu functonality.
   * */
  approvedAction(req, res) {
    res.status(200).end();

    const payloadjson = JSON.parse(req.body.payload);
    const accessToken = req.access_token;
    let attachmentsS = [{
      fallback: "Have you aprooved?",
      title: "",
      text: `${payloadjson.actions[0].selected_options[0].value}`,
      callback_id: payloadjson.callback_id,
      color: "#3AA3E3",
      mrkdwn_in: ["text"],
      attachment_type: "default",
      replace_original: true

    }];

    const channelId = payloadjson.channel.id;
    responseHelper.postEphemeralMessage("", accessToken, payloadjson.user.id, channelId, attachmentsS);
  },

  geoLocation(req, res) {
    res.sendFile(`${process.env.PWD}/public/ui/geolocation.html`);
  },

  authUser(req, res, next) {
    if (req.body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
      res.status(403).end("ACCESS FORBIDDEN");
    } else {
      const teamId = req.body.team_id;
      Teams.find(teamId).then(accessToken => {
        req.access_token = accessToken;
        next();
      }).catch(error => {
        console.log("HERE WE GOT THE ERROR WHILE GETTING ACCESS TOKEN authUser", error);
      });
    }
  },

  authMenu(req, res, next) {
    const payloadjson = JSON.parse(req.body.payload);
    if (payloadjson.token !== process.env.SLACK_VERIFICATION_TOKEN) {
      res.status(403).end("ACCESS FORBIDDEN");
    } else {
      const teamId = payloadjson.team.id;
      Teams.find(teamId).then(accessToken => {
        req.access_token = accessToken;
        next();
      }).catch(error => {
        console.log("HERE WE GOT THE ERROR WHILE GETTING ACCESS TOKEN authMenu", error);
      });
    }
  }
};
export default commandsControllers;
