const mongoose = require('mongoose');

const assistantSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assistant', assistantSchema);

