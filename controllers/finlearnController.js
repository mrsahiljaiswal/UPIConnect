const UserProgress = require("../models/UserProgress");

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found for the user.",
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress.",
      error: error.message,
    });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update progress.",
      error: error.message,
    });
  }
};

exports.updateBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookmarkedArticles, bookmarkCategories } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      {
        $set: {
          bookmarkedArticles,
          bookmarkCategories,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update bookmarks.",
      error: error.message,
    });
  }
};