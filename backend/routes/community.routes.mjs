import { Router } from "express";
import CommunityPlan from "../models/CommunityPlan.mjs";
import CommunityPost from "../models/CommunityPost.mjs";
import User from "../models/User.mjs";

const router = Router();

function initials(name) {
  return String(name || "You")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "Y";
}

function limitFrom(query, fallback = 30) {
  const parsed = Number.parseInt(query.limit, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 50) : fallback;
}

function formatPost(post) {
  return {
    id: String(post._id),
    type: post.type,
    title: post.title,
    body: post.body,
    topic: post.topic,
    location: post.location,
    authorName: post.authorName,
    authorInitials: post.authorInitials,
    createdAt: post.createdAt,
    replies: post.replies?.length || 0,
    replyItems: (post.replies || []).slice(-3).map((reply) => ({
      id: String(reply._id),
      authorName: reply.authorName,
      body: reply.body,
      createdAt: reply.createdAt,
    })),
  };
}

function formatPlan(plan, userId) {
  const joined = plan.attendees.some((attendee) => String(attendee) === String(userId));
  return {
    id: String(plan._id),
    title: plan.title,
    description: plan.description,
    location: plan.location,
    startsAt: plan.startsAt,
    spots: plan.spots,
    attendeeCount: plan.attendees.length,
    joined,
    hostName: plan.hostName,
    hostInitials: plan.hostInitials,
  };
}

async function currentUser(userId) {
  const user = await User.findById(userId).select("name").lean();
  if (!user) return null;
  return { id: userId, name: user.name, initials: initials(user.name) };
}

router.get("/posts", async (req, res) => {
  const limit = limitFrom(req.query);
  const filter = {};
  if (req.query.topic) filter.topic = String(req.query.topic).slice(0, 60);
  if (req.query.location) filter.location = String(req.query.location).slice(0, 80);
  try {
    const posts = await CommunityPost.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return res.json({ posts: posts.map(formatPost) });
  } catch (error) {
    console.error("Community post list failed:", error);
    return res.status(500).json({ error: "Could not load the community feed right now." });
  }
});

router.post("/posts", async (req, res) => {
  const user = await currentUser(req.userId);
  if (!user) return res.status(404).json({ error: "Account not found." });
  const type = ["question", "story", "tip"].includes(req.body?.type) ? req.body.type : "question";
  const title = String(req.body?.title || "").trim();
  const body = String(req.body?.body || "").trim();
  const topic = String(req.body?.topic || "General").trim();
  const location = String(req.body?.location || "Nearby").trim();
  if (title.length < 4 || title.length > 140) return res.status(400).json({ error: "Use a title between 4 and 140 characters." });
  if (body.length < 2 || body.length > 2000) return res.status(400).json({ error: "Write between 2 and 2,000 characters." });
  if (topic.length > 60 || location.length > 80) return res.status(400).json({ error: "Please shorten the topic or location." });
  try {
    const post = await CommunityPost.create({ authorId: user.id, authorName: user.name, authorInitials: user.initials, type, title, body, topic: topic || "General", location: location || "Nearby" });
    return res.status(201).json({ post: formatPost(post) });
  } catch (error) {
    console.error("Community post create failed:", error);
    return res.status(500).json({ error: "Could not publish the post right now." });
  }
});

router.post("/posts/:id/replies", async (req, res) => {
  const user = await currentUser(req.userId);
  const body = String(req.body?.body || "").trim();
  if (!user) return res.status(404).json({ error: "Account not found." });
  if (body.length < 2 || body.length > 1200) return res.status(400).json({ error: "Write between 2 and 1,200 characters." });
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Community post not found." });
    post.replies.push({ userId: user.id, authorName: user.name, body });
    await post.save();
    return res.status(201).json({ post: formatPost(post) });
  } catch (error) {
    console.error("Community reply create failed:", error);
    return res.status(500).json({ error: "Could not add your reply right now." });
  }
});

router.get("/plans", async (req, res) => {
  const limit = limitFrom(req.query, 20);
  try {
    const plans = await CommunityPlan.find({ startsAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } }).sort({ startsAt: 1 }).limit(limit).lean();
    return res.json({ plans: plans.map((plan) => formatPlan(plan, req.userId)) });
  } catch (error) {
    console.error("Community plan list failed:", error);
    return res.status(500).json({ error: "Could not load community plans right now." });
  }
});

router.post("/plans", async (req, res) => {
  const user = await currentUser(req.userId);
  if (!user) return res.status(404).json({ error: "Account not found." });
  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  const location = String(req.body?.location || "").trim();
  const startsAt = new Date(req.body?.startsAt);
  const spots = Number(req.body?.spots);
  if (title.length < 4 || title.length > 120) return res.status(400).json({ error: "Use a title between 4 and 120 characters." });
  if (!location || location.length > 120) return res.status(400).json({ error: "Add a nearby place for the plan." });
  if (Number.isNaN(startsAt.getTime()) || startsAt < new Date()) return res.status(400).json({ error: "Choose a future date and time." });
  if (!Number.isInteger(spots) || spots < 2 || spots > 50) return res.status(400).json({ error: "Choose between 2 and 50 spots." });
  try {
    const plan = await CommunityPlan.create({ hostId: user.id, hostName: user.name, hostInitials: user.initials, title, description, location, startsAt, spots, attendees: [user.id] });
    return res.status(201).json({ plan: formatPlan(plan, req.userId) });
  } catch (error) {
    console.error("Community plan create failed:", error);
    return res.status(500).json({ error: "Could not create the plan right now." });
  }
});

router.post("/plans/:id/join", async (req, res) => {
  try {
    const plan = await CommunityPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Community plan not found." });
    const index = plan.attendees.findIndex((attendee) => String(attendee) === String(req.userId));
    if (index >= 0) plan.attendees.splice(index, 1);
    else if (plan.attendees.length >= plan.spots) return res.status(409).json({ error: "This plan is already full." });
    else plan.attendees.push(req.userId);
    await plan.save();
    return res.json({ plan: formatPlan(plan, req.userId) });
  } catch (error) {
    console.error("Community plan join failed:", error);
    return res.status(500).json({ error: "Could not update your plan RSVP right now." });
  }
});

export default router;
