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
    console.log("<<<<<>>>>>>>>>><ERRRRRRR", error);
    console.log("BBBBOOOOOOODDDDYYYY", body);
  });
}
