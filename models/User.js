const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

// User schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, default: "default" },
  lastName: { type: String, default: "default" },
  licenseNumber: { type: String, default: "default" },
  age: { type: Number, default: 0 },
  dob: { type: Date },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["Driver", "Examiner", "Admin"], default: "Driver" },
  car_details: {
    make: { type: String, default: "default" },
    model: { type: String, default: "default" },
    year: { type: Number, default: 0 },
    plateNumber: { type: String, default: "default" },
  },
  appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
});

// Pre-save hook to encrypt password and license number
UserSchema.pre("save", async function (next) {
  const user = this;

  await bcrypt.hash(user.password, 10, (error, hash) => {
    user.password = hash;
  });

  await bcrypt.hash(user.licenseNumber, 10, (error, hash) => {
    user.licenseNumber = hash;
  });

  next();
});

// Method to compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
