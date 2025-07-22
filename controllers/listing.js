const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

// module.exports.createListing = async (req, res, next) => {
//   let url = req.file.path;
//   let filename = req.file.filename;
//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;
//   newListing.image = { url, filename };
//   await newListing.save();
//   req.flash("success", "New Listing Created!");
//   res.redirect("/listings");
// };

module.exports.createListing = async (req, res, next) => {
  try {
    const { listing } = req.body; // form se listing object
    const location = listing.location;

    // Geocode karo Nominatim se
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        location
      )}&format=json`,
      {
        headers: { "User-Agent": "YourAppName/1.0 (youremail@example.com)" },
      }
    );
    const data = await response.json();

    if (data.length === 0) {
      req.flash("error", "Location not found!");
      return res.redirect("/listings/new");
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    // Naya listing banao
    const newListing = new Listing(listing);

    // Geometry add karo (lat/lon)
    newListing.geometry = {
      type: "Point",
      coordinates: [lon, lat],
    };

    // Image agar upload hui ho to add karo
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    newListing.owner = req.user._id; // owner set karo

    await newListing.save();
    console.log("saved listing geometry:", newListing.geometry);

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// module.exports.updateListing = async (req, res) => {
//   let { id } = req.params;
//   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = { url, filename };
//     await listing.save();
//   }
//   req.flash("success", "Listing Updated");
//   res.redirect(`/listings/${id}`);
// };


module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  //  Find the listing
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // Update basic fields from form
  Object.assign(listing, req.body.listing);

  //  Update image if new one uploaded
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  //  Geocode updated location & country
  const location = req.body.listing.location;
  const country = req.body.listing.country;
  if (location && country) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        `${location}, ${country}`
      )}&format=json`,
      {
        headers: { "User-Agent": "YourAppName/1.0 (youremail@example.com)" },
      }
    );
    const data = await response.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      listing.geometry = {
        type: "Point",
        coordinates: [lon, lat],
      };
    } else {
      console.log(" Geocoding: Location not found. Keeping previous coordinates.");
    }
  }

  await listing.save();
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
