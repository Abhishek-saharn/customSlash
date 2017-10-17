import mongoose from "mongoose";

const Schema = mongoose.Schema;

let TeamsSchema = new Schema({
  team_id: String,
  team_domain: String,
  access_token: String,
  members: [{
    user_id: String,
    user_team_id: String,
    name: String,
    email: {
      type: String,
      unique: true
    },
    tz: String,
    is_bot: Boolean,
    is_admin: Boolean,
    last_location: {
      lat: String,
      long: String
    },
    last_location_address: String
  }]
});

TeamsSchema.statics = {
  insert: function (data) {
    const dataToken = {
      team_id: data.team_id,
      team_domain: data.team_domain,
      access_token: data.token,
      members: data.members
    };
    return new Promise((resolve, reject) => {
      const that = this;
      this.findOne({

        team_id: data.team_id
      })
        .then(existingTeam => {
          if (!existingTeam) {
            that.create(dataToken)
              .then((insertedData) => {
                return resolve(insertedData);
              })
              .catch(error => {
                return reject(error);
              });
          }
        })
        .catch(error => reject(error));
    });
  },
  find: function (teamId) {
    return new Promise((resolve, reject) => {
      this.findOne({
        team_id: teamId
      })
        .then(teamData => resolve(teamData.accessToken))
        .catch(error => reject(error));
    });
  }
};


module.exports = mongoose.model("Teams", TeamsSchema);
