const mongoose = require("mongoose");
const Listing = require("../models/listing");  // apne model ka sahi path check karlo
const { data: sampleListings } = require("./data"); // init/data.js se import ho raha hai

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(" DB Connection Error:", err));

async function updateOldListings() {
  for (let listing of sampleListings) {
    const updated = await Listing.updateOne(
      { title: listing.title }, // purani listing ke title se match karke
      { $set: { geometry: listing.geometry } } // geometry update kar do
    );
    if (updated.matchedCount > 0) {
      console.log(` Updated geometry for: ${listing.title}`);
    } else {
      console.log(`  Listing not found in DB: ${listing.title}`);
    }
  }
  mongoose.connection.close();
}

updateOldListings();
