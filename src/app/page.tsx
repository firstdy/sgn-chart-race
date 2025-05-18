"use client";

import React, { useEffect, useRef, useState } from "react";

import * as d3 from "d3";

/* ───────────── TYPES ───────────── */
type Region = "Africa" | "Americas" | "Asia" | "Europe" | "Oceania" | "North America" | "South America" | "Other" ;
interface Country {
  name: string;
  value: number;
  region: Region;
  flag: string;
  year: number;
}
interface Frame {
  year: number;
  countries: Country[];
}

/* ───────────── STYLE CONST ───────────── */
const COLOR: Record<Region, string> = {
  Africa: "#e44e9d",
  Americas: "#29a9ff",
  Asia: "#1e7fe5",
  Europe: "#a557d8",
  Oceania: "#ff6b00",
  "North America": "#9AA374",
  "South America": "#6D1919",
  Other: "red",
};

/* layout / speed */
const W = 1500, H = 500;
const M = { top: 30, right: 220, bottom: 80, left: 110 } as const;
const BAR_H = 45;
const BAR_DURATION = 90; // ms transition
const AUTO_INTERVAL = 100; // ms next frame
const TIMELINE_STEP = 3; // timeline
const MAX_BARS = 9;

/* ───────────── COMPONENT ───────────── */
export default function BarChartRace() {
  const svgRef = useRef<SVGSVGElement>(null);

  const [frames, setFrames] = useState<Frame[]>([]);
  const [idx, setIdx] = useState(0);
  const [play, setPlay] = useState(true);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);

  const lastRef = useRef<number>(performance.now()); 
  const rafId = useRef<number>(0);

  useEffect(() => {
    d3.csv("/population.csv", (row: d3.DSVRowString<string>) => {

      const raw = (row["Value"] ?? row["Population"] ?? row["all years"] ?? "").toString().trim();
      const val = parseInt(raw.replace(/[, ]/g, ""), 10);
      if (Number.isNaN(val)) return;

      const entity = (row["Entity"] as string).replace(/\s*\(UN\)\s*/, "").trim();

      //ignore case entity
       if (entity === 'World' || entity.includes('developed') || entity.includes('countries') || entity.includes('Asia') 
        || entity === 'Small island developing states (SIDS)' || entity == 'Oceania (UN)') {
        return null; 
      }
      const region =((row["region"] as string)?.trim() as Region) ?? (entity as Region);
      const countryToISO: Record<string, string> = {
        "Afghanistan": "af",
        "Democratic Republic of Congo": "cg",
        "Latin America and the Caribbean (UN)": "lv",
        "Russia": "ru",
        "Cote d'Ivoire": "ci",
        "Europe (UN)": "eu",
        "Northern America (UN)": "us",
        "Albania": "al",
        "Algeria": "dz",
        " America (UN)": "as",
        "Americas (UN)": "as",
        "American Samoa": "as",
        "Andorra": "ad",
        "Africa (UN)" : "af",
        "Angola": "ao",
        "Anguilla": "ai",
        "Antigua and Barbuda": "ag",
        "Argentina": "ar",
        "Armenia": "am",
        "Aruba": "aw",
        "Australia": "au",
        "Austria": "at",
        "Azerbaijan": "az",
        "Bahamas": "bs",
        "Bahrain": "bh",
        "Bangladesh": "bd",
        "Barbados": "bb",
        "Belarus": "by",
        "Belgium": "be",
        "Belize": "bz",
        "Benin": "bj",
        "Bermuda": "bm",
        "Bhutan": "bt",
        "Bolivia": "bo",
        "Bosnia and Herzegovina": "ba",
        "Botswana": "bw",
        "Brazil": "br",
        "British Virgin Islands": "vg",
        "Bulgaria": "bg",
        "Burkina Faso": "bf",
        "Burundi": "bi",
        "Cambodia": "kh",
        "Cameroon": "cm",
        "Canada": "ca",
        "Cayman Islands": "ky",
        "Central African Republic": "cf",
        "Chad": "td",
        "Chile": "cl",
        "China": "cn",
        "Colombia": "co",
        "Comoros": "km",
        "Congo": "cg",
        "Cook Islands": "ck",
        "Costa Rica": "cr",
        "Croatia": "hr",
        "Cuba": "cu",
        "Cyprus": "cy",
        "Czechia": "cz",
        "Denmark": "dk",
        "Djibouti": "dj",
        "Dominica": "dm",
        "Dominican Republic": "do",
        "Ecuador": "ec",
        "Egypt": "eg",
        "El Salvador": "sv",
        "Equatorial Guinea": "gq",
        "Eritrea": "er",
        "Estonia": "ee",
        "Eswatini": "sz",
        "Ethiopia": "et",
        "Faroe Islands": "fo",
        "Fiji": "fj",
        "Finland": "fi",
        "France": "fr",
        "French Guiana": "gf",
        "French Polynesia": "pf",
        "Gabon": "ga",
        "Gambia": "gm",
        "Georgia": "ge",
        "Germany": "de",
        "Ghana": "gh",
        "Gibraltar": "gi",
        "Greece": "gr",
        "Greenland": "gl",
        "Grenada": "gd",
        "Guadeloupe": "gp",
        "Guam": "gu",
        "Guatemala": "gt",
        "Guernsey": "gg",
        "Guinea": "gn",
        "Guinea-Bissau": "gw",
        "Guyana": "gy",
        "Haiti": "ht",
        "Honduras": "hn",
        "Hong Kong": "hk",
        "Hungary": "hu",
        "Iceland": "is",
        "India": "in",
        "Indonesia": "id",
        "Iraq": "iq",
        "Ireland": "ie",
        "Isle of Man": "im",
        "Israel": "il",
        "Italy": "it",
        "Jamaica": "jm",
        "Japan": "jp",
        "Jersey": "je",
        "Jordan": "jo",
        "Kazakhstan": "kz",
        "Kenya": "ke",
        "Kiribati": "ki",
        "Kuwait": "kw",
        "Kyrgyzstan": "kg",
        "Latvia": "lv",
        "Lebanon": "lb",
        "Lesotho": "ls",
        "Liberia": "lr",
        "Libya": "ly",
        "Liechtenstein": "li",
        "Lithuania": "lt",
        "Luxembourg": "lu",
        "Macao": "mo",
        "Madagascar": "mg",
        "Malawi": "mw",
        "Malaysia": "my",
        "Maldives": "mv",
        "Mali": "ml",
        "Malta": "mt",
        "Marshall Islands": "mh",
        "Martinique": "mq",
        "Mauritania": "mr",
        "Mauritius": "mu",
        "Mayotte": "yt",
        "Mexico": "mx",
        "Moldova": "md",
        "Monaco": "mc",
        "Mongolia": "mn",
        "Montenegro": "me",
        "Montserrat": "ms",
        "Morocco": "ma",
        "Mozambique": "mz",
        "Myanmar": "mm",
        "Namibia": "na",
        "Nauru": "nr",
        "Nepal": "np",
        "Netherlands": "nl",
        "New Caledonia": "nc",
        "New Zealand": "nz",
        "Nicaragua": "ni",
        "Niger": "ne",
        "Nigeria": "ng",
        "Niue": "nu",
        "North Macedonia": "mk",
        "Northern Mariana Islands": "mp",
        "Norway": "no",
        "Oman": "om",
        "Pakistan": "pk",
        "Palau": "pw",
        "Panama": "pa",
        "Papua New Guinea": "pg",
        "Paraguay": "py",
        "Peru": "pe",
        "Philippines": "ph",
        "Poland": "pl",
        "Portugal": "pt",
        "Puerto Rico": "pr",
        "Qatar": "qa",
        "Romania": "ro",
        "Rwanda": "rw",
        "Saint Kitts and Nevis": "kn",
        "Saint Lucia": "lc",
        "Saint Pierre and Miquelon": "pm",
        "Saint Vincent and the Grenadines": "vc",
        "Samoa": "ws",
        "San Marino": "sm",
        "Sao Tome and Principe": "st",
        "Saudi Arabia": "sa",
        "Senegal": "sn",
        "Serbia": "rs",
        "Seychelles": "sc",
        "Sierra Leone": "sl",
        "Singapore": "sg",
        "Slovakia": "sk",
        "Slovenia": "si",
        "Solomon Islands": "sb",
        "Somalia": "so",
        "South Africa": "za",
        "South Sudan": "ss",
        "Spain": "es",
        "Sri Lanka": "lk",
        "Sudan": "sd",
        "Suriname": "sr",
        "Sweden": "se",
        "Switzerland": "ch",
        "Taiwan": "tw",
        "Tajikistan": "tj",
        "Tanzania": "tz",
        "Thailand": "th",
        "Togo": "tg",
        "Tokelau": "tk",
        "Tonga": "to",
        "Trinidad and Tobago": "tt",
        "Tunisia": "tn",
        "Turkey": "tr",
        "Turkmenistan": "tm",
        "Turks and Caicos Islands": "tc",
        "Tuvalu": "tv",
        "Uganda": "ug",
        "Ukraine": "ua",
        "United Arab Emirates": "ae",
        "United Kingdom": "gb",
        "United States": "us",
        "Uruguay": "uy",
        "Uzbekistan": "uz",
        "Vanuatu": "vu",
        "Venezuela": "ve",
        "Vietnam": "vn",
        "Wallis and Futuna": "wf",
        "Western Sahara": "eh",
        "Yemen": "ye",
        "Zambia": "zm",
        "Zimbabwe": "zw"
      };


      return {
        year: +row["Year"]!,
        name: entity,
        region,
        value: val,
        // flag: (row["flag"] as string) || "",
        flag: (`https://flagcdn.com/w80/${countryToISO[row["Entity"]]}.png` as string),
      };
    }).then((rows: Country[] | undefined) => {
      if (!rows) return;
      const byYear = d3.group(rows, (d: Country) => d.year);
      const list: Frame[] = [];

      // filter regions
      const allRegions = Array.from(new Set(rows.map(d => d.region))).filter(Boolean) as Region[];
      setRegions(allRegions);
      setSelectedRegions(allRegions);

      for (const [year, countries] of byYear) list.push({ year, countries });
      list.sort((a, b) => a.year - b.year);
      setFrames(list);
      setIdx(0);
    });
  }, []);

  useEffect(() => {
    if (!frames.length) return;

    const frame = frames[idx];

    // const data = [...frame.countries].sort((a, b) => b.value - a.value).slice(0, MAX_BARS); // old code
    
    //show selected regions
    const data = [...frame.countries]
    .filter(d => selectedRegions.includes(d.region))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_BARS);

    const x = d3.scaleLinear().domain([0, d3.max(data, (d: Country) => d.value) ?? 1]) .range([M.left, W - M.right]);

    const y = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.name))
      .range([M.top, M.top + BAR_H * data.length])
      .padding(0.1);

    const minY = frames[0].year;
    const maxY = frames.at(-1)!.year;

    const tlScale = d3.scaleLinear().domain([minY, maxY]).range([M.left, W - M.right]);
    const yrsLabel = d3.range(minY, maxY + 1).filter((y: number) => y % TIMELINE_STEP === 0);

    const svg = d3.select(svgRef.current!).attr("viewBox", `0 0 ${W} ${H}`);
    

    /* ---------- X-Axis ---------- */
    svg
      .selectAll<SVGGElement, unknown>("g.axis")
      .data([0])
      .join("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${M.top})`)
      .transition()
      .duration(BAR_DURATION)
      .call(
        d3
          .axisTop(x)
          .ticks(6)
          .tickSize(-BAR_H * data.length)
          .tickFormat((d) => d3.format(",")(d as number))
      )
      .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
      .call((g) => g.select(".domain").attr("stroke", "#fff"))
      .call((g) =>
        g.selectAll("text").attr("fill", "#666").style("font-size", "12px")
      );

    /* ---------- Bars ---------- */
    const barG = svg
      .selectAll("g.bars")
      .data([0])
      .join("g")
      .attr("class", "bars");
    const bars = barG
      .selectAll<SVGGElement, Country>("g.bar")
      .data(data, (d: Country) => d.name);

    /* exit */
    bars
      .exit()
      .transition()
      .duration(BAR_DURATION)
      .attr("transform", `translate(0,${H})`)
      .remove();

    /* enter skeleton */
    const enter = bars
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", `translate(0,${H})`);
    enter.append("rect").attr("height", y.bandwidth()).attr("x", M.left);
    enter.append("text").attr("class", "val").attr("dy", "1.1em");
    enter
      .append("text")
      .attr("class", "name")
      .attr("dy", "1.1em")
      .attr("text-anchor", "end");
    enter.append("circle").attr("stroke", "#eee").attr("stroke-width", 2);
    enter.append("image");

    const all = enter.merge(bars as any);

    all
      .transition()
      .duration(BAR_DURATION)
      .attr("transform", (d: Country) => `translate(0,${y(d.name)})`);

    const r = y.bandwidth() / 2 - 2;

    all
    .select<SVGRectElement>("rect")
    .transition()
    .duration(BAR_DURATION)
    .attr("width", (d: Country) => x(d.value) - M.left)
    .attr("fill", (d: Country) => COLOR[d.region] || "#cccccc")

    all
      .select<SVGTextElement>("text.val")
      .transition()
      .duration(BAR_DURATION)
      .attr("x", (d: Country) => x(d.value) + 8)
      .text((d: Country) => d3.format(",")(d.value));

    all
      .select<SVGTextElement>("text.name")
      .transition()
      .duration(BAR_DURATION)
      .attr("x", M.left - 10)
      .text((d: Country) => d.name);



    const defs = svg.select("defs");
    if (defs.empty()) {
      svg.append("defs");
    }

    const sanitizeId = (name: string) => name.replace(/\W/g, "");

    svg.select("defs")
      .selectAll("clipPath.flagClip")
      .data(data)
      .join("clipPath")
      .attr("class", "flagClip")
      .attr("id", (d: Country) => `clip-flag-${sanitizeId(d.name)}`)
      .html((d: Country) => {
        const cx = x(d.value) - r - 10;
        return `<circle cx="${cx}" cy="20" r="${r}" />`;
      });


    all
      .select<SVGImageElement>("image")
      .attr("href", (d) => d.flag)
      .attr("width", r * 4)
      .attr("height", r * 4)
      .attr("clip-path", (d) => `url(#clip-flag-${sanitizeId(d.name)})`)
      .attr("x", (d: Country) => x(d.value) - r - 30)
      .attr("y", - r + 5);

    // all
    //   .select<SVGCircleElement>("circle")
    //   .transition()
    //   .duration(BAR_DURATION)
    //   .attr("r", r)
    //   .attr("cx", (d: Country) => x(d.value) - r - 4)
    //   .attr("cy", r + 2)
    //   .attr("fill", (d: Country) => COLOR[d.region]);

    /* ---------- Year & Total ---------- */
    svg
      .selectAll("g.label")
      .data([0])
      .join("g")
      .attr("class", "label")
      .call((g) => {
        g.selectAll("text.year")
          .data([frame.year])
          .join("text")
          .attr("class", "year")
          .attr("x", W - 230)
          .attr("y", H - 120)
          .attr("text-anchor", "end")
          .attr("font-size", "96px")
          .attr("fill", "#c5c5c5")
          .attr("font-weight", 600)
          .text((d: number) => d);

        /* Total */
        g.selectAll("text.total")
          .data([d3.sum(data, (d) => d.value)])
          .join("text")
          .attr("class", "total")
          .attr("x", W - 230)
          .attr("y", H - 80)
          .attr("text-anchor", "end")
          .attr("font-size", "30px")
          .attr("fill", "#c5c5c5")
          .text((d: number) => `Total: ${d3.format(",")(d)}`);
      });

    /* ---------- Timeline ---------- */
    const tl = svg
      .selectAll("g.timeline")
      .data([0])
      .join("g")
      .attr("class", "timeline");

    const baseY = H - 32; // y of baseline
    const majorLen = 10;
    const minorLen = 6; 
    const tri = 8; 

    /* baseline -------------------------------------------------- */
    tl.selectAll("line.base")
      .data([0])
      .join("line")
      .attr("class", "base")
      .attr("x1", M.left)
      .attr("x2", W - M.right)
      .attr("y1", baseY)
      .attr("y2", baseY)
      .attr("stroke", "#888");

    tl.selectAll("line.tick-major")
      .data(yrsLabel) 
      .join("line")
      .attr("class", "tick-major")
      .attr("x1", (d: number) => tlScale(d))
      .attr("x2", (d: number) => tlScale(d))
      .attr("y1", baseY)
      .attr("y2", baseY + majorLen) 
      .attr("cursor", "pointer")
      .attr("stroke", "#888");

    const yrsMinor = d3
      .range(minY, maxY + 1)
      .filter((y: number) => y % TIMELINE_STEP !== 0);

    tl.selectAll("line.tick-minor")
      .data(yrsMinor)
      .join("line")
      .attr("class", "tick-minor")
      .attr("x1", (d:number) => tlScale(d))
      .attr("x2", (d:number) => tlScale(d))
      .attr("y1", baseY)
      .attr("y2", baseY + minorLen) 
      .attr("cursor", "pointer")
      .attr("stroke", "#888"); 

    tl.selectAll("text.lbl")
      .data(yrsLabel)
      .join("text")
      .attr("class", "lbl")
      .attr("x", (d) => tlScale(d))
      .attr("y", baseY + minorLen + 20) 
      .attr("text-anchor", "middle")
      .attr("fill", "#777")
      .attr("cursor", "pointer")
      .style("font-size", "11px")
      .text((d: number) => d);

    const pointer = tl
      .selectAll<SVGPathElement, number>("path.ptr")
      .data([frame.year])
      .join("path")
      .attr("class", "ptr")
      .attr("fill", "#888")
      .attr("cursor", "pointer") 
      .attr("d", (d) => {
        const cx = tlScale(d);
        return `M${cx - tri} ${baseY - 8}
            L${cx + tri} ${baseY - 8}
            L${cx}       ${baseY - 0}
            Z`;
      })
      .call(
        d3
          .drag<SVGPathElement, number>()
          .on("start", () => setPlay(false))
          .on("drag", (event: d3.D3DragEvent<SVGPathElement, number, unknown>) => {
            const clampedX = Math.max(M.left, Math.min(W - M.right, event.x));
            const yr = Math.round(tlScale.invert(clampedX));
            const i = d3.bisector<{ year: number }, number>((d) => d.year).left(frames, yr) - 1;
            const newIdx = Math.max(0, Math.min(frames.length - 1, i));
            if (newIdx !== idx) setIdx(newIdx); 
          })
      );


    tl.on("click", (event: MouseEvent) => {
      const [x] = d3.pointer(event);
      const yr = Math.round(
        tlScale.invert(Math.max(M.left, Math.min(W - M.right, x)))
      );
      const newIx = frames.findIndex((f) => f.year === yr);
      if (newIx !== -1 && newIx !== idx) {
        setIdx(newIx);
        lastRef.current = performance.now(); 
        setPlay(false);
      }
    });
  }, [idx, frames]);

  /* -----------------------------------------------------------
   auto-loop
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!play || !frames.length) return;

    const loop = (t: number) => {
      if (t - lastRef.current > AUTO_INTERVAL) {
        setIdx((i) => (i + 1) % frames.length);
        lastRef.current = t; // รีเซ็ต time stamp
      }
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => {
      if (rafId.current !== undefined) cancelAnimationFrame(rafId.current);
    };
  }, [play, frames.length]);

  /* ── 4. RENDER ──────────────────────────────────────────── */
  return (
    <div
      style={{
        position: "relative",
        width: W,
        margin: "0 auto",
        marginTop: 50,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div className="font-bold text-[36px]">Population growth per country 1950 to 2021</div>
      <div className="flex items-center gap-2 text-[24px] mb-5">Click on the legend below to filter by continent
        <img src="/hand-point-down.svg" width={30} height={30}></img>
      </div>
      <div style={{ position: "relative", left: 30, fontSize: 13 }}>
        <span style={{ fontSize: 16, fontWeight: "bold", color: "#000000" }}>
          Region
        </span>
        {Object.entries(COLOR).map(([r, c]) => {
          const region = r as Region;
          const active = selectedRegions.includes(region);

          const handleClick = () => {
            if (active && selectedRegions.length === 1) {
              // Prevent toggling off the last remaining region
              return;
            }

            setSelectedRegions((prev) =>
              active
                ? prev.filter((x) => x !== region)
                : [...prev, region]
            );
          };

          return (
            <span
              key={r}
              onClick={handleClick}
              style={{
                marginLeft: 14,
                cursor: active && selectedRegions.length === 1 ? "not-allowed" : "pointer",
                color: active ? "#000" : "#999",
                opacity: active ? 1 : 0.4,
                userSelect: "none",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: c,
                  marginRight: 4,
                  borderRadius: 2,
                  opacity: active ? 1 : 0.3,
                  transition: "opacity 0.2s",
                }}
              />
              {r}
            </span>
          );
        })}
      </div>
      {frames.length === 0 && <p style={{ textAlign: "center" }}>Loading…</p>}
      <svg ref={svgRef} width={W} height={H} />
      {/* play / pause */}
      <button
        onClick={() => setPlay((p) => !p)}
        style={{
          position: "relative",
          left: 30,
          bottom: 50,
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "#333",
          color: "#fff",
          border: "none",
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,.3)",
          cursor: "pointer",
        }}
      >
        {play ? "❚❚" : "▶"}
      </button>
      {/* <div style={{ position: "relative", left: 30, fontSize: 13 }}>
        <span style={{ fontSize: 16, fontWeight: "bold", color: "#000000" }}>
          Region
        </span>
        {Object.entries(COLOR).map(([r, c]) => (
          <span key={r} style={{ marginLeft: 14, color: "#000000" }}>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: c,
                marginRight: 4,
              }}
            />
            {r}
          </span>
        ))}
      </div> */}
      <div>Source: <a className="underline underline-offset-1" href="https://ourworldindata.org/" target="_blank">Our World In Data</a></div>
    </div>
  );
}
