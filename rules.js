// Delivery rules per retailer. This is the part of Yakprice that feeds cannot supply:
// measured across 292k feed rows, only one retailer populated delivery_cost with real
// values. Rules below are hand-written for the prototype. `verified` marks rules taken
// from the retailer's own published policy or feed; unverified ones are typical-industry
// placeholders and are labelled "estimate" in the UI until the policy parser replaces them.
//
// Shape: { free_over, standard, remote_surcharge, remote_excluded, collect, verified, source }
//   free_over        basket value at/above which standard delivery is free (null = never)
//   standard         standard delivery charge below that threshold
//   remote_surcharge extra for Highlands/Islands/NI, or null if same price
//   remote_excluded  true if the retailer will not deliver to remote zones at all
//   collect          true if click-and-collect exists (0 cost)
window.YAK_RULES = {
  "Tooled Up":               { free_over: 50,   standard: 4.95,  remote_surcharge: 12.00, remote_excluded: false, collect: false, verified: true,  source: "feed delivery_cost per product (used when present)" },
  "Luxe Mattress":           { free_over: 0,    standard: 0,     remote_surcharge: null,  remote_excluded: false, collect: false, verified: true,  source: "feed: delivery_cost 0.00 on every product" },
  "Dream Interiors":         { free_over: 300,  standard: 39.00, remote_surcharge: 45.00, remote_excluded: false, collect: false, verified: false, source: "estimate" },
  "Starlight Beds":          { free_over: null, standard: 0,     remote_surcharge: 40.00, remote_excluded: false, collect: false, verified: false, source: "estimate" },
  "Ready Steady Bed":        { free_over: null, standard: 0,     remote_surcharge: 30.00, remote_excluded: true,  collect: false, verified: false, source: "estimate" },
  "Cheap Furniture Warehouse": { free_over: null, standard: 29.99, remote_surcharge: 60.00, remote_excluded: false, collect: true, verified: false, source: "estimate" },
  "Lights 4 Living":         { free_over: 75,   standard: 5.95,  remote_surcharge: 15.00, remote_excluded: false, collect: false, verified: false, source: "estimate" },
  "Gardenista":              { free_over: 100,  standard: 6.95,  remote_surcharge: 25.00, remote_excluded: false, collect: false, verified: false, source: "estimate" },
  "Homespace Direct":        { free_over: null, standard: 24.99, remote_surcharge: 49.00, remote_excluded: true,  collect: false, verified: false, source: "estimate" }
};

// UK postcode areas that most retailers treat as remote / surcharge zones.
window.YAK_REMOTE = {
  areas:     ["BT","IM","GY","JE","HS","ZE","KW","IV","PH","AB","PA","KA27","KA28","PO30","PO31","PO32","PO33","PO34","PO35","PO36","PO37","PO38","PO39","PO40","PO41","TR21","TR22","TR23","TR24","TR25"],
  offshore:  ["GY","JE","IM"]   // Channel Islands & Isle of Man: often excluded outright
};
