const mongoose = require('mongoose');

if (mongoose.models.User) {
    module.exports = mongoose.models.User;
} else {
    const Schema = mongoose.Schema;

    const userSchema = new Schema({
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, default: 'user' },
    });

    module.exports = mongoose.model('User', userSchema);
}
