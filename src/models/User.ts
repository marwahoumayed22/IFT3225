import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  favoriteLocations: string[];
  comparePassword(plain: string): Promise<boolean>;
}

interface UserModel extends Model<UserDocument> {
  hashPassword(plain: string): Promise<string>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    // Slugs des lieux (voir Location.slug) mis en favoris par l'usager.
    favoriteLocations: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(this: UserDocument, plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
};

export default mongoose.model<UserDocument, UserModel>('User', userSchema);
