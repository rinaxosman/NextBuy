const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

app.get("/", (req, res) => res.send("Server is running!"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// connect to mongoDB
// mongoose.connect("mongodb://localhost:27017/wishlist", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

mongoose.connect("mongodb://localhost:27017/wishlist");


const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Connected to MongoDB!"));

// Convert Currency

const convertCurrency = async (price, fromCurrency, toCurrency) => {
    try {
        const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
        );
        const rate = response.data.rates[toCurrency];
        const convertedPrice = (parseFloat(price) * rate).toFixed(2);
        return `${toCurrency} ${convertedPrice}`;
    } catch (error) {
        console.error("Currency conversion error:", error.message);
        return price; // Fallback to the original price if conversion fails
    }
};


// endpoint for URL submission

const WishlistItem = require("./models/WishlistItem");
const axios = require("axios");
const cheerio = require("cheerio");

app.post("/add-item", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ message: "URL is required." });
    }

    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);

        // Extract image
        let image = $('meta[property="og:image"]').attr("content");
        if (!image) {
            image = $("img").first().attr("src");
        }
        if (!image.startsWith("http")) {
            const baseUrl = new URL(url).origin;
            image = baseUrl + image;
        }

        // Remove the price extraction logic:
        // let price = "Price not available";

        console.log("Extracted Image:", image);

        // Save to database
        const newItem = new WishlistItem({ url, image /* , price */ });
        await newItem.save();

        res.json(newItem);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error code
            return res.status(400).json({ message: "Item already exists in the wishlist." });
        }
        console.error("Error adding item:", error.message);
        res.status(500).json({ message: "Error adding item to wishlist." });
    }
});



app.get("/wishlist", async (req, res) => {
    try {
        const items = await WishlistItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).send("Error fetching wishlist.");
    }
});

app.delete("/remove-item/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await WishlistItem.findByIdAndDelete(id);
        res.status(200).json({ message: "Item removed successfully" });
    } catch (error) {
        console.error("Error removing item:", error);
        res.status(500).json({ message: "Error removing item" });
    }
});

app.patch("/mark-purchased/:id", async (req, res) => {
    try {
        const item = await WishlistItem.findByIdAndUpdate(
            req.params.id,
            { purchased: true },
            { new: true }
        );
        res.json(item);
    } catch (error) {
        console.error("Error marking as purchased:", error.message);
        res.status(500).json({ message: "Error marking item as purchased." });
    }
});

app.patch("/return-to-wishlist/:id", async (req, res) => {
    try {
        const item = await WishlistItem.findByIdAndUpdate(
            req.params.id,
            { purchased: false },
            { new: true }
        );
        res.json(item);
    } catch (error) {
        console.error("Error returning item to wishlist:", error.message);
        res.status(500).json({ message: "Error returning item to wishlist." });
    }
});
