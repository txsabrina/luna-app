package dev.luna.learning.infrastructure.rest;

import dev.luna.learning.application.LearningService;
import dev.luna.learning.domain.Lesson;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LearningResource {
    public record Link(String id, String title, String status) {}
    public record Navigation(String id, String title, String status, String parentId, List<Link> children) {}
    public record EvaluationRequest(Integer contentVersion, String selectedOptionId) {}
    private final LearningService service;
    public LearningResource(LearningService service) { this.service = service; }

    @GET @Path("/courses/{id}")
    public Navigation course(@PathParam("id") String id) {
        if (!"tarot-cards-foundations".equals(id)) throw missing();
        return new Navigation(id, "Cartas e fundamentos", "PREVIEW", "tarot",
                List.of(new Link("major-arcana", "Arcanos Maiores", "PREVIEW")));
    }

    @GET @Path("/modules/{id}")
    public Navigation module(@PathParam("id") String id) {
        if (!"major-arcana".equals(id)) throw missing();
        return new Navigation(id, "Arcanos Maiores", "PREVIEW", "tarot-cards-foundations",
                List.of(new Link("fool-first-step", "O Louco — o primeiro passo", "PREVIEW")));
    }

    @GET @Path("/lessons/{id}")
    public Lesson lesson(@PathParam("id") String id) { return service.lesson(id); }

    @POST @Path("/lessons/{lessonId}/steps/{stepId}/evaluate")
    public LearningService.Evaluation evaluate(@PathParam("lessonId") String lessonId,
                                               @PathParam("stepId") String stepId,
                                               EvaluationRequest request) {
        if (request == null) throw new LearningService.LearningError(400, "INVALID_REQUEST", "Informe a alternativa e a versão.");
        return service.evaluate(lessonId, stepId, request.contentVersion(), request.selectedOptionId());
    }

    private LearningService.LearningError missing() {
        return new LearningService.LearningError(404, "CONTENT_NOT_FOUND", "O conteúdo não foi encontrado.");
    }
}
