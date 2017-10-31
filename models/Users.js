import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({

  user_id: String,
  user_team_id: String,
  name: String,
  email: {
    type: String,
    unique: true
  },
  tz: String,
  is_bot: Boolean,
  is_admin: Boolean
});

UserSchema.statics = {
  insertUser(user) {
    return new Promise((resolve, reject) => {
      this.create(user)
        .then(data => (resolve(data)))
        .catch(err => (reject(err)));
    });
  },
  insertManyUsers(users) {
    return new Promise((resolve, reject) => {
      return this.insertMany(users)
        .then(data => resolve(data))
        .catch((err) => reject(err));
    });
  },
  findUser(name, teamId) {
    return new Promise((resolve, reject) => {
      this.findOne({
        name: name,
        user_team_id: teamId
      }).then(data => {
        return resolve(data);
      }).catch(err => {
        return reject(err);
      });
    });
  },
  // updateWhereabouts
  updateTodaysStatus(userId, today, newStatus) {
    return new Promise((resolve, reject) => {
      this.update({
        user_id: userId,
        "work_status.date": today
      }, {
        $set: {
          "work_status.$.status": newStatus
        }
      }).then((data) => {
        console.log("++++++", data);
        return resolve(data);
      }).catch(err => {
        console.log("------", err);
        return reject(err);
      });
    });
  }
};
module.exports = mongoose.model("Users", UserSchema);