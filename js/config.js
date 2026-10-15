const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertText(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

export function assertLocalPath(path, label = "Path") {
  assertText(path, label);
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("?") ||
    path.includes("#") ||
    path.split("/").some((part) => part === ".." || part === ".")
  ) {
    throw new Error(`${label} must be a safe path inside this app.`);
  }

  const url = new URL(path, window.location.origin);
  if (url.origin !== window.location.origin) {
    throw new Error(`${label} must stay on this app's origin.`);
  }
  return url.pathname;
}

export function validateRegistry(registry) {
  assertRecord(registry, "Course registry");
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.courses)) {
    throw new Error("The course registry has an unsupported format.");
  }

  const ids = new Set();
  return registry.courses.map((entry, index) => {
    assertRecord(entry, `Course registry entry ${index + 1}`);
    if (typeof entry.id !== "string" || !ID_PATTERN.test(entry.id)) {
      throw new Error(`Course registry entry ${index + 1} has an invalid ID.`);
    }
    if (ids.has(entry.id)) throw new Error(`Duplicate course ID: ${entry.id}.`);
    ids.add(entry.id);
    const config = assertLocalPath(entry.config, `Course config for ${entry.id}`);
    if (!config.startsWith(`/courses/${entry.id}/`)) {
      throw new Error(`Course config for ${entry.id} must be inside its course folder.`);
    }
    return { id: entry.id, config };
  });
}

export function validateCourse(course, expectedId) {
  assertRecord(course, `Course ${expectedId}`);
  if (course.schemaVersion !== 1) throw new Error(`Course ${expectedId} uses an unsupported schema version.`);
  if (course.id !== expectedId || !ID_PATTERN.test(course.id || "")) {
    throw new Error(`Course ID does not match its registry entry (${expectedId}).`);
  }
  assertText(course.title, `Title for ${expectedId}`);
  assertText(course.description, `Description for ${expectedId}`);
  if (!Array.isArray(course.sections) || !Array.isArray(course.lessons)) {
    throw new Error(`Course ${expectedId} needs sections and lessons arrays.`);
  }

  const lessons = new Map();
  course.lessons.forEach((lesson, index) => {
    assertRecord(lesson, `Lesson ${index + 1} in ${expectedId}`);
    if (typeof lesson.id !== "string" || !ID_PATTERN.test(lesson.id)) {
      throw new Error(`Lesson ${index + 1} in ${expectedId} has an invalid ID.`);
    }
    if (lessons.has(lesson.id)) throw new Error(`Duplicate lesson ID: ${lesson.id}.`);
    assertText(lesson.title, `Title for ${lesson.id}`);
    const src = assertLocalPath(lesson.src, `Source for ${lesson.id}`);
    if (!src.startsWith(`/courses/${expectedId}/`)) {
      throw new Error(`Source for ${lesson.id} must be inside its course folder.`);
    }
    lessons.set(lesson.id, { id: lesson.id, title: lesson.title.trim(), src });
  });

  const sectionIds = new Set();
  const orderedIds = [];
  course.sections.forEach((section, index) => {
    assertRecord(section, `Section ${index + 1} in ${expectedId}`);
    if (typeof section.id !== "string" || !ID_PATTERN.test(section.id)) {
      throw new Error(`Section ${index + 1} in ${expectedId} has an invalid ID.`);
    }
    if (sectionIds.has(section.id)) throw new Error(`Duplicate section ID: ${section.id}.`);
    sectionIds.add(section.id);
    assertText(section.title, `Title for section ${section.id}`);
    if (!Array.isArray(section.lessonIds) || section.lessonIds.length === 0) {
      throw new Error(`Section ${section.id} must contain at least one lesson.`);
    }
    section.lessonIds.forEach((lessonId) => {
      if (!lessons.has(lessonId)) throw new Error(`Section ${section.id} refers to unknown lesson ${lessonId}.`);
      if (orderedIds.includes(lessonId)) throw new Error(`Lesson ${lessonId} appears in more than one section.`);
      orderedIds.push(lessonId);
    });
  });
  if (orderedIds.length !== lessons.size) {
    throw new Error(`Every lesson in ${expectedId} must appear in exactly one section.`);
  }

  return {
    schemaVersion: 1,
    id: course.id,
    title: course.title.trim(),
    description: course.description.trim(),
    sections: course.sections.map((section) => ({
      id: section.id,
      title: section.title.trim(),
      lessonIds: [...section.lessonIds],
    })),
    lessons: orderedIds.map((id) => lessons.get(id)),
  };
}
