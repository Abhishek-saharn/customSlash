import request from "request";

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
  });
}
