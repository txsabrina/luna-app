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
    void loadsOnlyFourPreviewStepsAndStableIds() {
        var lesson = service.lesson("fool-first-step");
        assertEquals(1, lesson.contentVersion());
        assertEquals("PREVIEW", lesson.status());
        assertEquals(java.util.List.of("01-opening", "02-observation", "03-core", "04-context"),
                lesson.steps().stream().map(Lesson.Step::id).toList());
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
            var result = service.evaluate("fool-first-step", "04-context", 1, entry.getKey());
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
        assertError(400, "INVALID_OPTION", () -> service.evaluate("fool-first-step", "04-context", 1, "dog"));
        assertError(409, "CONTENT_VERSION_MISMATCH", () -> service.evaluate("fool-first-step", "04-context", 2, "small-experiment"));
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
                        new LessonContent.Assessment("invalid", "Explanation", Map.of())))));
    }

    private void assertError(int status, String code, org.junit.jupiter.api.function.Executable action) {
        var error = assertThrows(LearningService.LearningError.class, action);
        assertEquals(status, error.status());
        assertEquals(code, error.code());
    }
}
