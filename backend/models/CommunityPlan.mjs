import mongoose from "mongoose";

const communityPlanSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostName: { type: String, required: true, trim: true, maxlength: 100 },
    hostInitials: { type: String, required: true, trim: true, maxlength: 3 },
    title: { type: String, required: true, trim: true, minlength: 4, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    startsAt: { type: Date, required: true },
    spots: { type: Number, required: true, min: 2, max: 50, default: 8 },
    attendees: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true, collection: "community_plans" }
);

communityPlanSchema.index({ location: 1, startsAt: 1 });

export const CommunityPlan = mongoose.models.CommunityPlan || mongoose.model("CommunityPlan", communityPlanSchema);
export default CommunityPlan;
