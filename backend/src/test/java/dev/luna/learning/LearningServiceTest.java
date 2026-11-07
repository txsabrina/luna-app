package dev.luna.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.luna.learning.application.LearningService;
import dev.luna.learning.domain.Lesson;
import dev.luna.learning.infrastructure.content.LessonContent;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class LearningServiceTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final LessonContent content = new LessonContent(mapper);
    private final LearningService service = new LearningService(content);

    @Test
    void loadsTwentyStepsAndPreservesTheOriginalStableIds() {
        var lesson = service.lesson("fool-first-step");
        assertEquals(20, lesson.steps().size());
        assertEquals(java.util.List.of(4, 6, 5, 5), lesson.paths().stream().map(path -> path.stepIds().size()).toList());
        assertEquals(4, lesson.contentVersion());
        assertEquals("AVAILABLE", lesson.status());
        assertEquals(java.util.List.of("01-opening", "02-observation", "03-core", "04-context",
                "05-edge", "06-dog", "07-resources", "08-landscape", "09-observe-interpret", "10-connection"),
                lesson.steps().stream().limit(10).map(Lesson.Step::id).toList());
        assertInstanceOf(Lesson.Explanation.class, lesson.steps().get(0));
        assertInstanceOf(Lesson.Observation.class, lesson.steps().get(1));
        assertInstanceOf(Lesson.SingleChoice.class, lesson.steps().get(3));
    }

    @Test
    void publicPresentationDoesNotExposeAssessment() throws Exception {
        var json = mapper.writeValueAsString(service.lesson("fool-first-step"));
        assertFalse(json.contains("expectedOptionId"));
        assertFalse(json.contains("assessments"));
        assertFalse(json.contains("correct"));
        var tree = mapper.readTree(json);
        assertEquals("single-choice", tree.get("steps").get(3).get("type").asText());
        assertFalse(tree.get("steps").get(3).has("feedback"));
        assertFalse(tree.get("steps").get(3).get("options").get(0).has("feedback"));
    }

    @Test
    void eachOptionReceivesItsSpecificFeedback() {
        var assessment = content.document().assessments().get("04-context");
        assertEquals(4, new java.util.HashSet<>(assessment.feedback().values()).size());
        for (var entry : assessment.feedback().entrySet()) {
            var result = service.evaluate("fool-first-step", "04-context", 4, entry.getKey());
            assertEquals(entry.getKey().equals("small-experiment"), result.correct());
            assertEquals(entry.getValue(), result.selectedOptionFeedback());
            assertEquals("small-experiment", result.expectedOptionId());
            assertFalse(result.explanation().isBlank());
        }
    }

    @Test
    void rejectsUnknownContentInvalidOptionAndIncompatibleVersion() {
        assertError(404, "LESSON_NOT_FOUND", () -> service.lesson("other"));
        assertError(404, "STEP_NOT_FOUND", () -> service.evaluate("fool-first-step", "other", 1, "dog"));
        assertError(400, "STEP_NOT_EVALUABLE", () -> service.evaluate("fool-first-step", "02-observation", 1, "dog"));
        assertError(400, "INVALID_OPTION", () -> service.evaluate("fool-first-step", "04-context", 4, "dog"));
        assertError(409, "CONTENT_VERSION_MISMATCH", () -> service.evaluate("fool-first-step", "04-context", 1, "small-experiment"));
        assertError(400, "INVALID_REQUEST", () -> service.evaluate("fool-first-step", "04-context", null, null));
    }

    @Test
    void detectsMissingAssessmentAndOrphanAssessment() {
        var document = content.document();
        assertThrows(IllegalStateException.class, () -> LessonContent.validate(
                new LessonContent.Document(document.lesson(), Map.of())));
        assertThrows(IllegalStateException.class, () -> LessonContent.validate(
                new LessonContent.Document(document.lesson(), Map.of("wrong-step",
                        document.assessments().get("04-context")))));
        assertThrows(IllegalStateException.class, () -> LessonContent.validate(
                new LessonContent.Document(document.lesson(), Map.of("04-context",
                        new LessonContent.Assessment("invalid", "Explanation", Map.of(), null)))));
    }

    @Test
    void classificationValidatesCompleteUniqueAssignmentsAndCategories() {
        var assignments = content.document().assessments().get("09-observe-interpret").items().entrySet().stream()
                .map(entry -> new LearningService.Assignment(entry.getKey(), entry.getValue().expectedCategoryId())).toList();
        assertTrue(service.classify("fool-first-step", "09-observe-interpret", 4, assignments).correct());
        var wrong = assignments.stream().map(item -> new LearningService.Assignment(item.itemId(),
                item.categoryId().equals("observation") ? "interpretation" : "observation")).toList();
        var result = service.classify("fool-first-step", "09-observe-interpret", 4, wrong);
        assertFalse(result.correct());
        assertEquals(4, result.items().size());
        assertTrue(result.items().stream().allMatch(item -> !item.feedback().isBlank() && !item.correct()));
        assertError(400, "INCOMPLETE_CLASSIFICATION", () -> service.classify("fool-first-step", "09-observe-interpret", 4, java.util.List.of()));
        assertError(400, "INVALID_ASSIGNMENT", () -> service.classify("fool-first-step", "09-observe-interpret", 4,
                java.util.List.of(assignments.get(0), assignments.get(0))));
        for (var invalid : java.util.List.of(new LearningService.Assignment("unknown", "observation"),
                new LearningService.Assignment("rose-visible", "unknown")))
            assertError(400, "INVALID_ASSIGNMENT", () -> service.classify("fool-first-step", "09-observe-interpret", 4, java.util.List.of(invalid)));
        assertError(409, "CONTENT_VERSION_MISMATCH", () -> service.classify("fool-first-step", "09-observe-interpret", 2, assignments));
        assertError(400, "STEP_NOT_EVALUABLE", () -> service.classify("fool-first-step", "05-edge", 4, assignments));
        assertError(404, "LESSON_NOT_FOUND", () -> service.classify("unknown", "09-observe-interpret", 4, assignments));
        assertError(404, "STEP_NOT_FOUND", () -> service.classify("fool-first-step", "unknown", 4, assignments));
        assertError(400, "INVALID_REQUEST", () -> service.classify("fool-first-step", "09-observe-interpret", null, null));
    }

    @Test
    void connectionCriterionIsContextualAndPublicKeysRemainPrivate() throws Exception {
        assertTrue(service.evaluate("fool-first-step", "10-connection", 4, "motion-edge").correct());
        for (var option : java.util.List.of("rose-bundle", "sun-mountains"))
            assertFalse(service.evaluate("fool-first-step", "10-connection", 4, option).correct());
        assertFalse(mapper.writeValueAsString(service.lesson("fool-first-step")).contains("expectedCategoryId"));
    }

    @Test
    void rejectsMalformedClassificationContent() throws Exception {
        var original = mapper.valueToTree(content.document());
        for (String mutation : java.util.List.of("missing-item", "duplicate-item", "invalid-category", "missing-feedback")) {
            var tree = original.deepCopy();
            var classification = tree.get("lesson").get("steps").get(8);
            var items = (com.fasterxml.jackson.databind.node.ArrayNode) classification.get("items");
            var key = (com.fasterxml.jackson.databind.node.ObjectNode) tree.get("assessments").get("09-observe-interpret").get("items").get("rose-visible");
            switch (mutation) {
                case "missing-item" -> items.remove(0);
                case "duplicate-item" -> items.add(items.get(0).deepCopy());
                case "invalid-category" -> key.put("expectedCategoryId", "unknown");
                case "missing-feedback" -> ((com.fasterxml.jackson.databind.node.ObjectNode) key.get("feedback")).remove("observation");
                default -> fail("Unknown mutation");
            }
            var invalid = mapper.treeToValue(tree, LessonContent.Document.class);
            assertThrows(IllegalStateException.class, () -> LessonContent.validate(invalid), mutation);
        }
    }

    private void assertError(int status, String code, org.junit.jupiter.api.function.Executable action) {
        var error = assertThrows(LearningService.LearningError.class, action);
        assertEquals(status, error.status());
        assertEquals(code, error.code());
    }

    @Test
    void newChoicesAndThreeCategoryClassificationUsePrivateVersionedKeys() throws Exception {
        for (var id : java.util.List.of("11-zero", "14-limits", "17-two-readings")) {
            var key = content.document().assessments().get(id);
            for (var option : key.feedback().keySet()) {
                var result = service.evaluate("fool-first-step", id, 4, option);
                assertEquals(option.equals(key.expectedOptionId()), result.correct());
                assertEquals(key.feedback().get(option), result.selectedOptionFeedback());
            }
            assertError(409, "CONTENT_VERSION_MISMATCH", () -> service.evaluate("fool-first-step", id, 3, key.expectedOptionId()));
        }
        var key = content.document().assessments().get("12-attention");
        var assignments = key.items().entrySet().stream()
                .map(entry -> new LearningService.Assignment(entry.getKey(), entry.getValue().expectedCategoryId())).toList();
        assertEquals(3, assignments.size());
        assertTrue(service.classify("fool-first-step", "12-attention", 4, assignments).correct());
        assertError(400, "INCOMPLETE_CLASSIFICATION", () -> service.classify("fool-first-step", "12-attention", 4, assignments.subList(0, 2)));
        assertError(409, "CONTENT_VERSION_MISMATCH", () -> service.classify("fool-first-step", "12-attention", 3, assignments));
        var publicJson = mapper.writeValueAsString(service.lesson("fool-first-step"));
        assertFalse(publicJson.contains("expectedCategoryId"));
        assertFalse(publicJson.contains("expectedOptionId"));
        assertEquals(4, mapper.readTree(publicJson).get("paths").size());
    }

    @Test
    void rejectsMissingPathsAndInvalidStudyInteractions() throws Exception {
        var original = mapper.valueToTree(content.document());
        var paths = original.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) paths.get("lesson").get("paths")).remove(3);
        assertThrows(IllegalStateException.class, () -> LessonContent.validate(mapper.treeToValue(paths, LessonContent.Document.class)));
        var study = original.deepCopy();
        ((com.fasterxml.jackson.databind.node.ObjectNode) study.get("lesson").get("steps").get(15)).put("cardMode", "unknown");
        assertThrows(IllegalStateException.class, () -> LessonContent.validate(mapper.treeToValue(study, LessonContent.Document.class)));
    }
}
