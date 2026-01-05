# CareerMate Backend - Project Structure

```
backend/
├── database/
│   └── schema.sql                    # PostgreSQL database schema
│
├── src/
│   ├── main/
│   │   ├── java/vn/careermate/
│   │   │   ├── CareerMateApplication.java
│   │   │   │
│   │   │   ├── config/               # Configuration classes
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtService.java
│   │   │   │   ├── WebClientConfig.java
│   │   │   │   └── OpenAPIConfig.java
│   │   │   │
│   │   │   ├── controller/           # REST Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── StudentController.java
│   │   │   │   ├── RecruiterController.java
│   │   │   │   └── AdminController.java
│   │   │   │
│   │   │   ├── service/              # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── StudentService.java
│   │   │   │   ├── RecruiterService.java
│   │   │   │   ├── AdminService.java
│   │   │   │   ├── AIService.java
│   │   │   │   ├── FileStorageService.java
│   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   │
│   │   │   ├── repository/           # Data access layer
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── StudentProfileRepository.java
│   │   │   │   ├── RecruiterProfileRepository.java
│   │   │   │   ├── JobRepository.java
│   │   │   │   ├── ApplicationRepository.java
│   │   │   │   ├── CVRepository.java
│   │   │   │   ├── CompanyRepository.java
│   │   │   │   └── JobSkillRepository.java
│   │   │   │
│   │   │   ├── model/                # Entity models
│   │   │   │   ├── User.java
│   │   │   │   ├── StudentProfile.java
│   │   │   │   ├── RecruiterProfile.java
│   │   │   │   ├── Job.java
│   │   │   │   ├── Application.java
│   │   │   │   ├── CV.java
│   │   │   │   ├── Company.java
│   │   │   │   ├── JobSkill.java
│   │   │   │   ├── StudentSkill.java
│   │   │   │   └── ApplicationHistory.java
│   │   │   │
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   │   ├── AuthRequest.java
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── UserInfo.java
│   │   │   │   ├── JobDTO.java
│   │   │   │   ├── CompanyDTO.java
│   │   │   │   ├── ApplicationDTO.java
│   │   │   │   ├── CVDTO.java
│   │   │   │   ├── StudentProfileDTO.java
│   │   │   │   └── StudentSkillDTO.java
│   │   │   │
│   │   │   ├── exception/            # Exception handling
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ErrorResponse.java
│   │   │   │
│   │   │   └── util/                 # Utility classes
│   │   │       ├── PDFExtractor.java
│   │   │       └── DOCXExtractor.java
│   │   │
│   │   └── resources/
│   │       └── application.yml       # Application configuration
│   │
│   └── test/                         # Test files (to be added)
│
├── pom.xml                           # Maven dependencies
├── Dockerfile                        # Docker configuration
├── docker-compose.yml               # Docker Compose setup
├── .gitignore                       # Git ignore rules
├── .env.example                     # Environment variables template
│
├── README.md                        # Main documentation
├── QUICK_START.md                   # Quick start guide
├── IMPLEMENTATION_SUMMARY.md        # Implementation details
├── FINAL_SUMMARY.md                 # Complete summary
└── PROJECT_STRUCTURE.md            # This file
```

## Package Descriptions

### `config/`
Configuration classes for:
- Security (JWT, OAuth2, CORS)
- WebClient for external API calls
- OpenAPI/Swagger documentation

### `controller/`
REST API endpoints:
- **AuthController**: Authentication endpoints
- **StudentController**: Student-specific endpoints
- **RecruiterController**: Recruiter-specific endpoints
- **AdminController**: Admin management endpoints

### `service/`
Business logic layer:
- **AuthService**: Authentication & authorization
- **StudentService**: Student operations
- **RecruiterService**: Recruiter operations
- **AdminService**: Admin operations
- **AIService**: AI integration (Gemini API)
- **FileStorageService**: File management

### `repository/`
Data access layer (JPA repositories):
- Extends `JpaRepository` for CRUD operations
- Custom query methods
- Search and filtering

### `model/`
JPA entity models:
- Database table mappings
- Relationships (OneToMany, ManyToOne)
- Validation annotations

### `dto/`
Data Transfer Objects:
- Request/Response DTOs
- Data validation
- API contract definition

### `exception/`
Exception handling:
- Global exception handler
- Custom error responses
- Validation error handling

### `util/`
Utility classes:
- PDF text extraction
- DOCX text extraction
- Helper methods

## Key Files

### `application.yml`
Main configuration file with:
- Database connection
- JWT settings
- AI service configuration
- File upload settings
- Logging configuration

### `schema.sql`
Complete database schema:
- Table definitions
- Indexes
- Triggers
- Initial data

### `docker-compose.yml`
Docker setup for:
- PostgreSQL database
- Redis cache
- Backend application

## Dependencies

See `pom.xml` for complete list. Key dependencies:
- Spring Boot 3.2.0
- PostgreSQL Driver
- JWT (jjwt)
- Lombok
- PDFBox
- Apache POI
- WebFlux
- Swagger/OpenAPI

## Build & Run

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Or with Docker
docker-compose up -d
```

## API Documentation

Access Swagger UI at: `http://localhost:8080/api/swagger-ui.html`

