import { loadCatalog, loadLesson, ContentError } from "./content-service.js";
import { navigate, readRoute, routeUrl } from "./router.js";
import { renderMarkdown } from "./markdown.js";

const view = document.querySelector("#view");
const sidebar = document.querySelector("#sidebar-content");
const outline = document.querySelector("#lesson-outline");
const coursePicker = document.querySelector("#course-picker");
const searchInput = document.querySelector("#lesson-search");
const mobileMenuButton = document.querySelector("#mobile-menu-button");
const mobileSidebar = document.querySelector("#course-sidebar");
const toastRegion = document.querySelector("#toast-region");

let catalog;
let currentRoute = { courseId: null, lessonId: null };
let searchTerm = "";
let toastTimer;

function node(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function routeLink(courseId, lessonId, text, className = "") {
  const link = node("a", className, text);
  link.href = routeUrl(courseId, lessonId);
  link.dataset.appRoute = "true";
  link.dataset.courseId = courseId;
  if (lessonId) link.dataset.lessonId = lessonId;
  return link;
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showToast("Progress could not be saved in this browser.");
  }
}

function completedLessons(courseId) {
  const value = readStorage(`speak-progress-v1:${courseId}`, []);
  if (!Array.isArray(value)) return [];
  const knownIds = new Set(catalog?.courses.find((course) => course.id === courseId)?.lessons.map((lesson) => lesson.id) || []);
  return value.filter((id) => typeof id === "string" && knownIds.has(id));
}

function updateLastLesson(courseId, lessonId) {
  try {
    localStorage.setItem(`speak-last-v1:${courseId}`, lessonId);
  } catch {
    // Lesson navigation still works when storage is unavailable.
  }
}

function rememberedLesson(course) {
  try {
    const id = localStorage.getItem(`speak-last-v1:${course.id}`);
    return course.lessons.find((lesson) => lesson.id === id)?.id;
  } catch {
    return undefined;
  }
}

function showToast(message) {
  toastRegion.textContent = message;
  toastRegion.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastRegion.classList.remove("visible"), 2600);
}

function setBusy(isBusy) {
  view.setAttribute("aria-busy", String(isBusy));
}

function setCoursePicker(courses, activeId) {
  coursePicker.replaceChildren();
  courses.forEach((course) => {
    const option = node("option", "", course.title);
    option.value = course.id;
    coursePicker.append(option);
  });
  coursePicker.value = activeId;
}

function buildSidebar(course, activeLessonId) {
  sidebar.replaceChildren();
  const completed = completedLessons(course.id);
  const title = node("div", "sidebar-course-label", "YOUR COURSE");
  const courseTitle = node("div", "sidebar-course-title", course.title);
  const progressWrap = node("div", "course-progress");
  const progressMeta = node("div", "progress-meta");
  progressMeta.append(node("span", "", "Your progress"));
  progressMeta.append(node("span", "", `${completed.length} / ${course.lessons.length}`));
  const progressTrack = node("div", "progress-track");
  const progressFill = node("span", "progress-fill");
  progressFill.style.width = `${course.lessons.length ? (completed.length / course.lessons.length) * 100 : 0}%`;
  progressTrack.append(progressFill);
  progressWrap.append(progressMeta, progressTrack);

  const overview = routeLink(course.id, null, "Course overview", `sidebar-overview${activeLessonId ? "" : " is-active"}`);
  if (!activeLessonId) overview.setAttribute("aria-current", "page");
  sidebar.append(title, courseTitle, progressWrap, overview);

  const normalized = searchTerm.trim().toLocaleLowerCase();
  let visibleLessonCount = 0;
  course.sections.forEach((section, index) => {
    const lessons = section.lessonIds
      .map((id) => course.lessons.find((lesson) => lesson.id === id))
      .filter(Boolean)
      .filter((lesson) => !normalized || lesson.title.toLocaleLowerCase().includes(normalized));
    if (!lessons.length) return;
    visibleLessonCount += lessons.length;
    const details = node("details", "sidebar-section");
    details.open = Boolean(normalized) || lessons.some((lesson) => lesson.id === activeLessonId) || (!activeLessonId && index === 0);
    const summary = node("summary", "section-summary");
    summary.append(node("span", "section-name", section.title));
    summary.append(node("span", "section-count", String(lessons.length)));
    const list = node("div", "lesson-links");
    lessons.forEach((lesson) => {
      const isActive = lesson.id === activeLessonId;
      const isComplete = completed.includes(lesson.id);
      const link = routeLink(course.id, lesson.id, "", `lesson-link${isActive ? " is-active" : ""}`);
      if (isActive) link.setAttribute("aria-current", "page");
      const number = node("span", "lesson-number", lessonNumber(lesson, course));
      const label = node("span", "lesson-link-title", lesson.title);
      link.append(number, label);
      if (isComplete) link.append(node("span", "lesson-check", "✓"));
      list.append(link);
    });
    details.append(summary, list);
    sidebar.append(details);
  });

  if (normalized && !visibleLessonCount) {
    sidebar.append(node("p", "sidebar-empty", "No lesson titles match that search."));
  }
  const footer = node("div", "sidebar-footer");
  footer.append(node("span", "sidebar-avatar", course.title.slice(0, 1).toLocaleUpperCase()));
  footer.append(node("span", "", "My learning space"));
  sidebar.append(footer);
}

function lessonNumber(lesson, course) {
  const index = course.lessons.findIndex((item) => item.id === lesson.id);
  return String(index + 1).padStart(2, "0");
}

function sectionForLesson(course, lessonId) {
  return course.sections.find((section) => section.lessonIds.includes(lessonId));
}

function getCourse(courseId) {
  return catalog.courses.find((course) => course.id === courseId);
}

function showMessage(title, message, { retry = false, backCourseId = null } = {}) {
  setBusy(false);
  view.replaceChildren();
  const panel = node("section", "message-panel");
  panel.setAttribute("role", "status");
  panel.append(node("div", "message-mark", "s."));
  panel.append(node("p", "eyebrow", "SPEAK · LEARNING SPACE"));
  panel.append(node("h1", "", title));
  panel.append(node("p", "message-copy", message));
  const actions = node("div", "message-actions");
  if (retry) {
    const button = node("button", "button button-primary", "Try again");
    button.type = "button";
    button.addEventListener("click", () => window.location.reload());
    actions.append(button);
  }
  if (backCourseId) actions.append(routeLink(backCourseId, null, "Back to course overview", "button button-secondary"));
  panel.append(actions);
  view.append(panel);
  outline.replaceChildren();
}

function renderOverview(course) {
  setBusy(false);
  view.replaceChildren();
  const completed = completedLessons(course.id);
  const continueLesson = rememberedLesson(course) || course.lessons.find((lesson) => !completed.includes(lesson.id))?.id || course.lessons[0]?.id;
  const section = node("section", "overview-view");
  const breadcrumb = node("p", "breadcrumbs", "YOUR LEARNING SPACE");
  section.append(breadcrumb, node("p", "eyebrow", `${course.sections.length} PARTS · ${course.lessons.length} LESSONS`));
  section.append(node("h1", "overview-title", course.title));
  section.append(node("p", "overview-description", course.description));

  if (catalog.errors.length) {
    const notice = node("p", "catalog-notice", "One or more course configurations could not be loaded. Other available courses are still ready to use.");
    notice.setAttribute("role", "status");
    section.append(notice);
  }

  const stats = node("div", "overview-stats");
  const completedStat = node("div", "overview-stat");
  completedStat.append(node("strong", "", `${completed.length} of ${course.lessons.length}`), node("span", "", "lessons completed"));
  const sectionStat = node("div", "overview-stat");
  sectionStat.append(node("strong", "", String(course.sections.length)), node("span", "", "learning sections"));
  stats.append(completedStat, sectionStat);
  section.append(stats);

  const continueCard = node("div", "continue-card");
  const continueCopy = node("div", "continue-copy");
  continueCopy.append(node("span", "card-kicker", completed.length ? "PICK UP WHERE YOU LEFT OFF" : "A GOOD PLACE TO BEGIN"));
  const nextLesson = course.lessons.find((lesson) => lesson.id === continueLesson);
  continueCopy.append(node("strong", "", nextLesson?.title || "Start your first lesson"));
  continueCard.append(continueCopy, routeLink(course.id, continueLesson, completed.length ? "Continue learning →" : "Start learning →", "button button-primary"));
  section.append(continueCard);

  const sectionHeading = node("div", "section-heading-row");
  sectionHeading.append(node("h2", "", "Course contents"), node("span", "", "Follow the lessons in order, or choose any topic."));
  section.append(sectionHeading);
  const sectionList = node("div", "overview-sections");
  course.sections.forEach((part, index) => {
    const card = node("section", "overview-section");
    const header = node("div", "overview-section-head");
    const sectionNumber = node("span", "overview-section-number", String(index + 1).padStart(2, "0"));
    const sectionTitle = node("h3", "", part.title);
    const sectionCount = node("span", "overview-section-count", `${part.lessonIds.length} ${part.lessonIds.length === 1 ? "lesson" : "lessons"}`);
    header.append(sectionNumber, sectionTitle, sectionCount);
    card.append(header);
    const list = node("div", "overview-lesson-list");
    part.lessonIds.forEach((id) => {
      const lesson = course.lessons.find((item) => item.id === id);
      if (!lesson) return;
      const link = routeLink(course.id, lesson.id, "", "overview-lesson");
      link.append(node("span", "overview-lesson-title", lesson.title));
      const done = completed.includes(lesson.id);
      link.append(node("span", done ? "overview-done" : "overview-arrow", done ? "Completed ✓" : "Open lesson →"));
      list.append(link);
    });
    card.append(list);
    sectionList.append(card);
  });
  section.append(sectionList);
  view.append(section);
  outline.replaceChildren();
}

function wordCount(text) {
  return (text.match(/[\p{L}\p{N}’'-]+/gu) || []).length;
}

function readingMinutes(text) {
  return Math.max(1, Math.ceil(wordCount(text) / 210));
}

function buildOutline(headings) {
  outline.replaceChildren();
  const relevant = headings.filter((heading) => heading.tagName === "H2" || heading.tagName === "H3");
  if (!relevant.length) return;
  outline.append(node("h2", "outline-title", "On this page"));
  const list = node("nav", "outline-links");
  list.setAttribute("aria-label", "Lesson sections");
  relevant.forEach((heading) => {
    const link = node("a", heading.tagName === "H3" ? "outline-link is-nested" : "outline-link", heading.textContent || "Section");
    link.href = `#${heading.id}`;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelectorAll(".outline-link.is-active").forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");
      window.history.replaceState({}, "", `#${heading.id}`);
      heading.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
    list.append(link);
  });
  outline.append(list);
  const note = node("div", "outline-note");
  note.append(node("strong", "", "Practice tip"), node("span", "", "Read a pattern, then say one example aloud in your own words."));
  outline.append(note);
}

async function renderLesson(course, lesson) {
  setBusy(true);
  view.replaceChildren();
  outline.replaceChildren();
  const loading = node("div", "loading-view");
  loading.append(node("span", "spinner"), node("p", "", "Opening this lesson…"));
  view.append(loading);

  try {
    const { markdown, url } = await loadLesson(lesson);
    const rendered = await renderMarkdown(markdown, url);
    const documentPane = node("article", "lesson-document");
    const section = sectionForLesson(course, lesson.id);
    const lessonMeta = node("div", "lesson-meta");
    lessonMeta.append(node("span", "lesson-day", section?.title || "Lesson"));
    lessonMeta.append(node("span", "meta-separator", "·"));
    lessonMeta.append(node("span", "", `LESSON ${lessonNumber(lesson, course)}`));
    lessonMeta.append(node("span", "meta-chip", `${readingMinutes(markdown)} min read`));
    documentPane.append(lessonMeta);

    const firstHeading = rendered.container.querySelector("h1");
    if (firstHeading) firstHeading.textContent = lesson.title;
    else rendered.container.prepend(node("h1", "", lesson.title));
    documentPane.append(rendered.container);

    const completed = completedLessons(course.id);
    const isComplete = completed.includes(lesson.id);
    const completionButton = node("button", isComplete ? "button button-complete" : "button button-primary", isComplete ? "Completed ✓" : "Mark lesson complete");
    completionButton.type = "button";
    completionButton.setAttribute("aria-pressed", String(isComplete));
    completionButton.addEventListener("click", () => {
      const next = completedLessons(course.id);
      const position = next.indexOf(lesson.id);
      if (position >= 0) next.splice(position, 1);
      else next.push(lesson.id);
      writeStorage(`speak-progress-v1:${course.id}`, next);
      updateLastLesson(course.id, lesson.id);
      renderRoute();
      showToast(position >= 0 ? "Lesson marked as not complete." : "Lesson marked complete.");
    });

    const previousNext = node("nav", "lesson-pagination");
    previousNext.setAttribute("aria-label", "Lesson navigation");
    const index = course.lessons.findIndex((item) => item.id === lesson.id);
    const previous = course.lessons[index - 1];
    const next = course.lessons[index + 1];
    if (previous) {
      const previousLink = routeLink(course.id, previous.id, "", "pagination-link previous-link");
      previousLink.append(node("span", "pagination-label", "← PREVIOUS LESSON"), node("strong", "", previous.title));
      previousNext.append(previousLink);
    } else {
      previousNext.append(node("span", "pagination-placeholder", "You’re at the start"));
    }
    if (next) {
      const nextLink = routeLink(course.id, next.id, "", "pagination-link next-link");
      nextLink.append(node("span", "pagination-label", "NEXT LESSON →"), node("strong", "", next.title));
      previousNext.append(nextLink);
    } else {
      previousNext.append(node("span", "pagination-placeholder next-placeholder", "You’ve reached the end"));
    }

    const footer = node("div", "lesson-footer");
    footer.append(completionButton, previousNext);
    documentPane.append(footer);
    view.replaceChildren(documentPane);
    buildOutline([...rendered.container.querySelectorAll("h1, h2, h3")]);
    setBusy(false);
  } catch (error) {
    console.error("Lesson load failed:", error);
    showMessage(
      error instanceof ContentError ? "This lesson isn’t available yet" : "The lesson could not be displayed",
      error.message || "Check your connection and try again.",
      { retry: true, backCourseId: course.id },
    );
  }
}

async function renderRoute() {
  if (!catalog) return;
  const route = readRoute(catalog.courses[0]?.id);
  window.scrollTo(0, 0);
  currentRoute = route;
  const course = getCourse(route.courseId);
  if (!course) {
    const unavailable = catalog.errors.find((entry) => entry.id === route.courseId);
    showMessage(
      unavailable ? "This course couldn’t be opened" : "We couldn’t find that course",
      unavailable ? "Its configuration needs attention. Other courses are still available." : "Choose a course from the menu to continue.",
      { backCourseId: catalog.courses[0]?.id },
    );
    buildSidebar(catalog.courses[0], null);
    setCoursePicker(catalog.courses, catalog.courses[0].id);
    return;
  }

  setCoursePicker(catalog.courses, course.id);
  buildSidebar(course, route.lessonId);
  if (!route.lessonId) {
    renderOverview(course);
    return;
  }
  const lesson = course.lessons.find((item) => item.id === route.lessonId);
  if (!lesson) {
    showMessage("Lesson not found", "This link doesn’t match a lesson in the selected course.", { backCourseId: course.id });
    return;
  }
  updateLastLesson(course.id, lesson.id);
  await renderLesson(course, lesson);
}

function handleRouteClick(event) {
  const link = event.target.closest("a[data-app-route]");
  if (!link) return;
  event.preventDefault();
  navigate(link.dataset.courseId, link.dataset.lessonId || null);
  mobileSidebar.classList.remove("is-open");
  mobileMenuButton.setAttribute("aria-expanded", "false");
}

function handleMarkdownLink(event) {
  const link = event.target.closest("a[data-markdown-path]");
  if (!link) return;
  const course = getCourse(currentRoute.courseId);
  const path = link.dataset.markdownPath;
  const appRoot = new URL(".", window.location.href);
  const lesson = course?.lessons.find((item) => new URL(item.src.replace(/^\/+/, ""), appRoot).pathname === path);
  if (lesson) {
    event.preventDefault();
    navigate(course.id, lesson.id);
  }
}

function wireEvents() {
  window.addEventListener("popstate", renderRoute);
  document.addEventListener("click", handleRouteClick);
  document.addEventListener("click", handleMarkdownLink);
  coursePicker.addEventListener("change", () => navigate(coursePicker.value));
  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value;
    const course = getCourse(currentRoute.courseId);
    if (course) buildSidebar(course, currentRoute.lessonId);
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = "";
      searchTerm = "";
      const course = getCourse(currentRoute.courseId);
      if (course) buildSidebar(course, currentRoute.lessonId);
      searchInput.blur();
    }
  });
  mobileMenuButton.addEventListener("click", () => {
    const isOpen = mobileSidebar.classList.toggle("is-open");
    mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
  });
}

async function start() {
  wireEvents();
  try {
    catalog = await loadCatalog();
    if (!catalog.courses.length) throw new ContentError("No healthy courses are available.");
    const requested = new URLSearchParams(window.location.search).get("course");
    if (!requested) {
      window.history.replaceState({}, "", routeUrl(catalog.courses[0].id));
    }
    await renderRoute();
  } catch (error) {
    console.error("App startup failed:", error);
    showMessage(
      "Your learning space couldn’t load",
      error.message || "Check that you’re running the app from its local server, then try again.",
      { retry: true },
    );
  }
}

start();
