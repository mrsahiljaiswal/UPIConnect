const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  articlesRead: {
    type: [Number],
    default: [],
  },
  quizzesCompleted: {
    type: [Number],
    default: [],
  },
  totalArticles: {
    type: Number,
    default: 0,
  },
  totalQuizzes: {
    type: Number,
    default: 0,
  },
  lastQuizScore: {
    type: Number,
    default: 0,
  },
  lastReadArticle: {
    type: Number,
    default: null,
  },
  bookmarkedArticles: {
    type: [Number],
    default: [],
  },
  bookmarkCategories: {
    type: Map,
    of: String,
    default: {},
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserProgress", userProgressSchema);