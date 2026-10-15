export function readRoute(defaultCourseId) {
  const params = new URLSearchParams(window.location.search);
  return {
    courseId: params.get("course") || defaultCourseId,
    lessonId: params.get("lesson") || null,
  };
}

export function routeUrl(courseId, lessonId = null) {
  const params = new URLSearchParams();
  params.set("course", courseId);
  if (lessonId) params.set("lesson", lessonId);
  const appRoot = new URL(".", window.location.href);
  return `${appRoot.pathname}?${params.toString()}`;
}

export function navigate(courseId, lessonId = null, { replace = false } = {}) {
  const url = routeUrl(courseId, lessonId);
  if (replace) window.history.replaceState({}, "", url);
  else window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
