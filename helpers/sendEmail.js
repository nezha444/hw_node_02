const nodemailer = require("nodemailer")
require("dotenv").config()

const { META_PASSWORD } = process.env

const nodemailerConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  ayth: {
    user: "webnezha@meta.ua",
    pass: META_PASSWORD,
  },
}

const transport = nodemailer.createTransport(nodemailerConfig)

module.exports = transport
// const email = {
//   to: `bazilik2452@gmail.com`,
//   from: "webnezha@meta.ua",
//   subject: "Verification",
//   html: `<a href="youtube.com" target='_blank'>Vereficate account</a>`,
// }

// transport
//   .sendMail(email)
//   .then(() => console.log("Email send success"))
//   .catch((e) => console.log(e))
