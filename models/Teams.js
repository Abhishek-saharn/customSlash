import mongoose from "mongoose";

const Schema = mongoose.Schema;

let TeamsSchema = new Schema({
  team_id: String,
  team_domain: String,
  access_token: String
});
TeamsSchema.index({
  team_id: 1
}, {
  unique: true
});
TeamsSchema.statics = {
  insert(data) {
    const dataToken = {
      team_id: data.team_id,
      team_domain: data.team_domain,
      access_token: data.token
    };
    return new Promise((resolve, reject) => {
      this.findOne({
          team_id: data.team_id
        })
        .then(existingTeam => {
          if (!existingTeam) {
            this.create(dataToken)
              .then((insertedData) => {
                return resolve(insertedData);
              })
              .catch(error => {
                return reject(error);
              });
          } else {
            return resolve(existingTeam);
          }
        })
        .catch(error => reject(error));
    });
  },
  find(teamId) {
    return new Promise((resolve, reject) => {
      this.findOne({
          team_id: teamId
        })
        .then(teamData => {
          return resolve(teamData.access_token);
        })
        .catch(error => reject(error));
    });
  },
  findAll() {
    return new Promise((resolve, reject) => {
      this.find()
        .then(allMembers => resolve(allMembers))
        .catch(error => reject(error));
    });
  }
};


module.exports = mongoose.model("Teams", TeamsSchema);
