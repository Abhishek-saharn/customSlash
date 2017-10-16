import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({

    user_id: String,
    user_team_id: String,
    name: String,
    email: String,
    tz: String,
    is_bot: Boolean,
    is_admin: Boolean
});

UserSchema.statics = {
    insertMany: function (users) {
        return new Promise((resolve, reject) => {

            this.insertMany(users)
                .then(data => resolve(data))
                .catch(err => reject(err));

        });
    }
}




module.exports = mongoose.model("Users", UserSchema);