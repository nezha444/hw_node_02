const { Contact } = require("../models/contact")

const listContacts = async (req, res, next) => {
  try {
    const { _id: owner } = req.user
    const contacts = await Contact.find({ owner }).populate(
      "owner",
      "email subscription"
    )
    if (!contacts) throw HttpError(404, "Not found")
    res.status(200).json(contacts)
  } catch (error) {
    next(error)
  }
}

const getContactById = async (req, res, next) => {
  try {
    const { _id: owner } = req.user
    const contact = await Contact.findById(req.params.contactId)
    if (!contact) throw HttpError(404, "Not found")
    res.status(200).json(contact)
  } catch (error) {
    next(error)
  }
}

const addContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user
    const contact = await Contact.create({ ...req.body, owner })
    if (!contact) throw HttpError(400, "missing required name field")
    res.status(201).json(contact)
  } catch (error) {
    next(error)
  }
}

const removeContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndRemove(req.params.contactId)
    if (!contact) throw HttpError(404, "Not found")
    res.status(200).json({ message: "contact deleted" })
  } catch (error) {
    next(error)
  }
}

const updateContact = async (req, res, next) => {
  try {
    const updContact = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
      { new: true }
    )

    if (!updContact) throw HttpError(404, "Not found")
    res.status(200).json(updContact)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
}
