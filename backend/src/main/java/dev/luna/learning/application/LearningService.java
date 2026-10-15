package dev.luna.learning.application;

import dev.luna.learning.domain.Lesson;
import dev.luna.learning.infrastructure.content.LessonContent;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class LearningService {
    public static class LearningError extends RuntimeException {
        private final int status;
        private final String code;
        public LearningError(int status, String code, String message) {
            super(message);
            this.status = status;
            this.code = code;
        }
        public int status() { return status; }
        public String code() { return code; }
    }
    public record Evaluation(boolean correct, String selectedOptionFeedback,
                             String expectedOptionId, String explanation) {}
    private final LessonContent content;
    public LearningService(LessonContent content) { this.content = content; }

    public Lesson lesson(String id) {
        if (!content.document().lesson().id().equals(id))
            throw new LearningError(404, "LESSON_NOT_FOUND", "A aula não foi encontrada.");
        return content.document().lesson();
    }

    public Evaluation evaluate(String lessonId, String stepId, Integer version, String optionId) {
        var lesson = lesson(lessonId);
        var step = lesson.steps().stream().filter(item -> item.id().equals(stepId)).findFirst()
                .orElseThrow(() -> new LearningError(404, "STEP_NOT_FOUND", "A etapa não foi encontrada."));
        if (!(step instanceof Lesson.SingleChoice choice))
            throw new LearningError(400, "STEP_NOT_EVALUABLE", "Esta etapa não recebe avaliação.");
        if (version == null || optionId == null || optionId.isBlank())
            throw new LearningError(400, "INVALID_REQUEST", "Informe a versão e a alternativa selecionada.");
        if (version != lesson.contentVersion())
            throw new LearningError(409, "CONTENT_VERSION_MISMATCH", "O conteúdo mudou. Reabra a aula para continuar.");
        if (choice.options().stream().noneMatch(option -> option.id().equals(optionId)))
            throw new LearningError(400, "INVALID_OPTION", "A alternativa não pertence a esta etapa.");
        var assessment = content.document().assessments().get(stepId);
        return new Evaluation(assessment.expectedOptionId().equals(optionId),
                assessment.feedback().get(optionId), assessment.expectedOptionId(), assessment.explanation());
    }
}
