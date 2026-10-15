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
        assertEquals(4, json(lesson).get("steps").size());
        assertFalse(lesson.body().contains("expectedOptionId"));
        assertFalse(lesson.body().contains("assessments"));
        assertFalse(json(lesson).get("steps").get(3).has("feedback"));
    }

    @Test
    void statelessEvaluationAndConsistentErrors() throws Exception {
        for (String option : java.util.List.of("reference-first", "small-experiment", "strict-routine", "complete-confidence")) {
            var response = evaluate("{\"contentVersion\":1,\"selectedOptionId\":\"" + option + "\"}");
            assertEquals(200, response.statusCode());
            assertEquals(option.equals("small-experiment"), json(response).get("correct").asBoolean());
            assertFalse(json(response).get("selectedOptionFeedback").asText().isBlank());
            assertEquals("small-experiment", json(response).get("expectedOptionId").asText());
        }
        var invalid = evaluate("{\"contentVersion\":1,\"selectedOptionId\":\"invalid\"}");
        assertEquals(400, invalid.statusCode());
        assertEquals("INVALID_OPTION", json(invalid).get("code").asText());
        var outdated = evaluate("{\"contentVersion\":2,\"selectedOptionId\":\"small-experiment\"}");
        assertEquals(409, outdated.statusCode());
        assertEquals("CONTENT_VERSION_MISMATCH", json(outdated).get("code").asText());
        var missing = get("/api/v1/lessons/missing");
        assertEquals(404, missing.statusCode());
        assertEquals("LESSON_NOT_FOUND", json(missing).get("code").asText());
        assertFalse(missing.body().contains("stackTrace"));
    }
}
