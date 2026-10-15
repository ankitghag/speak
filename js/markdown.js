function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function safeUrl(value, baseUrl, allowImages = false) {
  try {
    const resolved = new URL(value, baseUrl);
    const protocols = allowImages ? ["http:", "https:"] : ["http:", "https:", "mailto:", "tel:"];
    return protocols.includes(resolved.protocol) ? resolved.href : "";
  } catch {
    return "";
  }
}

function renderInline(source, baseUrl) {
  let text = escapeHtml(source).replace(/\$\\rightarrow\$/g, "→");
  const code = [];
  text = text.replace(/\x60([^\x60]+)\x60/g, (_, value) => {
    const marker = "@@CODE" + code.length + "@@";
    code.push("<code>" + value + "</code>");
    return marker;
  });
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, rawUrl, title = "") => {
    const url = safeUrl(rawUrl, baseUrl, true);
    return url ? '<img src="' + escapeHtml(url) + '" alt="' + alt + '" title="' + title + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">' : alt;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, label, rawUrl, title = "") => {
    const url = safeUrl(rawUrl, baseUrl);
    if (!url) return label;
    const parsed = new URL(url);
    const sameOrigin = parsed.origin === new URL(baseUrl).origin;
    const markdownLink = sameOrigin && parsed.pathname.toLowerCase().endsWith(".md");
    const attrs = markdownLink
      ? ' data-markdown-path="' + escapeHtml(parsed.pathname) + '" title="Open this lesson"'
      : !sameOrigin ? ' target="_blank" rel="noopener noreferrer"' : "";
    return '<a href="' + escapeHtml(url) + '"' + attrs + (title ? ' title="' + escapeHtml(title) + '"' : "") + ">" + label + "</a>";
  });
  text = text.replace(/\*\*(.+?)\*\*|__(.+?)__/g, (_, a, b) => "<strong>" + (a || b) + "</strong>");
  text = text.replace(/~~(.+?)~~/g, "<del>$1</del>");
  text = text.replace(/\*(.+?)\*|_(.+?)_/g, (_, a, b) => "<em>" + (a || b) + "</em>");
  return text.replace(/@@CODE(\d+)@@/g, (_, index) => code[Number(index)]);
}

function splitTableRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderBlocks(source, baseUrl) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (/^\s*\x60{3}/.test(line)) {
      const language = line.match(/^\s*\x60{3}([\w-]*)/)?.[1] || "";
      const code = [];
      index += 1;
      while (index < lines.length && !/^\s*\x60{3}/.test(lines[index])) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      output.push("<pre><code" + (language ? ' class="language-' + escapeHtml(language) + '"' : "") + ">" + escapeHtml(code.join("\n")) + "</code></pre>");
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      output.push("<h" + level + ">" + renderInline(heading[2], baseUrl) + "</h" + level + ">");
      index += 1;
      continue;
    }
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) { output.push("<hr>"); index += 1; continue; }
    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = splitTableRow(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].trim() && lines[index].includes("|")) rows.push(splitTableRow(lines[index++]));
      output.push('<div class="table-wrap"><table><thead><tr>' + headers.map((cell) => "<th>" + renderInline(cell, baseUrl) + "</th>").join("") + "</tr></thead><tbody>" + rows.map((row) => "<tr>" + headers.map((_, cellIndex) => "<td>" + renderInline(row[cellIndex] || "", baseUrl) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>");
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ""));
      output.push("<blockquote>" + renderBlocks(quote.join("\n"), baseUrl) + "</blockquote>");
      continue;
    }
    const listMatch = line.match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = Boolean(listMatch[2]);
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:([-+*])|(\d+)\.)\s+(.+)$/);
        if (!item || Boolean(item[2]) !== ordered) break;
        items.push(item[3]);
        index += 1;
        while (index < lines.length && /^\s{2,}\S/.test(lines[index]) && !/^\s*(?:[-+*]|\d+\.)\s+/.test(lines[index])) {
          items[items.length - 1] += " " + lines[index].trim();
          index += 1;
        }
      }
      const tag = ordered ? "ol" : "ul";
      output.push("<" + tag + ">" + items.map((item) => "<li>" + renderInline(item, baseUrl) + "</li>").join("") + "</" + tag + ">");
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^(#{1,6}\s|\s*\x60{3}|\s*>|\s*(?:[-+*]|\d+\.)\s+|\s*(---+|\*\*\*+|___+)\s*$)/.test(lines[index]) && !(lines[index].includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1]))) {
      paragraph.push(lines[index++].trim());
    }
    output.push("<p>" + renderInline(paragraph.join(" "), baseUrl) + "</p>");
  }
  return output.join("\n");
}

function slugify(text) {
  return text.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
}

export async function renderMarkdown(source, sourceUrl) {
  const container = document.createElement("div");
  container.innerHTML = renderBlocks(source, sourceUrl);
  const usedSlugs = new Map();
  const headings = [...container.querySelectorAll("h1, h2, h3")];
  headings.forEach((heading) => {
    const base = slugify(heading.textContent || "");
    const count = usedSlugs.get(base) || 0;
    usedSlugs.set(base, count + 1);
    heading.id = count ? base + "-" + (count + 1) : base;
  });
  return { container, headings };
}
