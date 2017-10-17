import mongoose from 'mongoose';

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
        is_admin: Boolean
    }]
});

TeamsSchema.statics = {
    insert: function (data) {
        const dataToken = {
            team_id: data.team_id,
            team_domain: data.team_domain,
            access_token: data.token,
            members: data.members
        }
        return new Promise((resolve, reject) => {
            const that = this;
            this.findOne({

                    team_id: data.team_id
                })
                .then(data => {
                    if (!data) {

                        that.create(dataToken)
                            .then((data) => {
                                return resolve(data)
                            })
                            .catch(error => {
                                return reject(error);
                            })
                    }
                })
                .catch(error => reject(error))


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