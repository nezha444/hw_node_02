const express = require("express")
const contact = require("../../controllers/contacts")
const { authenticate } = require("../../middlewares")

const router = express.Router()

router.get("/", authenticate, contact.listContacts)

router.get("/:contactId", authenticate, contact.getContactById)

router.post("/", authenticate, contact.addContact)

router.delete("/:contactId", authenticate, contact.removeContact)

router.put("/:contactId", authenticate, contact.updateContact)

router.patch("/:contactId/favorite", authenticate, contact.updateContact)

module.exports = router
