const { signupSchema } = require("../types/user");
const { User, Account } = require("../db");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { authMiddleware } = require("../middlewares/auth");
const z = require("zod");
const updateBody = z.object({
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const signinBody = z.object({
  username: z.string().email(),
  password: z.string(),
});
// signup and signin routers
router.use(express.json());
router.post("/signup", async (req, res) => {
  const body = req.body;
  const validate = signupSchema.safeParse(body);

  if (!validate.success) {
    return res.json({
      message: "User already taken/Incorrect inputs",
    });
  }

  const user = await User.findOne({ username: body.username });
  if (user) {
    return res.json({
      message: "user already taken",
    });
  }
  const dbUser = await User.create(body);
  const userId = dbUser._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign({ userId: dbUser._id }, JWT_SECRET);

  res.json({
    message: "user created succesfully",
    token: token,
  });
});

router.post("/signin", async (req, res, next) => {

  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect Inputs",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({
      token: token,
    });
    return;
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

router.put("/", authMiddleware, async (req, res, next) => {
  const { success } = updateBody.safeParse(req.body);

  if (!success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }

  await User.updateOne(
    {
      _id: req.headers.userid,
    },
    req.body
  );

  res.json({
    message: "user updated succesfully",
  });
});

router.get("/bulk", async (req, res, next) => {
  const filter = req.query.filter || "";
  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });
  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

router.get("/me", async (req, res) => {


  const token = req.headers.authorization;

  if (!token) {
    return res.json({
      message: "invalid user",
    });
  }
  try {
    const decode = jwt.verify(token, JWT_SECRET);
    const me = await User.findOne({
      _id: decode.userId,
    });
    const meaccount = await Account.findOne({
      userId: me._id
    })

    res.json({
      msg: "User login found",
      userId: decode.userId,
      user: me.firstName,
      balance: meaccount.balance
    });
  } catch (error) {
    res.json({
      msg: "No Login found",
    });
  }
});

module.exports = router;
