const mongoose = require("mongoose");

const WishlistItemSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    purchased: { type: Boolean, default: false }, // New field to track purchased items
    // price: { type: String, required: false }, // Commented out for now
});

module.exports = mongoose.model("WishlistItem", WishlistItemSchema);
