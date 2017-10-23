import workCodes from "../api/workCodes";
import Users from "../models/Users";
import {
  displayMessage
} from "../utils/misc";

export function updateWhereabouts(userId, codeString, response_url) {
  if (codeString.length !== 5) {
    throw Error("Wrong Codes provided");
  }
  const codeArr = codeString.split("");
  const today = new Date();
  let todayDay = today.getDate();
  let todayMonth = today.getMonth();
  let todayYear = today.getFullYear();
  // let i = 0;
  const weekWhereabouts = [];
  codeArr.forEach((code) => {
    const d = new Date(todayYear, todayMonth, todayDay);
    todayDay += 1;

    const dayObj = {
      date: d,
      status: workCodes[code]
    };


    weekWhereabouts.push(dayObj);
  });

  Users.updateWhereabouts(userId, weekWhereabouts)
    .then((data) => {
      const message = {
        response_type: "in_channel",
        text: weekWhereabouts
      };
      console.log("ahjfsdgas");
      displayMessage(response_url, message);
    })
    .catch((err) => (console.log(err)));
}