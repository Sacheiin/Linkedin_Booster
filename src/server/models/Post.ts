import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'posted'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Post', PostSchema);