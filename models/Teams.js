import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let TeamsSchema = new Schema({
    team_id: String,
    team_domain: String,
    access_token: String
});

TeamsSchema.statics = {
    insert: function (data) {
        const dataToken = {
            team_id: data.team_id,
            team_domain: data.team_domain,
            access_token: data.token
        }
        return new Promise((resolve, reject) => {
            this.create(dataToken)
                .then((data) => {
                    return resolve(data)
                })
                .catch(error => {
                    return reject(error);
                })

        });

    },
    find: function (team_id) {
        return new Promise((resolve, reject) => {
            this.findOne({
                    team_id: team_id
                })
                .then(team_data => resolve(team_data.access_token))
                .catch(error => reject(error));
        });


    }
}


module.exports = mongoose.model("Teams", TeamsSchema);