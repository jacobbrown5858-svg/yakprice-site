(function () {
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => "£" + n.toFixed(2);
  let PRODUCTS = [];

  function region(postcode) {
    const pc = (postcode || "").toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z]{1,2}\d/.test(pc)) return null;
    const outward = pc.length > 4 ? pc.slice(0, pc.length - 3) : pc;
    const area = outward.match(/^[A-Z]{1,2}/)[0];
    const district = outward;
    const R = window.YAK_REMOTE;
    if (R.offshore.includes(area)) return { zone: "offshore", label: "Channel Islands / Isle of Man" };
    if (R.areas.includes(area) || R.areas.includes(district)) return { zone: "remote", label: "Highlands, Islands or NI" };
    return { zone: "mainland", label: "UK mainland" };
  }

  function landed(p, reg, collect) {
    const r = window.YAK_RULES[p.retailer] || { free_over: null, standard: 0, remote_surcharge: null, remote_excluded: false, collect: false, verified: false, source: "no rule" };
    if (collect) {
      if (!r.collect) return null;
      return { total: p.price, delivery: 0, note: "Click & collect", verified: r.verified };
    }
    if (reg && reg.zone !== "mainland" && r.remote_excluded) return { total: null, delivery: null, note: "Does not deliver to " + reg.label, verified: r.verified };
    let d;
    if (p.feed_delivery !== null && p.feed_delivery !== undefined) d = p.feed_delivery;       // per-product from feed
    else if (r.free_over !== null && p.price >= r.free_over) d = 0;
    else d = r.standard;
    if (reg && reg.zone !== "mainland" && r.remote_surcharge !== null) d = Math.max(d, r.remote_surcharge);
    const note = d === 0 ? "Free delivery" : "Delivery " + fmt(d) + (reg && reg.zone !== "mainland" ? " (" + reg.label + ")" : "");
    return { total: p.price + d, delivery: d, note, verified: r.verified };
  }

  function search(q, cat) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return PRODUCTS.filter((p) => (!cat || p.cat === cat) && terms.every((t) => (p.title + " " + (p.brand || "") + " " + p.retailer).toLowerCase().includes(t)));
  }

  function render() {
    const q = $("#q").value.trim();
    const pc = $("#pc").value.trim();
    const cat = $("#cat").value;
    const collect = $("#collect").checked;
    const reg = region(pc);
    $("#region").textContent = pc ? (reg ? "Delivering to " + reg.label : "Enter a valid UK postcode") : "Enter a postcode to see delivered prices";

    let rows = search(q, cat).map((p) => ({ p, l: landed(p, reg, collect) })).filter((x) => x.l);
    rows.sort((a, b) => (a.l.total ?? 1e9) - (b.l.total ?? 1e9) || a.p.price - b.p.price);
    rows = rows.slice(0, 60);

    $("#count").textContent = rows.length ? rows.length + " results, cheapest delivered first" : (collect ? "No collection options in this sample yet" : "No matches — try a broader search");
    $("#results").innerHTML = rows.map(({ p, l }) => `
      <article class="card">
        <a class="img" href="${p.link}" target="_blank" rel="nofollow sponsored noopener">${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : ""}</a>
        <div class="body">
          <p class="retailer">${p.retailer}${l.verified ? "" : ' <span class="est" title="Delivery rule not yet verified against the retailer policy">estimate</span>'}</p>
          <h3><a href="${p.link}" target="_blank" rel="nofollow sponsored noopener">${p.title}</a></h3>
          <p class="meta">${p.brand ? p.brand + " · " : ""}${p.cat}</p>
        </div>
        <div class="price">
          ${l.total === null ? `<p class="na">${l.note}</p>` : `
          <p class="total">${fmt(l.total)}</p>
          <p class="break">${fmt(p.price)} item<br>${l.note}</p>`}
          <a class="go" href="${p.link}" target="_blank" rel="nofollow sponsored noopener">Go to ${p.retailer.split(" ")[0]} →</a>
        </div>
      </article>`).join("");
  }

  fetch("data/products.json").then((r) => r.json()).then((d) => { PRODUCTS = d; render(); });
  ["#q", "#pc", "#cat", "#collect"].forEach((s) => $(s).addEventListener("input", render));
  try { const savedPc = localStorage.getItem("yak_pc"); if (savedPc) $("#pc").value = savedPc; } catch (e) {}
  $("#pc").addEventListener("input", () => { try { localStorage.setItem("yak_pc", $("#pc").value); } catch (e) {} });
})();
