package dev.luna.learning;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.common.http.TestHTTPResource;
import org.junit.jupiter.api.Test;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class LearningResourceTest {
    @TestHTTPResource URI base;
    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    private HttpResponse<String> get(String path) throws Exception {
        return client.send(HttpRequest.newBuilder(base.resolve(path)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpResponse<String> evaluate(String body) throws Exception {
        return client.send(HttpRequest.newBuilder(base.resolve("/api/v1/lessons/fool-first-step/steps/04-context/evaluate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpResponse<String> classify(String body) throws Exception {
        return client.send(HttpRequest.newBuilder(base.resolve("/api/v1/lessons/fool-first-step/steps/09-observe-interpret/classify"))
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    }
    @Test
    void classificationHttpContract() throws Exception {
        var incomplete = classify("{\"contentVersion\":3,\"assignments\":[]}");
        assertEquals(400, incomplete.statusCode());
        assertEquals("INCOMPLETE_CLASSIFICATION", json(incomplete).get("code").asText());
        var assignments = java.util.List.of(
                new dev.luna.learning.application.LearningService.Assignment("rose-visible", "observation"),
                new dev.luna.learning.application.LearningService.Assignment("rose-meaning", "interpretation"),
                new dev.luna.learning.application.LearningService.Assignment("dog-contact", "observation"),
                new dev.luna.learning.application.LearningService.Assignment("dog-attention", "interpretation"));
        var body = mapper.writeValueAsString(java.util.Map.of("contentVersion", 3, "assignments", assignments));
        var correct = classify(body);
        assertEquals(200, correct.statusCode());
        assertTrue(json(correct).get("correct").asBoolean());
        assertEquals(4, json(correct).get("items").size());
        assertEquals(409, classify(body.replace("\"contentVersion\":3", "\"contentVersion\":2")).statusCode());
        var incorrect = classify(body.replace("interpretation", "observation"));
        assertEquals(200, incorrect.statusCode());
        assertFalse(json(incorrect).get("correct").asBoolean());
    }
    private JsonNode json(HttpResponse<String> response) throws Exception { return mapper.readTree(response.body()); }

    @Test
    void catalogHierarchyAndPublicLesson() throws Exception {
        var trails = get("/api/v1/trails");
        assertEquals(200, trails.statusCode());
        assertEquals(3, json(trails).size());
        var course = get("/api/v1/courses/tarot-cards-foundations");
        assertEquals(200, course.statusCode());
        assertEquals("tarot", json(course).get("parentId").asText());
        assertEquals("major-arcana", json(course).get("children").get(0).get("id").asText());
        var module = get("/api/v1/modules/major-arcana");
        assertEquals(200, module.statusCode());
        assertEquals("fool-first-step", json(module).get("children").get(0).get("id").asText());
        var lesson = get("/api/v1/lessons/fool-first-step");
        assertEquals(200, lesson.statusCode());
        assertEquals("PREVIEW", json(lesson).get("status").asText());
        assertEquals(10, json(lesson).get("steps").size());
        assertEquals(3, json(lesson).get("contentVersion").asInt());
        assertEquals("major-00-fool", json(lesson).get("steps").get(1).get("cardId").asText());
        assertFalse(json(lesson).get("steps").get(1).has("imagePath"));
        assertFalse(lesson.body().contains("expectedOptionId"));
        assertFalse(lesson.body().contains("assessments"));
        assertFalse(lesson.body().contains("expectedCategoryId"));
        assertFalse(json(lesson).get("steps").get(3).has("feedback"));
    }

    @Test
    void statelessEvaluationAndConsistentErrors() throws Exception {
        for (String option : java.util.List.of("reference-first", "small-experiment", "strict-routine", "complete-confidence")) {
            var response = evaluate("{\"contentVersion\":3,\"selectedOptionId\":\"" + option + "\"}");
            assertEquals(200, response.statusCode());
            assertEquals(option.equals("small-experiment"), json(response).get("correct").asBoolean());
            assertFalse(json(response).get("selectedOptionFeedback").asText().isBlank());
            assertEquals("small-experiment", json(response).get("expectedOptionId").asText());
        }
        var invalid = evaluate("{\"contentVersion\":3,\"selectedOptionId\":\"invalid\"}");
        assertEquals(400, invalid.statusCode());
        assertEquals("INVALID_OPTION", json(invalid).get("code").asText());
        var outdated = evaluate("{\"contentVersion\":1,\"selectedOptionId\":\"small-experiment\"}");
        assertEquals(409, outdated.statusCode());
        assertEquals("CONTENT_VERSION_MISMATCH", json(outdated).get("code").asText());
        var missing = get("/api/v1/lessons/missing");
        assertEquals(404, missing.statusCode());
        assertEquals("LESSON_NOT_FOUND", json(missing).get("code").asText());
        assertFalse(missing.body().contains("stackTrace"));
    }
}
