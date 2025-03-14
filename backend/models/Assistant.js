const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assistantSchema = new Schema({
  assistantId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assistant', assistantSchema);

