const { Schema, model } = require("mongoose")
const Joi = require("joi")

const { handleMongooseError } = require("../helpers")

const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 6,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: pattern,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false }
)

userSchema.post("save", handleMongooseError)

const registerSchema = Joi.object({
  password: Joi.string().required().min(6),
  email: Joi.string().required().pattern(pattern),
  subscription: Joi.string(),
})

const loginSchema = Joi.object({
  password: Joi.string().required().min(6),
  email: Joi.string().required().pattern(pattern),
})

const schemas = {
  registerSchema,
  loginSchema,
}

const User = model("user", userSchema)

module.exports = {
  User,
  schemas,
}
