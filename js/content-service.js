import { assertLocalPath, validateCourse, validateRegistry } from "./config.js";

export class ContentError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ContentError";
    this.cause = options.cause;
  }
}

function appFileUrl(path) {
  const appRoot = new URL(".", window.location.href);
  return new URL(path.replace(/^\/+/, ""), appRoot);
}

async function fetchJson(path, label) {
  const safePath = assertLocalPath(path, label);
  const response = await fetch(appFileUrl(safePath), { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new ContentError(`${label} could not be loaded (${response.status}).`);
  try {
    return await response.json();
  } catch (cause) {
    throw new ContentError(`${label} contains invalid JSON.`, { cause });
  }
}

export async function loadCatalog() {
  const registry = await fetchJson("/courses.json", "Course registry");
  const entries = validateRegistry(registry);
  if (entries.length === 0) throw new ContentError("No courses are configured yet.");

  const results = await Promise.allSettled(
    entries.map(async (entry) => {
      const rawCourse = await fetchJson(entry.config, `Course ${entry.id}`);
      return validateCourse(rawCourse, entry.id);
    }),
  );

  const courses = [];
  const errors = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") courses.push(result.value);
    else errors.push({ id: entries[index].id, error: result.reason });
  });
  if (courses.length === 0) {
    throw new ContentError("None of the configured courses could be opened.", { cause: errors[0]?.error });
  }
  return { courses, errors };
}

export async function loadLesson(lesson) {
  const path = assertLocalPath(lesson.src, `Source for ${lesson.id}`);
  const url = appFileUrl(path);
  const response = await fetch(url, { cache: "no-store", headers: { Accept: "text/markdown, text/plain" } });
  if (!response.ok) throw new ContentError(`This lesson could not be loaded (${response.status}).`);
  const markdown = await response.text();
  if (!markdown.trim()) throw new ContentError("This lesson is empty.");
  return { markdown, url: url.href };
}
