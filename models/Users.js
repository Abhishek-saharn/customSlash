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
  is_admin: Boolean,
  work_status: [{
    date: Date,
    status: String
  }]
});

UserSchema.statics = {
  insertManyUsers(users) {
    return new Promise((resolve, reject) => {
      return this.insertMany(users)
        .then(data => resolve(data))
        .catch((err) => reject(err));
    });
  },
  updateWhereabouts(userId, weekWhereabouts) {
    return new Promise((resolve, reject) => {
      this.update({
        user_id: userId
      }, {
        $push: {
          work_status: {
            $each: weekWhereabouts

          }
        }
      }).then((data) => resolve(data)).catch((err) => reject(err));
    });
  },
  findStatus(name) {
    return new Promise((resolve, reject) => {
      this.find({
        name: name
      }).then(data => {
        return resolve(data);
      }).catch(err => {
        return reject(err);
      });
    });
  }
};
module.exports = mongoose.model("Users", UserSchema);
