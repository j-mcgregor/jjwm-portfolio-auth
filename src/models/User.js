import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  dob: { type: Date },
  email: { type: String, required: true },
  password: { type: String }
});

export default mongoose.model('users', UserSchema);
