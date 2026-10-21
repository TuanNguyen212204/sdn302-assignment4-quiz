const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: function (document, value) {
    delete value.password;
    delete value.__v;
    return value;
  },
});

module.exports = mongoose.model("User", userSchema);
