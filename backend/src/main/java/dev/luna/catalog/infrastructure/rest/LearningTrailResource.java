package dev.luna.catalog.infrastructure.rest;

import dev.luna.catalog.application.GetLearningTrails;
import dev.luna.catalog.domain.LearningTrail;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/v1/trails")
@Produces(MediaType.APPLICATION_JSON)
public class LearningTrailResource {

    private final GetLearningTrails getLearningTrails;

    public LearningTrailResource(GetLearningTrails getLearningTrails) {
        this.getLearningTrails = getLearningTrails;
    }

    @GET
    public List<LearningTrailResponse> list() {
        return getLearningTrails.execute()
                .stream()
                .map(LearningTrailResponse::from)
                .toList();
    }

    public record LearningTrailResponse(
            String id,
            String title,
            String description,
            int plannedCourseCount,
            String status
    ) {
        static LearningTrailResponse from(LearningTrail trail) {
            return new LearningTrailResponse(
                    trail.id(),
                    trail.title(),
                    trail.description(),
                    trail.plannedCourseCount(),
                    trail.status().name()
            );
        }
    }
}
