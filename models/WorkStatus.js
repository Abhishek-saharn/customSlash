import mongoose from "mongoose";

const Schema = mongoose.Schema;

const WorkStatusSchema = new Schema({
  user_id: {
    type: String,
    unique: false
  },
  date: Date,
  status: String
});
WorkStatusSchema.statics = {
  updateWhereabouts(userId, weekWhereabouts) {
    return new Promise((resolve, reject) => {
      try {
        this.deleteMany({
          user_id: userId,
          date: {
            $gte: new Date().setHours(0, 0, 0, 0)
          }
        })
          .then(deleteManyData => {
            console.log("WORKING HEREEEEE TOOOOOOOOOOOOOOOO>>>>>>>>>>>>>>>>>.");

            if (deleteManyData.result.ok === 1) {
              this.insertMany(weekWhereabouts)
                .then((data) => resolve(data))
                .catch((err) => {
                  console.log("HERE WE GOT ERROR IN insertMany>>", err);
                  return reject(err);
                });
            }
          })
          .catch(deleteManyError => {
            console.log("HERE WE GOT ERROR IN deleteMany >> ", deleteManyError);
            return reject(deleteManyError);
          });
      } catch (e) {
        console.log("WELL, THIS IS EXCEPTION HANDLING", e);
      }
    });
  },
  findStatus(userId, dayBefore, dayAfter) {
    return new Promise((resolve, reject) => {
      this.findOne({
        user_id: userId,
        date: {
          $gt: dayBefore,
          $lt: dayAfter
        }
      }).then(data => {
        return resolve(data);
      }).catch(err => {
        return reject(err);
      });
    });
  },
  updateTodaysStatus(userId, today, newStatus, dayBefore, dayAfter) {
    return new Promise((resolve, reject) => {
      this.update({
        user_id: userId,
        date: {
          $gt: dayBefore,
          $lt: dayAfter
        }
      }, {
        $set: {
          date: today,
          status: newStatus
        }
      })
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  }
};

module.exports = mongoose.model("WorkStatus", WorkStatusSchema);
