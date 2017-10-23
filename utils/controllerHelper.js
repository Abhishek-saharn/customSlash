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
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const str = `${days[weekWhereabouts[0].date.getDay()]} is ${weekWhereabouts[0].status}
      ${days[weekWhereabouts[1].date.getDay()]} is ${weekWhereabouts[1].status}
      ${days[weekWhereabouts[2].date.getDay()]} is ${weekWhereabouts[2].status}
      ${days[weekWhereabouts[3].date.getDay()]} is ${weekWhereabouts[3].status}
      ${days[weekWhereabouts[4].date.getDay()]} is ${weekWhereabouts[4].status}`;
      const message = {
        response_type: "in_channel",
        text: str
      };
      console.log("ahjfsdgas");
      displayMessage(response_url, message);
    })
    .catch((err) => (console.log(err)));
}
