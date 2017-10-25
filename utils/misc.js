import request from "request";
import queryString from "query-string";

export function displayMessage(responseUrl, message) {
  const options = {
    uri: responseUrl,
    json: message,
    headers: {
      "Content-type": "application/json"
    }
  };

  request.post(options, (error, response, body) => {
    if (error) console.log("ERROR HAPPENED WHILE POSTING MESSAGE", error);
    console.log("???????????", body);

  });
}

export function postMessage(message, token, channel, att = [{}]) {
  console.log(">>>>><<<<<<", message, token, channel);

  const dataToPassed = {
    token: token,
    channel: channel,
    text: message,
    attachments: JSON.stringify(att)
  };
  const qs = queryString.stringify(dataToPassed);
  request.post(`https://slack.com/api/chat.postMessage?${qs}`, (err, reqa, resa) => {
    console.log(resa);
  });
}

export function postMessageError(token, channel) {
  const message = {
    color: "danger",
    text: "Sorry! Somthing went wrong. Did you enterd correct inputs?"

  };


  const dataToPassed = {
    token: token,
    channel: channel,
    text: "",
    attachments: JSON.stringify([message])
  };
  console.log(message);
  const qs = queryString.stringify(dataToPassed);
  request.post(`https://slack.com/api/chat.postMessage?${qs}`, (err, reqa, resa) => {
    console.log(resa);
  });
}