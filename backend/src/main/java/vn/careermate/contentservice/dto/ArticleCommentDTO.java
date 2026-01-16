package vn.careermate.contentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.careermate.contentservice.model.ArticleComment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCommentDTO {
    private UUID id;
    private UserDTO user;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ArticleCommentDTO> replies;

    public static ArticleCommentDTO fromEntity(ArticleComment comment) {
        if (comment == null) {
            return null;
        }

        ArticleCommentDTO dto = ArticleCommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();

        // Map user
        if (comment.getUser() != null) {
            dto.setUser(UserDTO.builder()
                    .id(comment.getUser().getId())
                    .fullName(comment.getUser().getFullName())
                    .email(comment.getUser().getEmail())
                    .avatarUrl(comment.getUser().getAvatarUrl())
                    .build());
        }

        // Map replies recursively (support unlimited nested levels)
        // We don't map parentComment to avoid circular reference
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            dto.setReplies(comment.getReplies().stream()
                    .map(ArticleCommentDTO::fromEntity) // Recursive mapping for nested replies
                    .collect(Collectors.toList()));
        } else {
            dto.setReplies(java.util.Collections.emptyList());
        }

        return dto;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private UUID id;
        private String fullName;
        private String email;
        private String avatarUrl;
    }
}
