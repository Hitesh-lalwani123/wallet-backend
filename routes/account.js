const { Account } = require("../db");
const { authMiddleware } = require("../middlewares/auth");
const mongoose = require('mongoose')
const router = require("express").Router();

router.get("/balance", async (req, res) => {
  const account = await Account.findOne({
    userId: req.headers.userid,
  });
  res.json({
    balance: account.balance,
  });
});
router.post("/transfer", async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  const { amount, to } = req.body;

  // Fetch the accounts within the transaction
  const account = await Account.findOne({ userId: req.headers.userid }).session(session);

  
  if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.json({
          message: "Insufficient balance",
          transfer: false
      });
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);

  if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
          message: "Invalid account"
      });
  }

  // Perform the transfer
  await Account.updateOne({ userId: req.headers.userid }, { $inc: { balance: -amount } }).session(session);
  await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

  // Commit the transaction
  await session.commitTransaction();
  res.json({
      message: "Transfer successful",
      transfer: true
  });
});

module.exports = router;
