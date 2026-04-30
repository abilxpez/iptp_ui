(function () {
  const STORAGE_SELECTED_POLICY_KEY = "iptp_ui_selected_policy";
  const STORAGE_LAST_RESULTS_KEY = "iptp_ui_last_results";

  function safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (_ignore) {
      return null;
    }
  }

  function readStore(key) {
    try {
      return safeParse(window.localStorage.getItem(key) || "null");
    } catch (_ignore) {
      return null;
    }
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function pickPolicy() {
    const params = new URLSearchParams(window.location.search);
    const entryId = params.get("entry_id");
    const selected = readStore(STORAGE_SELECTED_POLICY_KEY);
    if (selected && (!entryId || String(selected.entry_id) === String(entryId))) {
      return selected;
    }

    const results = readStore(STORAGE_LAST_RESULTS_KEY);
    if (Array.isArray(results) && entryId) {
      const found = results.find((item) => String(item.entry_id) === String(entryId));
      if (found) return found;
    }
    return selected || null;
  }

  function render(policy) {
    const title = document.getElementById("policy-title");
    const term = document.getElementById("policy-term");
    const date = document.getElementById("policy-date");
    const summary = document.getElementById("policy-summary");
    const snippet = document.getElementById("policy-chunk-snippet");
    const status = document.getElementById("policy-current-status");
    const meta = document.getElementById("policy-meta");
    const state = document.getElementById("policy-state");
    const source = document.getElementById("policy-source");

    if (!title || !summary || !meta || !snippet || !source) return;

    if (!policy) {
      title.textContent = "Policy details unavailable";
      summary.textContent = "Open a result from the search page to view its details here.";
      snippet.textContent = "";
      if (term) term.textContent = "";
      if (date) date.textContent = "";
      if (status) status.textContent = "No policy selected";
      if (state) state.textContent = "Search result not loaded";
      meta.textContent = "Return to the search page and click a policy title.";
      source.textContent = "";
      return;
    }

    const score =
      typeof policy.rrf_score === "number" ? policy.rrf_score.toFixed(4) : "n/a";
    const sources = Array.isArray(policy.sources) && policy.sources.length
      ? policy.sources.join(", ")
      : "n/a";

    title.textContent = policy.title || `Policy ${policy.entry_id || ""}`.trim();
    if (term) {
      term.textContent = policy.entry_id ? `Entry ID: ${policy.entry_id}` : "";
    }
    if (date) {
      date.textContent = formatDate(policy.announced_date);
    }
    summary.textContent = policy.summary || "No summary available.";
    snippet.textContent =
      policy.full_chunk_text ||
      policy.chunk_snippet ||
      policy.snippet ||
      "No chunk snippet available.";
    if (status) {
      status.textContent = "Indexed";
    }
    if (state) {
      state.textContent = "Search-derived policy record";
    }
    const fileName = policy.source_file_name ||
      (typeof policy.source_path === "string" && policy.source_path
        ? policy.source_path.split("/").pop()
        : "");
    const pageStart = Number(policy.page_start);
    const pageEnd = Number(policy.page_end);
    let pageText = "";
    if (Number.isFinite(pageStart) && Number.isFinite(pageEnd) && pageStart > 0 && pageEnd > 0) {
      pageText = pageStart === pageEnd ? `page ${pageStart}` : `page ${pageStart} - ${pageEnd}`;
    } else if (Number.isFinite(pageStart) && pageStart > 0) {
      pageText = `page ${pageStart}`;
    } else if (Number.isFinite(pageEnd) && pageEnd > 0) {
      pageText = `page ${pageEnd}`;
    }
    source.textContent = fileName
      ? `Source: ${fileName}${pageText ? `, ${pageText}` : ""}`
      : "Source: n/a";
    meta.textContent = `RRF score: ${score} | Sources: ${sources}`;
  }

  render(pickPolicy());
})();
