const { User } = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { SECRET_KEY, LOCAL_URL } = process.env
const { HttpError, transport } = require("../helpers")
const gravatar = require("gravatar")
const fs = require("fs/promises")
const path = require("path")
const Jimp = require("jimp")
const { nextTick } = require("process")
const { nanoid } = require("nanoid")
const nodemailer = require("nodemailer")
const { accessSync } = require("fs")
const pathAvatar = path.join(__dirname, "../", "public", "avatar")

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (await User.findOne({ email })) {
      throw HttpError(409, "Email in use")
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const avatarURL = gravatar.url(email)

    const verificationCode = nanoid()
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationCode,
    })

    const verifyEmail = {
      from: "webnezha@meta.ua",
      to: email,
      subject: "Verification",
      html: `<a href="${LOCAL_URL}/api/auth/virify/${verificationCode}" target='_blank'>Vereficate account</a>`,
      // html: `<p>Спасибо за регистрацию, для продолжения перейдите по ссылек <a href="${LOCAL_URL}/api/auth/virify/${verificationCode}" target='_blank'>Vereficate account </a></p>`,
    }

    await transport
      .sendMail(verifyEmail)
      .then(() => console.log("Email send success"))
      .catch((e) => console.log(e))

    res.status(201).json({
      user: { email, subscription: newUser.subscription },
    })
  } catch (error) {
    next(error)
  }
}

const verifyEmail = async (req, res, next) => {
  const { verificationCode } = req.params
  const user = await User.findOne({ verificationCode })
  if (!user) {
    throw HttpError(401, "Email not found")
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationCode: "" })

  res.json({ message: "Veify success" })
}

const resendVerifyEmail = async (req, res, next) => {
  const { email } = req.body
  const user = User.findOne({ email })
  if (!user) {
    throw HttpError(401, "Email not found")
  }
  if (user.verify) {
    throw HttpError(401, "Email already verify")
  }
  const verifyEmail = {
    from: "webnezha@meta.ua",
    to: email,
    subject: "Verification",
    html: `<a href="${LOCAL_URL}/api/auth/virify/${user.verificationCode}" target='_blank'>Vereficate account</a>`,
    // html: `<p>Спасибо за регистрацию, для продолжения перейдите по ссылек <a href="${LOCAL_URL}/api/auth/virify/${verificationCode}" target='_blank'>Vereficate account </a></p>`,
  }

  await transport
    .sendMail(verifyEmail)
    .then(() => console.log("Email send success"))
    .catch((e) => console.log(e))

  res.join({ message: "Email send success" })
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

    if (!user.verify) {
      throw HttpError(401, "Email not verified")
    }

    const payload = {
      id: user.id,
    }

    const token = await jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" })
    await User.findByIdAndUpdate(user._id, { token })

    res.status(201).json({ token, user: { email, subscription: user.subscription } })
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

const updAvatar = async (req, res, next) => {
  const { _id } = req.user
  const oldPath = req.file.path
  const name = req.file.originalname

  await Jimp.read(oldPath)
    .then((img) => {
      img.resize(250, 250) // resize
      img.writeAsync(oldPath)
    })
    .catch((err) => {
      next(err)
    })

  const newName = `${_id}_${name}`
  const newPath = path.join(pathAvatar, newName)
  await fs.rename(oldPath, newPath)
  const avatarURL = path.join("avatar", newName)
  await User.findByIdAndUpdate(_id, { avatarURL })
  res.join({ avatarURL: avatar })
}

module.exports = {
  registerUser,
  verifyEmail,
  resendVerifyEmail,
  loginUser,
  getCurrent,
  logoutUser,
  updAvatar,
}
