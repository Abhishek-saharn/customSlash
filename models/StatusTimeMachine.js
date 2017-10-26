import mongoose from "mongoose";

const Schema = mongoose.Schema;

const StatusTimeMachineSchema = new Schema({
  user_id: {
    type: String,
    unique: false
  },
  date: Date,
  status: String
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