# Build a Reusable, Content-Driven Learning Web Application

## 1. Objective

Build a polished, production-quality learning web application using my existing Markdown (`.md`) lesson files.

The application should initially support my English communication course, but I plan to launch other courses in the future using the same application.

**The most important requirement is that the application must be content-driven and extensible.** Adding a new course should require adding its content files and configuration, not modifying existing frontend components or core application logic.

Prioritize clean architecture, excellent design, simplicity, maintainability, and future adaptability.

## 2. Inspect Before Implementation

Before writing code, inspect the existing repository and all relevant Markdown content.

Understand the actual content structure, including headings, lesson ordering, examples, lists, tables, links, images, and other Markdown features.

Use this information to determine the appropriate content structure and navigation. Do not invent replacement content or modify my existing lesson wording.

Provide a brief implementation plan before proceeding.

## 3. Architecture and Design Patterns

Use vanilla JavaScript, HTML, and CSS for the frontend. Avoid introducing a frontend framework unless there is a compelling technical reason.

Follow a modular architecture with a clear separation of concerns. Keep the following responsibilities independent:

- Content discovery and loading.
- Course and lesson metadata.
- Navigation and application state.
- Markdown parsing and rendering.
- UI components and presentation.
- Shared configuration and error handling.

Apply established design patterns only where they solve an actual problem. Use principles such as single responsibility, low coupling, separation of concerns, and open-for-extension design.

Keep the code straightforward and readable. Avoid overengineering, unnecessary abstractions, excessive classes, complicated inheritance, redundant data structures, and large monolithic JavaScript files.

The application should be easy to understand, debug, test, and extend.

## 4. Plug-and-Play Course Architecture

Organize courses independently, with their own Markdown lessons, metadata, and assets.

For example:

    content/
      courses/
        english-communication/
          course.json
          lessons/
          assets/
        another-course/
          course.json
          lessons/
          assets/

This structure is illustrative; adapt it to the existing repository and actual content.

Each course should have a configuration file defining its metadata, lesson ordering, sections or groups, and other information required by the application.

The frontend must not contain hardcoded course names, lesson titles, lesson counts, or course-specific navigation rules.

Course discovery and navigation must be generated from a consistent content configuration mechanism. Choose an appropriate approach for the actual deployment environment, such as a generated manifest or a centralized course registry.

**Mandatory requirement:** I must be able to add another course by creating its content files and configuration, without modifying existing frontend components or core application logic, provided it follows the supported content format.

Adding, removing, renaming, or reordering lessons should not require changes to the UI implementation.

Keep course-specific styling and behavior configurable where necessary, without introducing an unnecessarily complex plugin system.

Document the exact procedure for adding a new course.

## 5. Markdown Rendering

Markdown files must remain the source of truth for lesson content.

Render their content faithfully, preserving the original structure and formatting. Support the features present in my files, including headings, paragraphs, emphasis, nested lists, tables, blockquotes, code blocks, links, images, and other relevant Markdown syntax.

Use a reliable Markdown parser rather than implementing one from scratch.

Handle relative image paths and links correctly. Sanitize rendered HTML, handle unsafe URLs appropriately, and prevent Markdown content from introducing executable scripts.

Keep Markdown processing independent of the UI so the content-loading mechanism can later be changed without rewriting the lesson components.

## 6. Navigation and Learning Experience

Design an intuitive navigation system suitable for both small and large courses.

Include:

- A course overview page.
- A clearly organized lesson index.
- Grouping by day, chapter, module, or section when supported by the content.
- Previous and next lesson navigation.
- A clear active-lesson indicator.
- Expandable or collapsible lesson groups where useful.
- Breadcrumbs or equivalent navigation context.
- Direct URLs for individual lessons.
- Proper browser back and forward navigation.
- Useful loading, empty, error, and not-found states.

Preserve the intended order of lessons rather than relying on arbitrary filesystem ordering.

Refreshing or directly opening a lesson URL must display the correct lesson.

Keep navigation intuitive and avoid unnecessary clicks.

## 7. Visual Design

Create an aesthetically distinctive, premium learning platform rather than a generic admin dashboard or basic Markdown viewer.

Choose a cohesive color palette that avoids the conventional white-and-blue combination. Consider an editorial aesthetic using warm ivory, deep forest green, muted terracotta, sage, or other complementary colors.

Use good visual judgment to select the final palette and establish consistent design tokens.

The interface should feature:

- Excellent typography and readable line lengths.
- Clear heading hierarchy and comfortable spacing.
- A polished course overview and lesson navigation.
- Consistent colors, borders, spacing, and component styling.
- Attractive presentation of examples, quotations, tables, and code blocks.
- Subtle interactions and restrained visual effects.
- Responsive layouts for desktop, tablet, and mobile.
- Accessible contrast, semantic HTML, and keyboard navigation.

Avoid heavy component libraries, excessive animations, unnecessary gradients, oversized cards, excessive shadows, and decorative elements that distract from learning.

Use lightweight, maintainable CSS. Prioritize usability, content readability, and visual consistency over visual complexity.

## 8. Adaptability and Future Features

The architecture must accommodate future changes without requiring a rewrite of the core application.

I may later introduce:

- Additional courses on unrelated subjects.
- User accounts and learning progress.
- Bookmarks, notes, and search.
- Exercises and conditional questions.
- AI-assisted learning and conversations based on lesson content.
- Subscription-based access and paid courses.
- A backend API or alternative content source.
- PWA and offline capabilities.

Do not implement these features now unless necessary for the initial requirements.

Instead, establish clean boundaries so they can be introduced independently. For example, the UI should consume content through a defined content service rather than directly accessing Markdown files from multiple components.

Do not introduce a backend, database, state-management library, or additional dependencies without a clear requirement.

## 9. Reliability and Testing

Handle missing files, invalid configuration, malformed Markdown, broken assets, and unknown URLs gracefully.

Validate course configuration and content paths. Keep lesson ordering deterministic and prevent a broken course from unnecessarily breaking other courses.

Add focused tests for content discovery, configuration validation, lesson ordering, Markdown rendering, navigation, and error handling.

Verify the most important architectural requirement by adding a second sample course using only content files and configuration. Confirm that it works without modifying existing frontend components or core application logic and that the original course remains functional.

Run available tests and checks, and report their actual results.

## 10. Documentation and Completion

Provide a concise README explaining how to run the application, how content is organized, which Markdown features are supported, how lesson ordering works, and how to add a new course.

Include a concrete example of adding another course without changing existing application code.

Preserve useful existing files and avoid unnecessary restructuring. Do not modify lesson content unless explicitly requested.

### Definition of Done

The application must:

1. Render my existing Markdown lessons correctly.
2. Provide intuitive course and lesson navigation.
3. Have a polished, responsive, visually distinctive design.
4. Follow a simple, modular architecture with appropriate design patterns.
5. Keep content, navigation, rendering, and presentation separated.
6. Support new courses through content files and configuration alone.
7. Remain easy to maintain and extend as requirements evolve.
8. Include useful documentation and verified tests.

**Final priority:** Build the simplest architecture that satisfies these requirements. Do not sacrifice clean code, visual quality, or the plug-and-play content system in pursuit of unnecessary features or abstractions.