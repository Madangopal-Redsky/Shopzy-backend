const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema, model } = mongoose;

const AuthSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other']},
    role: { type: String, enum: ['super-admin', 'admin', 'user'], default: 'user' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, 
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", default: null },
    profileImage: { type: String, default: '' },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    phone:{type: String, default :""},
    fcmToken: { type: String, default: "" } 
  },
  { timestamps: true }
);

AuthSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AuthSchema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

const Auth = model('Auth', AuthSchema);

module.exports = { Auth };
