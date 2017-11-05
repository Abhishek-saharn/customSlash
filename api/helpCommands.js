export default {
  options: [
    {
      text: "/pinpoint @[username]",
      value: "`/pinpoint @[username]` show the current working status of a user.\nFor example: `/pinpoint @Abhishek`"
    },
    {
      text: "/pinpoint whereabouts [codes]",
      value: "`/pinpoint whereabouts [codes]`: Use this command to update status of your coming days.If you want to chnge updates, just execute this command again. Then all of your previous updates will be removed and new updated.\nFor Example: `/pinpoint whereabouts 11221`"
    },
    {
      text: "/pinpoint whereabouts codes",
      value: "`/pinpoint whereabouts codes`: Helps you in getting information about available codes."
    },
    {
      text: "/pinpoint update status [code]",
      value: "`/pinpoint update status [code]`: If you want to update today's status use this command. For example: `/pinpoint update status 1`"
    },
    {
      text: "/pinpoint stats @[username] [data_range]",
      value: "`/pinpoint stats @[username] [data_range]`: To retrieve stats about a member in a specified date range. You have to pass date in 'MM-DD-YYYY' format. For example: `/pinpoint stats @abhishek 12/31/2017 1/31/2018`"
    }
  ]
};
