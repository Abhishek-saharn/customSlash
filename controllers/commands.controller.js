import workstatus from "../api/workStatus";
import attachmentsURLs from "../api/attachmentsURLs";
import workCodes from "../api/workCodes";
import request from "request";

import {
  displayMessage
} from "../utils/misc";

import Teams from "../models/Teams";


/**
 *  "index.html" contains a button that will let users authorize / commands. After clicking button
 *  an auth page will be shown to user, that will redirect to route "/slack" this same route is
 *  also provided in slack app "Oauth" url .
 */

let gtoken = null;

export const indexButton = (req, res) => {
  res.sendFile(`${process.env.PWD}/ui/index.html`);
};

export const slashHome = (req, res) => {
  res.status(200).end();

  if (req.body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("ACCESS FORBIDDEN");
  } else {
    const text = req.body.text;
    const teamId = req.body.team_id;

    let allMembers;

    // Teams.findAll()
    //   .then(all => {
    //     allMembers = all;
    //     console.log(":::::::::::::::::::::::::", allMembers);
    //   })
    //   .catch(error => {
    //     console.log(":::::::::::::::::::::::::>>><<<", error);
    //   });


    // const teamDomain = req.body.team_domain;
    if (gtoken === null) {
      Teams.find(teamId).then(accessToken => {
        gtoken = accessToken;
      }).catch(error => {
        console.log(error);
      });
    }

    if (/^\d+$/.test(text)) {
      res.send("You are Enterning number. Which is under development phase");
      return;
    }
    let status = workstatus[text];
    let data = {
      response_type: "in_channel", // public to the channel
      text: `${text} is ${status}`,
      attachments: [{

        image_url: `${attachmentsURLs[status]}`
      },
      {
        fallback: "Have you aprooved?",
        title: "Have you aprooved?",
        callback_id: "123xyz",
        color: "#3AA3E3",
        attachment_type: "default",
        actions: [{
          name: "yes",
          text: "Yes",
          type: "button",
          value: "yes"
        },
        {
          name: "no",
          text: "No",
          type: "button",
          value: "no"
        }
        ]
      }
      ]
    };
    displayMessage(req.body.response_url, data);
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
            name: user.profile.real_name ||
              (user.profile.first_name + user.profile.last_name) ||
              user.profile.display_name,
            email: user.profile.email,
            tz: user.tz,
            is_bot: user.is_bot,
            is_admin: user.is_admin
          };
          console.log("DDATATA TTOO BBEE PUUSSHHEEDD ", userData);
          users.push(userData);
        });
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
              token: token,
              members: users
            };

            Teams.insert(Teamdata)
              .then((insertedData) => {
                console.log(insertedData);
              })
              .catch((insertError) => {
                console.log(insertError);
              });


            res.redirect("http://" + team + ".slack.com");
          }
        }
      });
    }
  });
};

export const approvedAction = (req, res) => {
  res.status(200).end();


  const payloadjson = JSON.parse(req.body.payload);


  if (payloadjson.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("ACCESS FORBIDDEN");
  } else {
    console.log("GGOOOOOTTTT THE TOKEN", gtoken);
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
  console.log("AA gya main yaha pe ", `${process.env.PWD}/ui/geolocation.html`);
  res.sendFile(`${process.env.PWD}/ui/geolocation.html`);
};