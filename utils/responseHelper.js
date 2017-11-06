import request from "request";
import queryString from "query-string";

const responseHelper = {
  displayMessage(responseUrl, message) {
    const options = {
      uri: responseUrl,
      json: message,
      headers: {
        "Content-type": "application/json"
      }
    };
  
    request.post(options, (error, response, body) => {
      if (error) console.log("ERROR HAPPENED WHILE POSTING MESSAGE", error);
    });
  },
  
  postMessage(message, token, channel, att = [{}]) {
    const dataToPassed = {
      token: token,
      channel: channel,
      text: message,
      as_user: false,
      username: "pinpoint",
      attachments: JSON.stringify(att)
    };
    const qs = queryString.stringify(dataToPassed);
    request.post(`https://slack.com/api/chat.postMessage?${qs}`, (err, reqa, resa) => {});
  },
  
  postEphemeralMessage(message, token, userId, channel, att = [{}]) {
    const dataToPassed = {
      token: token,
      channel: channel,
      text: message,
      user: userId,
      as_user: false,
      username: "pinpoint",
      attachments: JSON.stringify(att)
    };
    const qs = queryString.stringify(dataToPassed);
    request.post(`https://slack.com/api/chat.postEphemeral?${qs}`, (err, reqa, resa) => {});
  },

  postMessageError(token, userId, channel, customText = null) {
    const text = "Sorry! Somthing went wrong. Did you enterd correct inputs?\n Try `/pinpoint help` .";
    const textToPass = (customText === null) ? text : customText;
    // /pinpoint stats @Abhishek 12/11/1919 12/1/2001
    const message = {
      color: "danger",
      text: textToPass,
      mrkdwn_in: ["text"]
    };
    const dataToPassed = {
      token: token,
      channel: channel,
      user: userId,
      text: "",
      attachments: JSON.stringify([message])
    };
    console.log(message);
    const qs = queryString.stringify(dataToPassed);
    request.post(`https://slack.com/api/chat.postEphemeral?${qs}`, (err, reqa, resa) => {
      if (err) console.log("HERE WE GOT ERROR IN POSTMESSAGEERROR ", err);
    });
  }
};

export default responseHelper;
