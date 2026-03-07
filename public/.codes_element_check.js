
    const el = (id) => document.getElementById(id);
    const components = [];

    function toast(title, icon = "success") {
      if (!window.Swal) return;
      Swal.fire({ title, icon, toast: true, position: "top-end", showConfirmButton: false, timer: 1100 });
    }

    function setOutput(title, code) {
      el("outTitle").innerText = title;
      el("output").innerText = code;
      el("output").style.display = "block";
      el("previewFrame").style.display = "none";
      el("tabCode").classList.add("active");
      el("tabPreview").classList.remove("active");
    }

    function renderElementConfig() {
      const type = el("elementType").value;
      const extraHint = type === "table"
        ? "columns: id,name,status"
        : type === "list"
          ? "item1,item2,item3"
          : "Enter value";

      el("elementConfig").innerHTML = `
        <label for="cfg_id">Element ID</label>
        <input id="cfg_id" placeholder="${type}_id" />
        <label for="cfg_label">Label / Text</label>
        <input id="cfg_label" placeholder="Label for ${type}" />
        <label for="cfg_placeholder">Placeholder / Extra</label>
        <input id="cfg_placeholder" placeholder="${extraHint}" />
      `;
    }

    function renderChips() {
      el("componentChips").innerHTML = components
        .map((c, i) => `<span class="chip" data-idx="${i}">${c.type} (${c.id})</span>`)
        .join("");

      el("componentChips").querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          components.splice(Number(chip.dataset.idx), 1);
          renderChips();
        });
      });
    }

    function componentToHtml(c) {
      if (["input", "email", "password", "tel", "url"].includes(c.type)) {
        const t = c.type === "input" ? "text" : c.type;
        return `<label for="${c.id}">${c.label}</label>\n<input type="${t}" id="${c.id}" placeholder="${c.placeholder}" />`;
      }
      if (["number", "range", "date", "time"].includes(c.type)) {
        return `<label for="${c.id}">${c.label}</label>\n<input type="${c.type}" id="${c.id}" placeholder="${c.placeholder}" />`;
      }
      if (c.type === "textarea") return `<label for="${c.id}">${c.label}</label>\n<textarea id="${c.id}" placeholder="${c.placeholder}"></textarea>`;
      if (c.type === "select") return `<label for="${c.id}">${c.label}</label>\n<select id="${c.id}"><option value="">Select...</option></select>`;
      if (c.type === "checkbox") return `<label><input type="checkbox" id="${c.id}" /> ${c.label}</label>`;
      if (c.type === "radio") return `<label>${c.label}</label>\n<label><input type="radio" name="${c.id}" /> Option 1</label>\n<label><input type="radio" name="${c.id}" /> Option 2</label>`;
      if (c.type === "table") {
        const cols = (c.placeholder || "id,name").split(",").map((x) => x.trim()).filter(Boolean);
        const th = cols.map((x) => `<th>${x}</th>`).join("");
        return `<table id="${c.id}"><thead><tr>${th}</tr></thead><tbody id="tableBody"></tbody></table>`;
      }
      if (c.type === "list") {
        const items = (c.placeholder || "Item 1,Item 2").split(",").map((x) => x.trim()).filter(Boolean);
        return `<ul id="${c.id}">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
      }
      if (["section", "article", "header", "footer", "div"].includes(c.type)) return `<${c.type} id="${c.id}">${c.label}</${c.type}>`;
      if (c.type === "grid") return `<div id="${c.id}" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;"><div>Cell 1</div><div>Cell 2</div><div>Cell 3</div></div>`;
      if (c.type === "flex") return `<div id="${c.id}" style="display:flex;gap:8px;"><div>Item 1</div><div>Item 2</div><div>Item 3</div></div>`;
      if (c.type === "image") return `<img id="${c.id}" alt="${c.label}" style="max-width:180px;display:block;" />`;
      if (c.type === "upload") return `<label for="${c.id}">${c.label}</label>\n<input type="file" id="${c.id}" />`;
      if (c.type === "audio") return `<audio id="${c.id}" controls><source src="" type="audio/mpeg" /></audio>`;
      if (c.type === "video") return `<video id="${c.id}" controls width="320"><source src="" type="video/mp4" /></video>`;
      if (c.type === "canvas") return `<canvas id="${c.id}" width="320" height="160" style="border:1px solid #ddd;"></canvas>`;
      if (c.type === "heading") return `<h2 id="${c.id}">${c.label}</h2>`;
      if (c.type === "paragraph") return `<p id="${c.id}">${c.label}</p>`;
      if (c.type === "span") return `<span id="${c.id}">${c.label}</span>`;
      if (c.type === "code") return `<code id="${c.id}">${c.label}</code>`;
      if (c.type === "pre") return `<pre id="${c.id}">${c.label}</pre>`;
      if (c.type === "blockquote") return `<blockquote id="${c.id}">${c.label}</blockquote>`;
      if (c.type === "label") return `<label id="${c.id}">${c.label}</label>`;
      return `<div id="${c.id}">${c.label}</div>`;
    }

    function generateHtml(useSwal, debug) {
      const title = (el("pageTitle").value || "Generated Page").trim();
      const body = components.map(componentToHtml).join("\n\n") || "<p>No components added.</p>";
      const ui = useSwal
        ? `<button type="button" onclick="openUI()">Open UI</button>\n<script>\nfunction openUI(){\n  const html = ${JSON.stringify(body)};\n  if (window.Swal) Swal.fire({ title: 'Generated UI', width: 900, html, showConfirmButton: false });\n  else alert('SweetAlert not loaded');\n}\n<\/script>`
        : body;

      return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${title}</title>\n  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"><\/script>\n  <style>\n    body { font-family: Segoe UI, sans-serif; padding: 20px; }\n    .container { max-width: 960px; margin: 0 auto; }\n    label { display:block; margin:8px 0 4px; }\n    input, select, textarea { width:100%; padding:8px; margin-bottom:8px; }\n    table { width:100%; border-collapse:collapse; margin-top:12px; }\n    th, td { border:1px solid #ddd; padding:8px; }\n    ${debug ? "*{outline:1px dashed red;}" : ""}\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>${title}</h1>\n    ${ui}\n  </div>\n</body>\n</html>`;
    }

    function addElement() {
      const type = el("elementType").value;
      const id = (el("cfg_id").value || `${type}_${Date.now()}`).trim();
      const label = (el("cfg_label").value || id).trim();
      const placeholder = (el("cfg_placeholder").value || "").trim();
      components.push({ type, id, label, placeholder });
      renderChips();
      toast("Element added");
    }

    function showPreview() {
      const code = el("output").innerText.trim();
      if (!code) return;
      el("previewFrame").style.display = "block";
      el("output").style.display = "none";
      el("tabPreview").classList.add("active");
      el("tabCode").classList.remove("active");
      el("previewFrame").srcdoc = code;
    }

    el("elementType").addEventListener("change", renderElementConfig);
    el("addElementBtn").addEventListener("click", addElement);
    el("clearElementsBtn").addEventListener("click", () => {
      components.length = 0;
      renderChips();
      toast("Elements cleared", "info");
    });

    el("btnShell").addEventListener("click", () => {
      const title = (el("pageTitle").value || "Generated Page").trim();
      setOutput("Basic Shell", `<!doctype html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>${title}</title>\n</head>\n<body>\n\n</body>\n</html>`);
    });

    el("btnFull").addEventListener("click", () => setOutput("Generated HTML", generateHtml(false, false)));
    el("btnFullSwal").addEventListener("click", () => setOutput("Generated HTML (Swal)", generateHtml(true, false)));
    el("btnMinimal").addEventListener("click", () => setOutput("Minimal", "<!doctype html>\n<html><head><title>Minimal</title></head><body><h1>Minimal</h1></body></html>"));
    el("btnDebug").addEventListener("click", () => setOutput("Debug HTML", generateHtml(false, true)));

    el("copyBtn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(el("output").innerText);
        toast("Copied");
      } catch {
        if (window.Swal) Swal.fire("Error", "Copy failed", "error");
      }
    });

    el("downloadBtn").addEventListener("click", () => {
      const code = el("output").innerText.trim();
      if (!code) return;
      const blob = new Blob([code], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated_page.html";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Downloaded");
    });

    el("runBtn").addEventListener("click", showPreview);
    el("tabPreview").addEventListener("click", showPreview);
    el("tabCode").addEventListener("click", () => {
      el("output").style.display = "block";
      el("previewFrame").style.display = "none";
      el("tabCode").classList.add("active");
      el("tabPreview").classList.remove("active");
    });

    renderElementConfig();
    renderChips();
  
