const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIdFromUsername } = require('../utils/userMaps');

const getTimestamp = () => new Date().toISOString();

// Create bill (bill splitter)
exports.createBill = async (req, res) => {
  try {
    const { title, description, totalAmount, participants } = req.body;

    if (!title || !totalAmount || !participants || participants.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, totalAmount, and participants are required',
        timestamp: getTimestamp()
      });
    }

    // Validate all participants exist
    for (const participant of participants) {
      const userId = await getIdFromUsername(participant);
      if (!userId) {
        return res.status(404).json({
          status: 'error',
          message: `User '${participant}' not found`,
          timestamp: getTimestamp()
        });
      }
    }

    // Calculate equal split
    const sharePerPerson = totalAmount / participants.length;

    const billParticipants = participants.map(username => ({
      username,
      share: sharePerPerson,
      hasPaid: false,
      paidAmount: 0
    }));

    const bill = new Bill({
      createdBy: req.user.id,
      title,
      description: description || '',
      totalAmount,
      participants: billParticipants
    });

    await bill.save();

    res.status(201).json({
      status: 'success',
      message: 'Bill created successfully',
      data: bill,
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Create bill error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create bill',
      timestamp: getTimestamp()
    });
  }
};

// Get all bills for user
exports.getBills = async (req, res) => {
  try {
    const { username } = req.user;

    const bills = await Bill.find({
      $or: [
        { createdBy: req.user.id },
        { 'participants.username': username }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Bills fetched successfully',
      data: bills,
      count: bills.length,
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Get bills error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bills',
      timestamp: getTimestamp()
    });
  }
};

// Settle bill - create transactions for all unpaid participants
exports.settleBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        status: 'error',
        message: 'Bill not found',
        timestamp: getTimestamp()
      });
    }

    if (bill.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only bill creator can settle the bill',
        timestamp: getTimestamp()
      });
    }

    const billCreator = await User.findById(bill.createdBy);
    const transactions = [];

    // Create transactions for unpaid participants
    for (const participant of bill.participants) {
      if (!participant.hasPaid && participant.username !== billCreator.username) {
        const participantId = await getIdFromUsername(participant.username);
        const payer = await User.findById(participantId);

        if (!payer) {
          return res.status(404).json({
            status: 'error',
            message: `User '${participant.username}' not found`,
            timestamp: getTimestamp()
          });
        }

        if (payer.finalBalance < participant.share) {
          return res.status(400).json({
            status: 'error',
            message: `Insufficient balance for user '${participant.username}' to settle their share of ₹${participant.share.toFixed(2)}`,
            timestamp: getTimestamp()
          });
        }

        // Create debit transaction for payer
        const debitTxn = new Transaction({
          userId: payer._id,
          type: 'debited',
          amount: participant.share,
          note: `Bill split: ${bill.title}`,
          sender: payer.username,
          receiver: billCreator.username,
          status: 'completed',
          date: new Date()
        });

        await debitTxn.save();

        // Create credit transaction for bill creator
        const creditTxn = new Transaction({
          userId: billCreator._id,
          type: 'credited',
          amount: participant.share,
          note: `Bill split payment from ${payer.username}: ${bill.title}`,
          sender: payer.username,
          receiver: billCreator.username,
          status: 'completed',
          date: new Date()
        });

        await creditTxn.save();

        // Update balances
        payer.finalBalance -= participant.share;
        billCreator.finalBalance += participant.share;
        await payer.save();
        await billCreator.save();

        // Update participant payment status
        participant.hasPaid = true;
        participant.paidAmount = participant.share;
        participant.paidAt = new Date();

        // Create notifications
        await Notification.create({
          userId: payer._id,
          message: `You paid ₹${participant.share.toFixed(2)} for bill '${bill.title}'`,
          type: 'payment_sent',
          transactionId: debitTxn._id,
          seen: false
        });

        await Notification.create({
          userId: billCreator._id,
          message: `Received ₹${participant.share.toFixed(2)} from ${payer.username} for bill '${bill.title}'`,
          type: 'payment_received',
          transactionId: creditTxn._id,
          seen: false
        });

        transactions.push({
          from: payer.username,
          to: billCreator.username,
          amount: participant.share,
          transactionId: debitTxn._id
        });
      }
    }

    bill.status = 'settled';
    bill.updatedAt = new Date();
    await bill.save();

    res.status(200).json({
      status: 'success',
      message: 'Bill settled successfully',
      data: {
        bill,
        transactions,
        totalSettled: transactions.length
      },
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Settle bill error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to settle bill',
      timestamp: getTimestamp()
    });
  }
};

// Cancel bill
exports.cancelBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        status: 'error',
        message: 'Bill not found',
        timestamp: getTimestamp()
      });
    }

    if (bill.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only bill creator can cancel the bill',
        timestamp: getTimestamp()
      });
    }

    bill.status = 'cancelled';
    await bill.save();

    res.status(200).json({
      status: 'success',
      message: 'Bill cancelled successfully',
      data: bill,
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error('Cancel bill error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel bill',
      timestamp: getTimestamp()
    });
  }
};
