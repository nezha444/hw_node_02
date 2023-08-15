const { User } = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { SECRET_KEY } = process.env
const { HttpError } = require("../helpers")

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (await User.findOne({ email })) {
      throw HttpError(409, "Email in use")
    }
    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({ ...req.body, password: hashPassword })
    console.log(newUser)
    res.status(201).json({
      user: { email, subscription: newUser.subscription },
    })
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      throw HttpError(401, "Email invalid")
    }

    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      throw HttpError(401, "Password invalid")
    }

    const payload = {
      id: user.id,
    }

    const token = await jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" })
    await User.findByIdAndUpdate(user._id, { token })

    res
      .status(201)
      .json({ token, user: { email, subscription: user.subscription } })
  } catch (error) {
    next(error)
  }
}

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user
  res.status(200).json({ email, subscription })
}

const logoutUser = async (req, res, next) => {
  const { _id } = req.user
  await User.findByIdAndUpdate(_id, { token: null })
  res.json({
    message: "Logout success",
  })
}

module.exports = {
  registerUser,
  loginUser,
  getCurrent,
  logoutUser,
}
