const ScheduledPayment = require('../models/ScheduledPayment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIdFromUsername, getUsernameFromId } = require('../utils/userMaps');

const getTimestamp = () => new Date().toISOString();

// Calculate next scheduled date
const calculateNextDate = (frequency) => {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    default:
      return now;
  }
};

// Create scheduled payment
exports.createScheduledPayment = async (req, res) => {
  try {
    const { receiverUsername, amount, frequency, note } = req.body;

    if (!receiverUsername || !amount || amount <= 0 || !frequency) {
      return res.status(400).json({
        status: 'error',
        message: 'Receiver username, valid amount, and frequency are required',
        timestamp: getTimestamp()
      });
    }

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        status: 'error',
        message: 'Frequency must be daily, weekly, or monthly',
        timestamp: getTimestamp()
      });
    }

    const receiverId = await getIdFromUsername(receiverUsername);
    if (!receiverId) {
      return res.status(404).json({
        status: 'error',
        message: `User '${receiverUsername}' not found`,
        timestamp: getTimestamp()
      });
    }

    if (receiverId.toString() === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot create scheduled payment to yourself',
        timestamp: getTimestamp()
      });
    }

    const sender = await User.findById(req.user.id);
    if (sender.finalBalance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance for scheduled payment',
        timestamp: getTimestamp()
      });
    }

    const scheduledPayment = new ScheduledPayment({
      senderId: req.user.id,
      receiverUsername: receiverUsername,
      amount,
      frequency,
      note: note || '',
      nextScheduledDate: calculateNextDate(frequency)
    });

    await scheduledPayment.save();

    res.status(201).json({
      status: 'success',
      message: `Scheduled ${frequency} payment of ₹${amount} to '${receiverUsername}' created`,
      data: scheduledPayment,
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Create scheduled payment error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create scheduled payment',
      timestamp: getTimestamp()
    });
  }
};

// Get scheduled payments
exports.getScheduledPayments = async (req, res) => {
  try {
    const payments = await ScheduledPayment.find({
      senderId: req.user.id,
      isActive: true
    }).sort({ nextScheduledDate: 1 });

    res.status(200).json({
      status: 'success',
      message: 'Scheduled payments fetched successfully',
      data: payments,
      count: payments.length,
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Get scheduled payments error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch scheduled payments',
      timestamp: getTimestamp()
    });
  }
};

// Cancel scheduled payment
exports.cancelScheduledPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await ScheduledPayment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Scheduled payment not found',
        timestamp: getTimestamp()
      });
    }

    if (payment.senderId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this payment',
        timestamp: getTimestamp()
      });
    }

    payment.isActive = false;
    await payment.save();

    res.status(200).json({
      status: 'success',
      message: 'Scheduled payment cancelled',
      data: payment,
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Cancel scheduled payment error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel scheduled payment',
      timestamp: getTimestamp()
    });
  }
};

// Execute scheduled payments (to be run by a cron job)
exports.executeScheduledPayments = async (req, res) => {
  try {
    const now = new Date();
    const duePayments = await ScheduledPayment.find({
      nextScheduledDate: { $lte: now },
      isActive: true
    });

    const results = [];

    for (const payment of duePayments) {
      try {
        const sender = await User.findById(payment.senderId);
        const receiverId = await getIdFromUsername(payment.receiverUsername);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
          payment.isActive = false;
          await payment.save();
          continue;
        }

        if (sender.finalBalance >= payment.amount) {
          // Create debit transaction
          const debitTxn = new Transaction({
            userId: sender._id,
            type: 'debited',
            amount: payment.amount,
            note: `${payment.frequency} scheduled payment: ${payment.note}`,
            sender: sender.username,
            receiver: receiver.username,
            status: 'completed',
            date: new Date()
          });

          await debitTxn.save();

          // Create credit transaction for receiver
          const creditTxn = new Transaction({
            userId: receiver._id,
            type: 'credited',
            amount: payment.amount,
            note: `${payment.frequency} scheduled payment from ${sender.username}`,
            sender: sender.username,
            receiver: receiver.username,
            status: 'completed',
            date: new Date()
          });

          await creditTxn.save();

          // Update balances
          sender.finalBalance -= payment.amount;
          receiver.finalBalance += payment.amount;
          await sender.save();
          await receiver.save();

          // Create notifications
          await Notification.create({
            userId: sender._id,
            message: `Scheduled payment of ₹${payment.amount} to ${receiver.username} executed`,
            type: 'payment_sent',
            transactionId: debitTxn._id,
            seen: false
          });

          await Notification.create({
            userId: receiver._id,
            message: `Received ₹${payment.amount} from ${sender.username} (scheduled payment)`,
            type: 'payment_received',
            transactionId: creditTxn._id,
            seen: false
          });

          // Update scheduled payment
          payment.lastExecutedDate = new Date();
          payment.totalExecutions += 1;
          payment.nextScheduledDate = calculateNextDate(payment.frequency);
          await payment.save();

          results.push({
            status: 'success',
            paymentId: payment._id,
            from: sender.username,
            to: receiver.username,
            amount: payment.amount
          });
        } else {
          // Insufficient balance
          results.push({
            status: 'failed',
            paymentId: payment._id,
            reason: 'Insufficient balance'
          });
        }
      } catch (err) {
        results.push({
          status: 'error',
          paymentId: payment._id,
          error: err.message
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Scheduled payments execution completed',
      data: results,
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Execute scheduled payments error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to execute scheduled payments',
      timestamp: getTimestamp()
    });
  }
};
