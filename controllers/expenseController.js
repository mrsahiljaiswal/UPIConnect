const Expense = require("../models/Expense");

exports.addOrUpdateExpense = async (req, res) => {
  try {
    const { category, amount, paymentMode } = req.body;

    if (!category || !amount || !paymentMode) {
      return res.status(400).json({
        status: "fail",
        message: "Category, amount, and payment mode are required.",
      });
    }

    const userId = req.user.id;

    // Find or create the expense document for the user
    let expense = await Expense.findOne({ userId });
    if (!expense) {
      expense = new Expense({ userId });
    }

    // Update current month expenses
    expense.currentMonth.total += amount;
    const existingCategory = expense.currentMonth.categories.find((cat) => cat.category === category);

    if (existingCategory) {
      existingCategory.amount += amount;
    } else {
      expense.currentMonth.categories.push({ category, amount, paymentMode });
    }

    await expense.save();

    res.status(200).json({
      status: "success",
      message: "Expense added/updated successfully.",
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to add/update expense.",
      error: err.message,
    });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const expense = await Expense.findOne({ userId });
    if (!expense) {
      return res.status(404).json({
        status: "fail",
        message: "No expense data found for the user.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Expenses retrieved successfully.",
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve expenses.",
      error: err.message,
    });
  }
};