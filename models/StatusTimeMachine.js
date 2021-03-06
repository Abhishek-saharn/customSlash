import mongoose from "mongoose";

const Schema = mongoose.Schema;

const StatusTimeMachineSchema = new Schema({
  user_id: {
    type: String,
    unique: false
  },
  user_team_id: String,
  date: Date,
  status: String
});
StatusTimeMachineSchema.index({
  user_id: 1,
  user_team_id: 1,
  date: 1
}, {
  unique: true
});
StatusTimeMachineSchema.statics = {
  insertwb(whereabouts) {
    return new Promise((resolve, reject) => {
      this.insertMany(whereabouts)
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }
};
module.exports = mongoose.model("StatusTimeMachine", StatusTimeMachineSchema);