(function () {
  const STORAGE_SELECTED_POLICY_KEY = "iptp_ui_selected_policy";
  const STORAGE_LAST_RESULTS_KEY = "iptp_ui_last_results";

  function safeStore(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_ignore) {
      // Ignore storage failures in private mode or restricted contexts.
    }
  }

  function wireFilterMenus() {
    const filterButtons = document.querySelectorAll(".filter-button[aria-controls]");
    const filterLists = document.querySelectorAll(".filters-menu");

    for (let i = 0; i < filterButtons.length; i += 1) {
      filterButtons[i].addEventListener("click", function (e) {
        e.stopPropagation();

        filterButtons.forEach((btn, index) => {
          if (index !== i) {
            btn.setAttribute("aria-expanded", "false");
          }
        });
        filterLists.forEach((menu) => menu.setAttribute("hidden", "hidden"));

        const menu = document.getElementById(this.getAttribute("aria-controls"));
        const expanded = this.getAttribute("aria-expanded") === "true";
        if (expanded) {
          this.setAttribute("aria-expanded", "false");
          if (menu) menu.setAttribute("hidden", "hidden");
        } else {
          this.setAttribute("aria-expanded", "true");
          if (menu) menu.removeAttribute("hidden");
        }
      });
    }

    document.body.addEventListener("click", function () {
      const openButton = document.querySelector('.filter-button[aria-expanded="true"]');
      if (openButton) {
        openButton.setAttribute("aria-expanded", "false");
        const menu = document.getElementById(openButton.getAttribute("aria-controls"));
        if (menu) menu.setAttribute("hidden", "hidden");
      }
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const openButton = document.querySelector('.filter-button[aria-expanded="true"]');
        if (openButton) {
          openButton.setAttribute("aria-expanded", "false");
          const menu = document.getElementById(openButton.getAttribute("aria-controls"));
          if (menu) menu.setAttribute("hidden", "hidden");
        }
      }
    });
  }

  function formatDate(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
  }

  function dateKey(value) {
    if (!value) return 0;
    const s = String(value).slice(0, 10).replace(/-/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  function monthBucket(value) {
    if (!value) return "";
    const s = String(value).slice(0, 7);
    return /^\d{4}-\d{2}$/.test(s) ? s : "";
  }

  function monthLabel(value) {
    const bucket = monthBucket(value);
    if (!bucket) return "Undated";
    const [y, m] = bucket.split("-");
    const monthIdx = Number(m) - 1;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[monthIdx] || "Undated";
    return month === "Undated" ? month : `${month} ${y}`;
  }

  function scoreKey(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : -Infinity;
  }

  function relevanceBand(hit) {
    const band = String((hit && hit.relevance_band) || "").toLowerCase();
    if (band === "high" || band === "medium" || band === "low") return band;
    return "medium";
  }

  function relevanceLabel(hit) {
    const band = relevanceBand(hit);
    if (band === "high") return "High";
    if (band === "low") return "Lower";
    return "Medium";
  }

  function relevancePercent(hit) {
    const p = Number(hit && hit.relevance_probability);
    if (!Number.isFinite(p)) return "";
    return `${Math.round(p * 100)}%`;
  }

  function createResultRow(hit) {
    const row = document.createElement("li");
    row.className = "grid-row timeline__l2__item policy-row";

    const details = document.createElement("div");
    details.className = "grid-col--12 tablet-s:grid-col--8 timeline__policy-trump";
    details.setAttribute("data-policy-id", hit.entry_id || "");

    const metaDate = document.createElement("span");
    metaDate.className = "date announced-date";
    metaDate.textContent = formatDate(hit.announced_date) || "Date unavailable";
    details.appendChild(metaDate);

    const title = document.createElement("h3");
    title.className = "timeline__l2__heading";
    const titleLink = document.createElement("a");
    titleLink.className = "timeline__l2__heading-link";
    const entryId = hit.entry_id || "";
    const detailUrl = new URL("./policy.html", window.location.href);
    if (entryId) {
      detailUrl.searchParams.set("entry_id", entryId);
    }
    titleLink.href = detailUrl.toString();
    titleLink.addEventListener("click", function () {
      safeStore(STORAGE_SELECTED_POLICY_KEY, hit);
    });
    titleLink.textContent = hit.title || `Policy ${hit.entry_id || ""}`.trim();
    title.appendChild(titleLink);
    details.appendChild(title);

    const snippet = document.createElement("p");
    snippet.textContent = hit.snippet || hit.summary || "No snippet available.";
    details.appendChild(snippet);

    const meta = document.createElement("div");
    meta.className = "grid-col--12 tablet-s:grid-col--4 timeline__meta";

    const metaBox = document.createElement("div");
    metaBox.className = "timeline__policy-current";

    const score = document.createElement("h6");
    const scoreValue = typeof hit.rrf_score === "number" ? hit.rrf_score.toFixed(4) : "n/a";
    score.textContent = `RRF score: ${scoreValue}`;
    metaBox.appendChild(score);

    if (hit.relevance_band) {
      const relevance = document.createElement("p");
      const percent = relevancePercent(hit);
      relevance.textContent = `Relevance: ${relevanceLabel(hit)}${percent ? ` (${percent})` : ""}`;
      metaBox.appendChild(relevance);
    }

    const source = document.createElement("p");
    const sources = Array.isArray(hit.sources) ? hit.sources.join(", ") : "";
    source.textContent = `Sources: ${sources || "n/a"}`;
    metaBox.appendChild(source);

    const entry = document.createElement("p");
    entry.textContent = `Entry ID: ${hit.entry_id || "n/a"}`;
    metaBox.appendChild(entry);

    meta.appendChild(metaBox);
    row.appendChild(details);
    row.appendChild(meta);
    return row;
  }

  function clearChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function wireSearch() {
    const form = document.getElementById("main-search");
    const input = document.getElementById("query");
    const resultsRoot = document.getElementById("search-results");
    const feedback = document.getElementById("search-feedback");
    const sortControls = document.getElementById("search-controls");
    const sortSelect = document.getElementById("search-sort");

    if (!form || !input || !resultsRoot || !feedback) return;

    const apiBase = (window.IPTP_SEARCH_API_BASE || "http://127.0.0.1:8010").replace(/\/+$/, "");
    const sortParam = new URLSearchParams(window.location.search).get("sort");
    let sortMode = sortParam === "score" ? "score" : "date";
    if (sortSelect) {
      sortSelect.value = sortMode;
    }
    let latestResults = [];

    async function runSearch(query) {
      const response = await fetch(`${apiBase}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: query,
          final_k: 10,
          bm25_top_k: 20,
          faiss_top_k: 20,
          bm25_oversample: 5,
          faiss_oversample: 5,
          sort_by_announced_date: false
        })
      });

      if (!response.ok) {
        let err = "Search request failed.";
        try {
          const payload = await response.json();
          if (payload && payload.error) err = payload.error;
        } catch (_ignore) {
          // Use default error text.
        }
        throw new Error(err);
      }

      return response.json();
    }

    function setFeedback(message, visible) {
      feedback.textContent = message;
      if (visible) feedback.removeAttribute("hidden");
      else feedback.setAttribute("hidden", "hidden");
    }

    function getDisplayedResults(results) {
      const source = Array.isArray(results) ? results.slice() : [];
      if (sortMode === "score") {
        return source.sort((a, b) => scoreKey(b.rrf_score) - scoreKey(a.rrf_score)).slice(0, 12);
      }
      return source.sort((a, b) => dateKey(b.announced_date) - dateKey(a.announced_date)).slice(0, 12);
    }

    function buildMonthSection(monthText, rows, showMonthHeader) {
      const section = document.createElement("section");
      section.className = "site-section site-section--no-spacing site-section--timeline";

      const timeline = document.createElement("ol");
      timeline.className = "timeline";

      const timelineItem = document.createElement("li");
      timelineItem.className = "grid-row timeline__item";

      const startCol = document.createElement("div");
      startCol.className = "grid-col--12 tablet-s:grid-col--2 timeline__item-start";
      timelineItem.appendChild(startCol);

      const midCol = document.createElement("div");
      midCol.className = "grid-col--12 tablet-s:grid-col--10 timeline__item-mid";

      if (showMonthHeader) {
        const monthHeader = document.createElement("div");
        monthHeader.className = "timeline__header__month";

        const monthGrid = document.createElement("div");
        monthGrid.className = "grid-row grid-col--12";

        const headingCol = document.createElement("div");
        headingCol.className = "grid-col--12 tablet-s:grid-col--8";
        const heading = document.createElement("h2");
        heading.className = "timeline__item-heading";
        heading.textContent = monthText;
        headingCol.appendChild(heading);

        const metaCol = document.createElement("div");
        metaCol.className = "grid-col--12 tablet-s:grid-col--4 timeline__meta";

        monthGrid.appendChild(headingCol);
        monthGrid.appendChild(metaCol);
        monthHeader.appendChild(monthGrid);
        midCol.appendChild(monthHeader);
      }

      const rowList = document.createElement("ol");
      rowList.className = "timeline__l2";
      rows.forEach((row) => rowList.appendChild(row));
      midCol.appendChild(rowList);

      timelineItem.appendChild(midCol);
      timeline.appendChild(timelineItem);
      section.appendChild(timeline);
      return section;
    }

    function groupResultsByRelevance(results) {
      return results.reduce((groups, hit) => {
        groups[relevanceBand(hit)].push(hit);
        return groups;
      }, { high: [], medium: [], low: [] });
    }

    function buildResultBand(label, hits, collapsed) {
      const rows = hits.map((hit) => createResultRow(hit));
      if (!collapsed) {
        return buildMonthSection(`${label} (${hits.length})`, rows, true);
      }

      const details = document.createElement("details");
      details.className = "search-results-disclosure";

      const summary = document.createElement("summary");
      summary.textContent = `${label} (${hits.length})`;
      details.appendChild(summary);
      details.appendChild(buildMonthSection("", rows, false));
      return details;
    }

    function renderResults(results, elapsedMs) {
      const ordered = getDisplayedResults(results);
      clearChildren(resultsRoot);
      resultsRoot.setAttribute("hidden", "hidden");

      if (!ordered.length) {
        setFeedback("No results found.", true);
        if (sortControls) sortControls.style.display = "none";
        return;
      }

      setFeedback(`Found ${ordered.length} result(s) in ${elapsedMs || "?"} ms.`, true);
      if (sortControls) sortControls.style.display = "block";

      const grouped = groupResultsByRelevance(ordered);
      [
        { label: "Top results", hits: grouped.high, collapsed: false },
        { label: "Relevant results", hits: grouped.medium, collapsed: false },
        { label: "More results", hits: grouped.low, collapsed: true }
      ].forEach((section) => {
        if (section.hits.length) {
          resultsRoot.appendChild(buildResultBand(section.label, section.hits, section.collapsed));
        }
      });

      resultsRoot.removeAttribute("hidden");
    }

    async function performSearch(query) {
      const cleanQuery = String(query || "").trim();

      clearChildren(resultsRoot);
      resultsRoot.setAttribute("hidden", "hidden");
      if (sortControls) sortControls.style.display = "none";

      if (!cleanQuery) {
        setFeedback("Enter a search query.", true);
        return;
      }

      setFeedback("Searching...", true);

      try {
        const payload = await runSearch(cleanQuery);
        latestResults = Array.isArray(payload.results) ? payload.results : [];
        safeStore(STORAGE_LAST_RESULTS_KEY, latestResults);
        renderResults(latestResults, payload.elapsed_ms);
      } catch (err) {
        setFeedback(`Search failed: ${err.message}`, true);
      }
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const query = String(input.value || "").trim();
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("query", query);
      } else {
        url.searchParams.delete("query");
      }
      url.searchParams.set("sort", sortMode);
      window.history.replaceState({}, "", url.toString());
      await performSearch(query);
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        sortMode = this.value === "score" ? "score" : "date";
        const url = new URL(window.location.href);
        url.searchParams.set("sort", sortMode);
        window.history.replaceState({}, "", url.toString());
        renderResults(latestResults, "?");
      });
    }

    const initialQuery = new URLSearchParams(window.location.search).get("query");
    if (initialQuery) {
      input.value = initialQuery;
      performSearch(initialQuery);
    }
  }

  wireFilterMenus();
  wireSearch();
})();
