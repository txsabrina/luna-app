package dev.luna.learning.infrastructure.rest;

import dev.luna.learning.application.LearningService.LearningError;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

@Provider
public class LearningErrorMapper implements ExceptionMapper<Exception> {
    private static final Logger LOG = Logger.getLogger(LearningErrorMapper.class);
    public record ApiError(String code, String message) {}

    @Override
    public Response toResponse(Exception exception) {
        int status;
        ApiError error;
        if (exception instanceof LearningError learning) {
            status = learning.status();
            error = new ApiError(learning.code(), learning.getMessage());
        } else if (exception instanceof WebApplicationException web) {
            status = web.getResponse().getStatus();
            error = new ApiError("HTTP_" + status, "Não foi possível processar a solicitação.");
        } else {
            LOG.error("Learning request failed", exception);
            status = 500;
            error = new ApiError("INTERNAL_ERROR", "Não foi possível carregar ou avaliar o conteúdo. Tente novamente.");
        }
        return Response.status(status).type("application/json").entity(error).build();
    }
}
