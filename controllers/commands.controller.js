import request from "request";

import controllerHelper from "./controllerHelper.js";
import responseHelper from "../utils/responseHelper";

import slackAuthHelpers from "../utils/slackAuthHelper";

import Teams from "../models/Teams";
const commandsControllers = {
  /**
   *  "index.html" contains a button that will let users authorize / commands. After clicking button
   *  an auth page will be shown to user, that will redirect to route "/slack" this same route is
   *  also provided in slack app "Oauth" url .
   * @param {*Object} req
   * @param {*Object} res
   */
  indexButton(req, res) {
    res.sendFile(`${process.env.PWD}/public/ui/index.html`);
  },
  /**
   *
   * @param {*Object} req -req will contain data about command, text, channel, user etc.
   * @param {*Object} res
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
      controllerHelper.getMemberStatus(reqData);
    } else {
      switch (textArr[0]) {
      case "whereabouts":

        if (/^[0-9]+$/.test(textArr[1])) {
          controllerHelper.updateWhereabouts(reqData);
        } else if (textArr[1] === "codes") {
          controllerHelper.showWhereaboutCodes(reqData);
        } else {
          responseHelper.postMessageError(accessToken, userId, channelId);
        }

        break;
      case "update":
        if (textArr[1] === "status" && /^[1-6]$/.test(textArr[2])) {
          controllerHelper.updateTodaysStatus(reqData);
        }
        break;
      case "stats":
        controllerHelper.getUserStats(reqData);
        break;
      case "help":
        controllerHelper.getHelp(reqData);
        break;
      default:
        responseHelper.postMessageError(reqData);
        break;
      }
    }
  },

  /**
   * @param {*Object} req -req will contain payload passed by install app button.
   * @param {*Object} res
   */
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
    console.log(">>>>>>>>>>>>>", payloadjson);
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
    responseHelper.postEphemeralMessage("", payloadjson.user.id, accessToken, channelId, attachmentsS);
    // responseHelper.displayMessage(payloadjson.response_url, attachmentsS);
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
