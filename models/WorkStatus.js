import mongoose from "mongoose";

const Schema = mongoose.Schema;

const WorkStatusSchema = new Schema({
  user_id: {
    type: String,
    unique: false
  },
  user_team_id: String,
  date: Date,
  status: String
});

WorkStatusSchema.index({
  user_id: 1,
  user_team_id: 1,
  date: 1
}, {
  unique: true
});

WorkStatusSchema.statics = {
  updateWhereabouts(userId, teamId, weekWhereabouts) {
    return new Promise((resolve, reject) => {
      try {
        this.deleteMany({
          user_id: userId,
          user_team_id: teamId,
          date: {
            $gte: new Date().setHours(0, 0, 0, 0)
          }
        })
          .then(deleteManyData => {
            console.log("WORKING HEREEEEE TOOOOOOOOOOOOOOOO>>>>>>>>>>>>>>>>>.");

            if (deleteManyData.result.ok === 1) {
              this.insertMany(weekWhereabouts, {
                ordered: false
              })
                .then((data) => resolve(data))
                .catch((err) => {
                  console.log("HERE WE GOT ERROR IN insertMany>>", err);
                  // if(err.errmsg === )
                  return reject(err);
                });
            } else {
              return reject(new Error("There is some error!"));
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
  findStatus(userId, teamId, dayBefore, dayAfter) {
    return new Promise((resolve, reject) => {
      this.findOne({
        user_id: userId,
        user_team_id: teamId,
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
  updateTodaysStatus(userId, teamId, today, newStatus, dayBefore, dayAfter) {
    return new Promise((resolve, reject) => {
      this.update({
        user_id: userId,
        user_team_id: teamId,
        date: {
          $gt: new Date(dayBefore),
          $lt: new Date(dayAfter)
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
  },
  getUserStats(userId, teamId, startDate, endDate) {
    return new Promise((resolve, reject) => {
      this.aggregate([{
        $match: {
          user_id: userId,
          user_team_id: teamId,
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          }
        }
      }
      ]).then(data => {
        return resolve(data);
      }).catch(error => {
        return reject(error);
      });
    });
  }
};

module.exports = mongoose.model("WorkStatus", WorkStatusSchema);
