import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true, maxlength: 100 },
    body: { type: String, required: true, trim: true, maxlength: 1200 },
  },
  { timestamps: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true, maxlength: 100 },
    authorInitials: { type: String, required: true, trim: true, maxlength: 3 },
    type: { type: String, enum: ["question", "story", "tip"], required: true, default: "question" },
    title: { type: String, required: true, trim: true, minlength: 4, maxlength: 140 },
    body: { type: String, required: true, trim: true, minlength: 2, maxlength: 2000 },
    topic: { type: String, trim: true, maxlength: 60, default: "General" },
    location: { type: String, trim: true, maxlength: 80, default: "Nearby" },
    replies: { type: [replySchema], default: [] },
  },
  { timestamps: true, collection: "community_posts" }
);

communityPostSchema.index({ location: 1, createdAt: -1 });
communityPostSchema.index({ topic: 1, createdAt: -1 });

export const CommunityPost = mongoose.models.CommunityPost || mongoose.model("CommunityPost", communityPostSchema);
export default CommunityPost;
