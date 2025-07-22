document.addEventListener("DOMContentLoaded", function () {
  const listingData = document.getElementById("listing-data");
  if (!listingData) return console.error("listing-data div not found!");

  const coordinates = JSON.parse(listingData.dataset.coordinates);
  const title = listingData.dataset.title;
  const location = listingData.dataset.location;

  const longitude = coordinates[0];
  const latitude = coordinates[1];

  const map = L.map("map").setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap & CartoDB'
}).addTo(map);

  L.marker([latitude, longitude]).addTo(map)
    .bindPopup("<b>" + location + "</b><br>" + "Exact Location will be provided after booking")
    .openPopup();
});