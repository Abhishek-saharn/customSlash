// import slackClient from "@slack/client";
import {
  gtoken
} from "./commands.controller";
import Users from "../models/Users";
import request from "request";
import queryString from "query-string";

export const eventHandler = (req, res) => {
  res.status(200).end();
  // const IncomingWebhook = slackClient.IncomingWebhook;
  // const url = process.env.SLACK_WEBHOOK_URL || "";
  // const webhook = new IncomingWebhook(url);
  // webhook.send("Hello there", (err, resx) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("dataSent", resx);
  //   }
  // });
  const bodyJSON = req.body;
  console.log("<<<<<<<<>>>>>>><<<<>>>>", bodyJSON);

  if (bodyJSON.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("Access Forbidden");
  } else {
    // if (bodyJSON.type === "url_verification") {
    //   res.json({
    //     challenge: bodyJSON.challenge

    //   });
    //   res.status(200).end();
    // }
    switch (bodyJSON.type) {
    case "team_join":
    {
      console.log("<<<<>>>>>>", bodyJSON.user);
      const user = bodyJSON.user;
      let userData = {
        user_id: user.id,
        user_team_id: user.team_id,
        name: user.name,
        email: user.profile.email,
        tz: user.tz,
        is_bot: user.is_bot,
        is_admin: user.is_admin
      };
      Users.insertUser(userData)
        .then(data => {
          const message = `Welcome <@${user.id}>!`;
          const dataToPassed = {
            token: gtoken,
            channel: bodyJSON.event.item.channel,
            text: message
          };
          const qs = queryString.stringify(dataToPassed);
          request.post(`https://slack.com/api/chat.postMessage?${qs}`, (err, reqa, resa) => {
            console.log(resa);
          });
        })
        .catch();

      break;
    }
    default:
      break;
    }
  }
};
