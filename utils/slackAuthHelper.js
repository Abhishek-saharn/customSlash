import config from "../config/config";
import rp from "request-promise-native";
import Teams from "../models/Teams";
import Users from "../models/Users";


const slackAuthHelpers = {
  insertUsers(bodyJson) {
    let users = [];
    const members = bodyJson.members;

    members.forEach((user) => {
      if (user.is_bot === true) return;
      let userData = {
        user_id: user.id,
        user_team_id: user.team_id,
        name: user.name,
        email: user.profile.email,
        tz: user.tz,
        is_bot: user.is_bot,
        is_admin: user.is_admin
      };
      users.push(userData);
    });

    return new Promise((resolve, reject) => {
      Users.insertManyUsers(users)
        .then(insertedData => resolve(insertedData))
        .catch(insertedDataError => reject(insertedDataError));
    });
  },


  insertTeamInfo(bodyTeamInfo, token) {
    const teamId = JSON.parse(bodyTeamInfo).team.id;
    const team = JSON.parse(bodyTeamInfo).team.domain;
    const Teamdata = {
      team_id: teamId,
      team_domain: team,
      token: token
    };
    return new Promise((resolve, reject) => {
      Teams.insert(Teamdata)
        .then(insertedData => resolve(insertedData))
        .catch((insertError) => {
          console.log("HERE WE GOT ERROR WHILE INSERTING TEAMDATA ", insertError);
          return reject(insertError);
        });
    });
  },


  saveUsers(token) {
    return new Promise((resolve, reject) => {
      rp.post("https://slack.com/api/users.list", {
        form: {
          token: token
        }
      })
        .then(bodyUserList => {
          const bodyJson = JSON.parse(bodyUserList);
          return this.insertUsers(bodyJson);
        })
        .then((insertManyUsersData) => resolve(insertManyUsersData))
        .catch(userListError => reject(userListError));
    });
  },


  saveTeamInfo(token) {
    return new Promise((resolve, reject) => {
      rp.post("https://slack.com/api/team.info", {
        form: {
          token: token
        }
      })
        .then(bodyTeamInfo => {
          return this.insertTeamInfo(bodyTeamInfo, token);
        })
        .then((teamName) => resolve(teamName))
        .catch(getTeamInfoError => {
          console.log(getTeamInfoError);
          return reject(getTeamInfoError);
        });
    });
  },


  oauthAccess(queryCode) {
    config.data.form.code = queryCode;

    return new Promise((resolve, reject) => {
      rp.post("https://slack.com/api/oauth.access", config.data)
        .then((oauthBody) => {
          const token = JSON.parse(oauthBody).access_token;
          console.log(token);
          this.saveUsers(token).then().catch(getUsersError => reject(getUsersError));
          return this.saveTeamInfo(token);
          //  .catch(getTeamInfoError => reject(getTeamInfoError));
        })
        .then(savedTeamData => {
          return resolve("http://" + savedTeamData.team_domain + ".slack.com");
        })
        .catch((error) => {
          console.log("AS EXPECTED _______", error);
          return reject(error);
        });
    });
  }
};

export default slackAuthHelpers;

