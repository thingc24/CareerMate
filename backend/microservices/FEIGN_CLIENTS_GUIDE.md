# Feign Clients Guide

## Cách sử dụng Feign Client trong Microservices

### 1. Thêm Common Module Dependency

Trong `pom.xml` của mỗi service cần gọi service khác:

```xml
<dependency>
    <groupId>vn.careermate</groupId>
    <artifactId>common</artifactId>
    <version>1.0.0</version>
    <scope>compile</scope>
</dependency>
```

### 2. Ví dụ: AdminService gọi NotificationService

**Trước (Monolith):**
```java
private final NotificationService notificationService;

notificationService.notifyJobHidden(userId, jobId, title, reason);
```

**Sau (Microservices):**
```java
@Autowired
private NotificationServiceClient notificationServiceClient;

NotificationRequest request = NotificationRequest.builder()
    .userId(userId)
    .type("JOB_HIDDEN")
    .title("Job đã bị ẩn")
    .message("Job của bạn đã bị ẩn. Lý do: " + reason)
    .relatedEntityId(jobId)
    .relatedEntityType("JOB")
    .build();
notificationServiceClient.notifyJobHidden(request);
```

### 3. Các Feign Clients cần tạo

- `UserServiceClient` - Lấy thông tin user
- `NotificationServiceClient` - Gửi notifications
- `JobServiceClient` - Lấy thông tin job (nếu cần)
- `ContentServiceClient` - Lấy thông tin article (nếu cần)
