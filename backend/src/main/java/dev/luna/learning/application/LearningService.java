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
    public record Assignment(String itemId, String categoryId) {}
    public record ItemResult(String itemId, String selectedCategoryId, String expectedCategoryId,
                             boolean correct, String feedback) {}
    public record ClassificationEvaluation(boolean correct, java.util.List<ItemResult> items) {}

    public ClassificationEvaluation classify(String lessonId, String stepId, Integer version,
                                               java.util.List<Assignment> assignments) {
        var lesson = lesson(lessonId);
        var step = lesson.steps().stream().filter(item -> item.id().equals(stepId)).findFirst()
                .orElseThrow(() -> new LearningError(404, "STEP_NOT_FOUND", "A etapa não foi encontrada."));
        if (!(step instanceof Lesson.Classification classification))
            throw new LearningError(400, "STEP_NOT_EVALUABLE", "Esta etapa não recebe classificação.");
        if (version == null || assignments == null)
            throw new LearningError(400, "INVALID_REQUEST", "Informe a versão e todos os itens.");
        if (version != lesson.contentVersion())
            throw new LearningError(409, "CONTENT_VERSION_MISMATCH", "O conteúdo mudou. Reabra a aula para continuar.");
        var selected = new java.util.HashMap<String, String>();
        for (var assignment : assignments) {
            if (assignment == null || assignment.itemId() == null || assignment.categoryId() == null
                    || classification.items().stream().noneMatch(item -> item.id().equals(assignment.itemId()))
                    || classification.categories().stream().noneMatch(category -> category.id().equals(assignment.categoryId()))
                    || selected.putIfAbsent(assignment.itemId(), assignment.categoryId()) != null)
                throw new LearningError(400, "INVALID_ASSIGNMENT", "Confira os itens e as categorias, sem duplicidades.");
        }
        if (selected.size() != classification.items().size())
            throw new LearningError(400, "INCOMPLETE_CLASSIFICATION", "Classifique todos os itens antes de conferir.");
        var assessment = content.document().assessments().get(stepId);
        var results = classification.items().stream().map(item -> {
            var key = assessment.items().get(item.id());
            var category = selected.get(item.id());
            return new ItemResult(item.id(), category, key.expectedCategoryId(),
                    category.equals(key.expectedCategoryId()), key.feedback().get(category));
        }).toList();
        return new ClassificationEvaluation(results.stream().allMatch(ItemResult::correct), results);
    }

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
