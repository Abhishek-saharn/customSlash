// import slackClient from "@slack/client";
import {
  gtoken
} from "./commands.controller";
import request from "request";
import queryString from 'query-string';

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
  if (bodyJSON.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("Access Forbidden");
  } else {
    // if (bodyJSON.type === "url_verification") {
    //   res.json({
    //     challenge: bodyJSON.challenge

    //   });
    //   res.status(200).end();
    // }
    if (bodyJSON.event.type === "message") {
      const text = bodyJSON.event.text;

      const user = bodyJSON.event.user;
      const message = `Thankyou @<${user}> for the ${text}`;

      const dataToPassed = {
        token: gtoken,
        channel: bodyJSON.event.item.channel,
        text: message
      }
      const qs = queryString.stringify(dataToPassed);
      request.post(`https://slack.com/api/chat.postMessage?${qs}`, (err, req, resa) => {
        console.log(resa);
      });

    }
    console.log("");
  }
};