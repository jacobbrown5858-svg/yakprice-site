// Delivery rules per retailer, taken from each retailer's published delivery policy on
// the date shown. This is the data that affiliate feeds do not carry (measured 2026-09-01:
// only 1 of 14 feeds had real delivery_cost values), so it is maintained here per retailer
// and refreshed when the policy page changes.
//
// Shape per retailer:
//   verified   true when every number below was read from the retailer's own policy/feed
//   source     URL read, and date
//   size       how to classify a product: "small" | "large" decided by classify(p)
//   options    keyed by size class; each is a list of {name, cost, free_over, days}
//   collect    {cost, note} or null
//   zones      { exclude: [postcode districts/areas not served], surcharge: [..], surcharge_cost, note }
//   feed_cost  true if the product feed carries a per-product delivery_cost to use directly
window.YAK_RULES = {
  "Currys": {
    verified: true, source: "currys.co.uk/services/delivery-installation/delivery-collection.html, read 2026-09-01",
    size: "large_if_appliance_or_tv43",
    options: {
      small: [{ name: "Standard (3-5 working days)", cost: 3.99, free_over: 40, days: "3-5" }, { name: "Next day", cost: 5.99, free_over: null, days: "1" }],
      large: [{ name: "Standard (4 working days)", cost: 20, free_over: null, days: "4", from: true }, { name: "Next day", cost: 30, free_over: null, days: "1", from: true }]
    },
    collect: { cost: 0, note: "Order & collect in as little as an hour" },
    zones: { exclude: [], surcharge: [], surcharge_cost: null, note: "Policy page does not publish regional surcharges; checkout may vary" }
  },
  "Wickes": {
    verified: true, source: "wickes.co.uk/deliverydetails + /delivery-exclusions, read 2026-09-01",
    size: "large_if_bulky_or_over_375kg",
    options: {
      small: [{ name: "Standard next day (order by 6pm)", cost: 5, free_over: null, days: "1", from: true }],
      large: [{ name: "Big & Bulky Mon-Fri", cost: 35, free_over: 750, days: "1-6" }]
    },
    collect: { cost: 0, note: "Click & Collect free, from 15 minutes" },
    zones: {
      exclude: ["BT","HS","KA27","KA28","KW15","KW16","KW17","PA42","PA43","PA44","PA45","PA46","PA47","PA48","PA49","PA60","PA61","PA62","PA63","PA64","PA65","PA66","PA67","PA68","PA69","PA70","PA71","PA72","PA73","PA74","PA75","PA76","PA77","PA78","PH42","PH43","PH44","TR21","TR22","TR23","TR24","TR25","ZE"],
      surcharge: ["AB","DG","IV","LD","PL","TD","TR","FK17","FK18","FK19","FK20","FK21","KW1","KW2","KW3","KW4","KW5","KW6","KW7","KW8","KW9","KW10","KW11","KW12","KW13","KW14","PA16","PA20","PA21","PA22","PA23","PA24","PA25","PA26","PA27","PA28","PA29","PA30","PA31","PA32","PA33","PA34","PA35","PA36","PA37","PA38","PA80"],
      surcharge_cost: null, note: "Restricted service (longer lead time) in surcharge areas; no published extra charge"
    }
  },
  "very.co.uk": {
    verified: true, source: "very.co.uk/next-day-delivery.page, read 2026-09-01",
    size: "large_if_furniture_or_appliance",
    options: {
      small: [{ name: "Standard (3-5 days)", cost: 3.99, free_over: 75, days: "3-5" }, { name: "Next day", cost: 5.99, free_over: null, days: "1" }],
      large: [{ name: "Standard large item", cost: 8.99, free_over: null, days: "3-21", from: true, max: 34.99 }, { name: "Next day large item", cost: 13.99, free_over: null, days: "1", from: true, max: 49.99 }]
    },
    collect: { cost: 0, free_over: 30, under_cost: 3, note: "Click & Collect free on orders of £30+ (small items)" },
    zones: { exclude: [], surcharge: [], surcharge_cost: null, note: "Delivers UK-wide; remote areas (Highlands, NI) may take longer" }
  },
  "Furniture Box": {
    verified: true, source: "furniturebox.co.uk/pages/delivery, read 2026-09-01",
    size: "always_large",
    options: { small: [{ name: "Free next working day", cost: 0, free_over: 0, days: "1" }], large: [{ name: "Free next working day", cost: 0, free_over: 0, days: "1" }] },
    collect: null,
    zones: { exclude: [], surcharge: ["AB","PH","IV","KW","HS","ZE","BT","IM","TR21","TR22","TR23","TR24","TR25","PA20","PA41","PA42","PA43","PA44","PA45","PA46","PA47","PA48","PA49","PA60","PA61","PA62","PA63","PA64","PA65","PA66","PA67","PA68","PA69","PA70","PA71","PA72","PA73","PA74","PA75","PA76","PA77","PA78"],
             surcharge_cost: null, note: "Surcharge for Highlands (AB/PH), Scottish Islands, NI, Isle of Man, Isles of Scilly — amount shown only at checkout" }
  },
  "Emma UK": {
    verified: true, source: "emma-sleep.co.uk/free-delivery-free-return/, read 2026-09-01",
    size: "always_large",
    options: { small: [{ name: "Free delivery", cost: 0, free_over: 0, days: "2-5" }], large: [{ name: "Free delivery", cost: 0, free_over: 0, days: "2-5" }] },
    collect: null,
    zones: { exclude: [], surcharge: ["BT","IM","ZE","JE","HS","GY","TR21","TR22","TR23","TR24","TR25","KW15","KW16","KW17","PH41","PH42","PH43","PH44","PH45","IV40","IV41","IV42","IV43","IV44","IV45","IV46","IV47","IV48","IV49","IV50","IV51","IV52","IV53","IV54","IV55","IV56","PO30","PO31","PO32","PO33","PO34","PO35","PO36","PO37","PO38","PO39","PO40","PO41","PA31","PA32","PA33","PA34","PA35","PA36","PA37","PA38","PA39","PA40","PA41","PA42","PA43","PA44","PA45","PA46","PA47","PA48","PA49","PA60","PA61","PA62","PA63","PA64","PA65","PA66","PA67","PA68","PA69","PA70","PA71","PA72","PA73","PA74","PA75","PA76","PA77","PA78","PA80"],
             surcharge_cost: null, note: "Standard delivery free; 'comfort' two-person delivery not offered in these postcodes" }
  },
  "AO.com": {
    verified: false, source: "ao.com help (partial: NI £32; Highlands may be unavailable or surcharged) — full page not yet read",
    size: "large_if_appliance_or_tv43",
    options: { small: [{ name: "Standard", cost: 0, free_over: 0, days: "1-3", estimate: true }], large: [{ name: "Standard", cost: 0, free_over: 0, days: "1-3", estimate: true }] },
    collect: null,
    zones: { exclude: ["JE","GY","IM"], surcharge: ["BT","HS","ZE","KW","IV","PA","PH"], surcharge_cost: 32, note: "Northern Ireland £32 (verified); Highlands surcharge amount not published" }
  },
  "Homebase": {
    verified: false, source: "homebase.co.uk help (partial: free standard delivery over £100; free Click & Collect) — full page not yet read",
    size: "large_if_bulky_or_over_375kg",
    options: { small: [{ name: "Standard", cost: 4.95, free_over: 100, days: "3-5", estimate: true }], large: [{ name: "Standard", cost: 30, free_over: 100, days: "3-7", estimate: true }] },
    collect: { cost: 0, note: "Free Click & Collect (verified)" },
    zones: { exclude: [], surcharge: ["BT","HS","ZE","KW","IV","IM","JE","GY","TR21","TR22","TR23","TR24","TR25"], surcharge_cost: null, note: "estimate" }
  },
  "Wayfair UK": {
    verified: false, source: "not yet read (wayfair.co.uk blocked in browser session)",
    size: "always_large",
    options: { small: [{ name: "Standard", cost: 4.99, free_over: 40, days: "2-5", estimate: true }], large: [{ name: "Standard", cost: 4.99, free_over: 40, days: "3-10", estimate: true }] },
    collect: null,
    zones: { exclude: ["JE","GY"], surcharge: ["BT","HS","ZE","KW","IV","IM"], surcharge_cost: null, note: "estimate" }
  },
  // Sample-feed retailers (prototype data)
  "Tooled Up":       { verified: true,  source: "feed delivery_cost per product", feed_cost: true, size: "always_small", options: { small: [{ name: "Standard", cost: 4.95, free_over: 50, days: "1-3" }], large: [{ name: "Standard", cost: 4.95, free_over: 50, days: "1-3" }] }, collect: null, zones: { exclude: [], surcharge: ["BT","HS","ZE","KW","IV","IM","JE","GY"], surcharge_cost: 12, note: "typical courier surcharge (estimate)" } },
  "Luxe Mattress":   { verified: true,  source: "feed: delivery_cost 0.00 on every product", size: "always_large", options: { small: [{ name: "Free delivery", cost: 0, free_over: 0, days: "3-7" }], large: [{ name: "Free delivery", cost: 0, free_over: 0, days: "3-7" }] }, collect: null, zones: { exclude: [], surcharge: [], surcharge_cost: null, note: "" } },
  "Dream Interiors": { verified: false, source: "estimate", size: "always_large", options: { small: [{ name: "Standard", cost: 39, free_over: 300, days: "5-10", estimate: true }], large: [{ name: "Standard", cost: 39, free_over: 300, days: "5-10", estimate: true }] }, collect: null, zones: { exclude: ["JE","GY","IM"], surcharge: ["BT","HS","ZE","KW","IV","AB","PH"], surcharge_cost: 45, note: "estimate" } },
  "Starlight Beds":  { verified: false, source: "estimate", size: "always_large", options: { small: [{ name: "Free delivery", cost: 0, free_over: 0, days: "2-5", estimate: true }], large: [{ name: "Free delivery", cost: 0, free_over: 0, days: "2-5", estimate: true }] }, collect: null, zones: { exclude: [], surcharge: ["BT","HS","ZE","KW","IV","IM","JE","GY"], surcharge_cost: 40, note: "estimate" } },
  "Ready Steady Bed":{ verified: false, source: "estimate", size: "always_large", options: { small: [{ name: "Free delivery", cost: 0, free_over: 0, days: "2-5", estimate: true }], large: [{ name: "Free delivery", cost: 0, free_over: 0, days: "2-5", estimate: true }] }, collect: null, zones: { exclude: ["BT","HS","ZE","IM","JE","GY"], surcharge: ["KW","IV","AB","PH"], surcharge_cost: 30, note: "estimate" } },
  "Cheap Furniture Warehouse": { verified: false, source: "estimate", size: "always_large", options: { small: [{ name: "Standard", cost: 29.99, free_over: null, days: "3-7", estimate: true }], large: [{ name: "Standard", cost: 29.99, free_over: null, days: "3-7", estimate: true }] }, collect: { cost: 0, note: "Collect from warehouse (estimate)" }, zones: { exclude: [], surcharge: ["BT","HS","ZE","KW","IV","IM","JE","GY"], surcharge_cost: 60, note: "estimate" } },
  "Lights 4 Living": { verified: false, source: "estimate", size: "always_small", options: { small: [{ name: "Standard", cost: 5.95, free_over: 75, days: "2-4", estimate: true }], large: [{ name: "Standard", cost: 5.95, free_over: 75, days: "2-4", estimate: true }] }, collect: null, zones: { exclude: [], surcharge: ["BT","HS","ZE","KW","IV","IM","JE","GY"], surcharge_cost: 15, note: "estimate" } },
  "Gardenista":      { verified: false, source: "estimate", size: "always_large", options: { small: [{ name: "Standard", cost: 6.95, free_over: 100, days: "2-5", estimate: true }], large: [{ name: "Standard", cost: 6.95, free_over: 100, days: "2-5", estimate: true }] }, collect: null, zones: { exclude: [], surcharge: ["BT","HS","ZE","KW","IV","IM","JE","GY"], surcharge_cost: 25, note: "estimate" } },
  "Homespace Direct":{ verified: false, source: "estimate", size: "always_large", options: { small: [{ name: "Standard", cost: 24.99, free_over: null, days: "5-10", estimate: true }], large: [{ name: "Standard", cost: 24.99, free_over: null, days: "5-10", estimate: true }] }, collect: null, zones: { exclude: ["BT","HS","ZE","IM","JE","GY"], surcharge: ["KW","IV","AB","PH"], surcharge_cost: 49, note: "estimate" } }
};
