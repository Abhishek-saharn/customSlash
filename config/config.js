export default {
  database: "mongodb://root:root@ds019658.mlab.com:19658/slashpinpoint",
  data: {
    form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: ""
    }
  }
};
