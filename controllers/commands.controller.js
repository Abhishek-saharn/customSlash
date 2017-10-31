import request from "request";

import {
  updateWhereabouts,
  getMemberStatus,
  showWhereaboutCodes,
  updateTodaysStatus
} from "../utils/controllerHelper";
import {
  displayMessage,
  postMessage,
  postMessageError
} from "../utils/misc";

import Teams from "../models/Teams";
import Users from "../models/Users";

/**
 *  "index.html" contains a button that will let users authorize / commands. After clicking button
 *  an auth page will be shown to user, that will redirect to route "/slack" this same route is
 *  also provided in slack app "Oauth" url .
 */

export let gtoken = null;

export const indexButton = (req, res) => {
  res.sendFile(`${process.env.PWD}/ui/index.html`);
};

export const slashHome = (req, res) => {
  res.status(200).end();

  if (req.body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("ACCESS FORBIDDEN");
  } else {
    const text = (req.body.text).toLowerCase();
    const textArr = text.trim().split(" ");

    const teamId = req.body.team_id;
    const userId = req.body.user_id;


    if (gtoken === null || gtoken === undefined) {
      Teams.find(teamId).then(accessToken => {
        gtoken = accessToken;
        console.log("GOT THE TOKEN ", teamId, accessToken);
      }).catch(error => {
        console.log("HERE WE GOT THE ERROR WHILE GETTING ACCESS TOKEN", error);
      });
    }
    if (textArr.length === 1) {
      getMemberStatus(userId, teamId, textArr, req.body.channel_id, req.body.response_url);
    } else {
      switch (textArr[0]) {
      case "whereabouts":

        if (/^[0-9]+$/.test(textArr[1])) {
          updateWhereabouts(userId, teamId, textArr[1], req.body.channel_id, req.body.response_url);
        } else if (textArr[1] === "codes") {
          showWhereaboutCodes(userId, teamId, req.body.channel_id, req.body.response_url);
        }

        break;
      case "update":
        if (textArr[1] === "status" && /^[1-6]$/.test(textArr[2])) {
          updateTodaysStatus(userId, teamId, textArr[2], req.body.channel_id, req.body.response_url);
        }
        break;
      default:
        postMessageError(gtoken, req.body.channel_id);
        break;
      }
    }
  }
};

export const slackAuth = (req, res) => {
  /**
   * access denied. This will check whether its first time or not,
   * if 1st time. Then redirect to /index.
   */
  if (!req.query.code) {
    res.redirect("/index");
    return;
  }
  /**
   *   If authenticated by user, HTTP request will be having a 'code' as query that can be stored.
   *   And the stored data will be exchanged with a token.
   */
  let data = {
    form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code
    }
  };
  /**
   *  Below data is POSTed to the oauth.access and a token is then stored.
   */
  request.post("https://slack.com/api/oauth.access", data, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // Get an auth token
      const token = JSON.parse(body).access_token;

      /**
       * Get All the users and add them to Db.
       */
      let users = [];
      request.post("https://slack.com/api/users.list", {
        form: {
          token: token
        }
      }, (err, responseUserList, bodyUserList) => {
        const bodyJson = JSON.parse(bodyUserList);


        const members = bodyJson.members;

        members.forEach((user) => {
          if (user.is_bot === true) return;


          let userData = {
            user_id: user.id,
            user_team_id: user.team_id,
            name: user.name,
            email: user.profile.email,
            tz: user.tz,
            is_bot: user.is_bot,
            is_admin: user.is_admin
          };
          users.push(userData);
        });

        Users.insertManyUsers(users).then().catch();
      });


      // Get the team domain name to redirect to the team URL after auth
      request.post("https://slack.com/api/team.info", {
        form: {
          token: token
        }
      }, (errorTeamInfo, responseTeamInfo, bodyTeamInfo) => {
        if (!errorTeamInfo && responseTeamInfo.statusCode === 200) {
          if (JSON.parse(bodyTeamInfo).error === "missing_scope") {
            // res.send("Bot added");
          } else {
            const teamId = JSON.parse(bodyTeamInfo).team.id;
            const team = JSON.parse(bodyTeamInfo).team.domain;

            const Teamdata = {
              team_id: teamId,
              team_domain: team,
              token: token
            };

            Teams.insert(Teamdata)
              .then((insertedData) => {
                console.log("THIS DATA IS INSERTED", insertedData);
              })
              .catch((insertError) => {
                console.log("HERE WE GOT ERROR WHILE INSERTING TEAMDATA ", insertError);
              });


            res.redirect("http://" + team + ".slack.com");
          }
        }
      });
    }
  });
};

/**
 * approvedAction is not still required as it is just used for lerning Button functonality.
 * */

export const approvedAction = (req, res) => {
  res.status(200).end();


  const payloadjson = JSON.parse(req.body.payload);

  if (payloadjson.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("ACCESS FORBIDDEN");
  } else {
    let attachmentsS = {
      fallback: "Have you aprooved?",
      title: "Thankyou for responding",
      text: `You have just responded with a ${payloadjson.actions[0].value}`,
      callback_id: payloadjson.callback_id,
      color: "#3AA3E3",
      attachment_type: "default",
      replace_original: true

    };


    displayMessage(payloadjson.response_url, attachmentsS);
  }
};

export const geoLocation = (req, res) => {
  res.sendFile(`${process.env.PWD}/ui/geolocation.html`);
};
