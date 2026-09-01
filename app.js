(function () {
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => "£" + n.toFixed(2);
  let PRODUCTS = [];
  const state = { retailers: new Set() };
  const daysMin = (d) => { const m = String(d || "").match(/\d+/); return m ? +m[0] : 99; };

  // --- postcode -> outward pieces --------------------------------------------------------
  function parsePostcode(raw) {
    const pc = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const m = pc.match(/^([A-Z]{1,2})(\d{1,2}[A-Z]?)(\d[A-Z]{2})?$/);
    if (!m) return null;
    return { area: m[1], district: m[1] + m[2], full: pc };
  }
  function inZone(pcObj, list) {
    if (!pcObj || !list || !list.length) return false;
    return list.includes(pcObj.area) || list.includes(pcObj.district);
  }

  // --- product size class ------------------------------------------------------------------
  const LARGE = /sofa|bed\b|bed frame|mattress|wardrobe|dining table|sideboard|chest of drawers|bookcase|fridge|freezer|washing machine|dishwasher|tumble|cooker|oven|desk|cabinet|shed|bench|lawn ?mower|tv\b.*(4[3-9]|5\d|6\d|7\d|8\d)"/i;
  function classify(p, rule) {
    switch (rule.size) {
      case "always_small": return "small";
      case "always_large": return "large";
      default: return LARGE.test(p.title) || ["mattress", "bed", "furniture"].includes(p.cat) ? "large" : "small";
    }
  }

  // --- landed cost -------------------------------------------------------------------------
  function landed(p, pcObj, collect) {
    const r = window.YAK_RULES[p.retailer];
    if (!r) return null;
    const est = !r.verified;
    if (collect) {
      if (!r.collect) return null;
      let c = r.collect.cost || 0;
      if (r.collect.free_over != null && p.price < r.collect.free_over) c = r.collect.under_cost || c;
      return { total: p.price + c, delivery: c, note: c ? "Click & collect " + fmt(c) : "Click & collect, free", days: "1", est, zone: null };
    }
    if (inZone(pcObj, r.zones.exclude)) return { total: null, note: "Doesn't deliver to " + pcObj.district, est };
    const size = classify(p, r);
    const opts = r.options[size] || r.options.small;
    // cheapest standard option after thresholds
    let best = null;
    for (const o of opts) {
      let cost = (r.feed_cost && p.feed_delivery != null) ? p.feed_delivery : o.cost;
      if (o.free_over != null && p.price >= o.free_over) cost = 0;
      const cand = { cost, name: o.name, days: o.days, from: !!o.from, oest: !!o.estimate };
      if (!best || cand.cost < best.cost) best = cand;
    }
    let surcharged = false;
    if (inZone(pcObj, r.zones.surcharge)) {
      surcharged = true;
      if (r.zones.surcharge_cost != null) best.cost = Math.max(best.cost, r.zones.surcharge_cost);
    }
    const noteParts = [];
    noteParts.push(best.cost === 0 ? "Free delivery" : (best.from ? "Delivery from " : "Delivery ") + fmt(best.cost));
    if (surcharged) noteParts.push(r.zones.surcharge_cost != null ? "remote-area rate" : "remote area: surcharge at checkout");
    return { total: p.price + best.cost, delivery: best.cost, note: noteParts.join(" · "), days: best.days, est: est || best.oest, zone: surcharged ? "surcharge" : null };
  }

  // --- search & render ----------------------------------------------------------------------
  function search(q, cat) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return PRODUCTS.filter((p) => (!cat || p.cat === cat) && terms.every((t) => (p.title + " " + (p.brand || "") + " " + p.retailer).toLowerCase().includes(t)));
  }
  function activeFilterCount() {
    let n = state.retailers.size ? 1 : 0;
    if ($("#pmin").value) n++; if ($("#pmax").value) n++;
    if ($("#freeOnly").checked) n++; if ($("#verifiedOnly").checked) n++; if ($("#collect").checked) n++;
    return n;
  }
  function render() {
    const q = $("#q").value.trim(), pc = $("#pc").value.trim(), cat = $("#cat").value, collect = $("#collect").checked;
    const pmin = parseFloat($("#pmin").value) || 0, pmax = parseFloat($("#pmax").value) || Infinity;
    const freeOnly = $("#freeOnly").checked, verifiedOnly = $("#verifiedOnly").checked, sort = $("#sort").value;
    const pcObj = parsePostcode(pc);
    $("#region").textContent = pc ? (pcObj ? "Delivered prices for " + pcObj.district : "Enter a valid UK postcode") : "Add your postcode for delivered prices";
    const n = activeFilterCount(); const fc = $("#filterCount"); fc.hidden = !n; fc.textContent = n;
    let rows = search(q, cat)
      .filter((p) => !state.retailers.size || state.retailers.has(p.retailer))
      .filter((p) => p.price >= pmin && p.price <= pmax)
      .map((p) => ({ p, l: landed(p, pcObj, collect) })).filter((x) => x.l)
      .filter((x) => !freeOnly || x.l.delivery === 0)
      .filter((x) => !verifiedOnly || !x.l.est);
    const T = (x) => x.l.total ?? 1e9;
    const sorters = {
      landed: (a, b) => T(a) - T(b) || a.p.price - b.p.price,
      landed_desc: (a, b) => T(b) - T(a),
      item: (a, b) => a.p.price - b.p.price,
      delivery: (a, b) => (a.l.delivery ?? 1e9) - (b.l.delivery ?? 1e9) || T(a) - T(b),
      fastest: (a, b) => daysMin(a.l.days) - daysMin(b.l.days) || T(a) - T(b),
      name: (a, b) => a.p.title.localeCompare(b.p.title)
    };
    rows.sort(sorters[sort] || sorters.landed);
    const label = { landed: "cheapest delivered first", landed_desc: "priciest delivered first", item: "cheapest item first", delivery: "cheapest delivery first", fastest: "fastest first", name: "A–Z" }[sort];
    rows = rows.slice(0, 60);
    $("#count").textContent = rows.length ? rows.length + " results · " + label : (collect ? "No collection options for this search" : "No matches — try a broader search or clear filters");
    $("#results").innerHTML = rows.map(({ p, l }) => `
      <article class="card">
        <a class="img" href="${p.link}" target="_blank" rel="nofollow sponsored noopener">${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : ""}</a>
        <div class="body">
          <p class="retailer">${p.retailer}${l.est ? ' <span class="est" title="Delivery rule not yet verified against the retailer policy">estimate</span>' : ""}</p>
          <h3><a href="${p.link}" target="_blank" rel="nofollow sponsored noopener">${p.title}</a></h3>
          <p class="meta">${p.brand ? p.brand + " · " : ""}${p.cat}${l.days ? " · " + l.days + " days" : ""}</p>
        </div>
        <div class="price">
          ${l.total === null ? `<p class="na">${l.note}</p>` : `<p class="total">${fmt(l.total)}</p><p class="break">${fmt(p.price)} item<br>${l.note}</p>`}
          <a class="go" href="${p.link}" target="_blank" rel="nofollow sponsored noopener">Go to ${p.retailer.split(" ")[0]} →</a>
        </div>
      </article>`).join("");
  }

  function buildRetailerChips() {
    const names = [...new Set(PRODUCTS.map((p) => p.retailer))].sort();
    $("#retailers").innerHTML = names.map((n) => `<button type="button" class="chip" aria-pressed="false" data-r="${n}">${n}</button>`).join("");
    $("#retailers").addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on); on ? state.retailers.add(b.dataset.r) : state.retailers.delete(b.dataset.r);
      render();
    });
  }
  fetch("data/products.json").then((r) => r.json()).then((d) => { PRODUCTS = d; buildRetailerChips(); render(); });
  ["#q", "#pc", "#cat", "#collect", "#pmin", "#pmax", "#freeOnly", "#verifiedOnly", "#sort"].forEach((s) => $(s).addEventListener("input", render));
  $("#filtersToggle").addEventListener("click", () => {
    const f = $("#filters"), open = f.hidden; f.hidden = !open; $("#filtersToggle").setAttribute("aria-expanded", open);
  });
  $("#clearFilters").addEventListener("click", () => {
    state.retailers.clear(); document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    ["#pmin", "#pmax"].forEach((s) => ($(s).value = "")); ["#freeOnly", "#verifiedOnly", "#collect"].forEach((s) => ($(s).checked = false));
    render();
  });
  try { const saved = localStorage.getItem("yak_pc"); if (saved) $("#pc").value = saved; } catch (e) {}
  $("#pc").addEventListener("input", () => { try { localStorage.setItem("yak_pc", $("#pc").value); } catch (e) {} });
})();
