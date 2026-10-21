const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: function (options) {
          return (
            options.length >= 2 &&
            options.every(function (option) {
              return option.trim().length > 0;
            })
          );
        },
        message: "Provide at least two non-empty options",
      },
    },
    keywords: {
      type: [String],
      default: [],
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      validate: {
        validator: function (index) {
          return (
            Number.isInteger(index) && index >= 0 && index < this.options.length
          );
        },
        message: "Correct answer index must match an option, starting at zero",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Question", questionSchema);
