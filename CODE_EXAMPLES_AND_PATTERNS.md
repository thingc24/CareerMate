# 💻 CareerMate - Code Examples & Implementation Patterns

**Document Version**: 1.0  
**Date**: 24/01/2026

---

## Table of Contents
1. [Frontend Examples](#frontend-examples)
2. [Backend Examples](#backend-examples)
3. [Common Patterns](#common-patterns)
4. [API Integration](#api-integration)

---

## Frontend Examples

### 1. React Component with Context (Authentication)

```jsx
// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      // Redirect based on role
      switch(result.user.role) {
        case 'STUDENT':
          navigate('/student/dashboard');
          break;
        case 'RECRUITER':
          navigate('/recruiter/dashboard');
          break;
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to CareerMate
        </h2>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-3"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 2. Protected Route Component

```jsx
// src/App.jsx - ProtectedRoute Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Usage in Routes
<Route
  path="/student/*"
  element={
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <StudentLayout>
        <Routes>
          {/* Student routes */}
        </Routes>
      </StudentLayout>
    </ProtectedRoute>
  }
/>
```

### 3. API Service with Axios Interceptors

```javascript
// src/services/api.js - Comprehensive API Client
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class CareerMateAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.refreshToken = null;
    this.loadTokens();
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add JWT token
    this.client.interceptors.request.use(
      (config) => {
        this.loadTokens();
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            this.token = newAccessToken;
            localStorage.setItem('token', newAccessToken);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  loadTokens() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async refreshAccessToken() {
    const response = await this.client.post('/auth/refresh-token', {
      refreshToken: this.refreshToken,
    });
    return response.data.accessToken;
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.token = null;
    this.refreshToken = null;
  }

  // User endpoints
  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await this.client.put(`/users/${userId}`, userData);
    return response.data;
  }

  // Job endpoints
  async getJobs(filter = {}) {
    const response = await this.client.get('/jobs', { params: filter });
    return response.data;
  }

  async getJobDetail(jobId) {
    const response = await this.client.get(`/jobs/${jobId}`);
    return response.data;
  }

  async applyJob(jobId, cvId) {
    const response = await this.client.post('/applications', { jobId, cvId });
    return response.data;
  }

  // CV endpoints
  async uploadCV(formData) {
    const response = await this.client.post('/cvs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async analyzeCv(cvId) {
    const response = await this.client.post(`/ai/analyze-cv`, { cvId });
    return response.data;
  }

  // More endpoints...
}

export default new CareerMateAPI();
```

### 4. Component with useState and useEffect

```jsx
// src/pages/student/JobList.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    salaryMin: 0,
    salaryMax: 999999,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Load jobs on component mount and when filters change
  useEffect(() => {
    loadJobs();
  }, [filters, pagination.page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.getJobs({
        search: filters.search,
        location: filters.location,
        salaryMin: filters.salaryMin,
        salaryMax: filters.salaryMax,
        page: pagination.page,
        limit: pagination.limit,
      });

      setJobs(response.jobs);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Location..."
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Min salary..."
          value={filters.salaryMin}
          onChange={(e) => handleFilterChange('salaryMin', parseInt(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Max salary..."
          value={filters.salaryMax}
          onChange={(e) => handleFilterChange('salaryMax', parseInt(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Job list */}
      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
            <p className="text-gray-600 mt-2">{job.location}</p>
            <p className="font-semibold text-green-600">
              ${job.salaryMin} - ${job.salaryMax}
            </p>
            <a href={`/student/jobs/${job.id}`} className="mt-4 inline-block text-blue-600 hover:underline">
              View Details →
            </a>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page === 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
        </span>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## Backend Examples

### 1. Spring Boot Service Implementation

```java
// user-service/src/main/java/vn/careermate/userservice/service/AuthService.java
package vn.careermate.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.careermate.userservice.dto.LoginRequest;
import vn.careermate.userservice.dto.AuthResponse;
import vn.careermate.userservice.dto.RegisterRequest;
import vn.careermate.userservice.entity.User;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.util.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Authenticate user and return JWT tokens
     */
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        // Store refresh token in database
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .user(new UserDTO(user))
            .message("Login successful")
            .build();
    }

    /**
     * Register new user
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = User.builder()
            .email(registerRequest.getEmail())
            .username(registerRequest.getUsername())
            .password(passwordEncoder.encode(registerRequest.getPassword()))
            .role(registerRequest.getRole())
            .isActive(true)
            .build();

        User savedUser = userRepository.save(user);

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getId());

        savedUser.setRefreshToken(refreshToken);
        userRepository.save(savedUser);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .user(new UserDTO(savedUser))
            .message("Registration successful")
            .build();
    }

    /**
     * Refresh access token
     */
    public String refreshAccessToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String userId = jwtUtil.extractUserId(refreshToken);
        User user = userRepository.findById(UUID.fromString(userId))
            .orElseThrow(() -> new RuntimeException("User not found"));

        return jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
```

### 2. RESTful Controller

```java
// user-service/src/main/java/vn/careermate/userservice/controller/AuthController.java
package vn.careermate.userservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.userservice.dto.LoginRequest;
import vn.careermate.userservice.dto.AuthResponse;
import vn.careermate.userservice.dto.RegisterRequest;
import vn.careermate.userservice.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/login
     * Request body: { "email": "user@example.com", "password": "password123" }
     * Response: { "accessToken": "jwt...", "refreshToken": "jwt...", "user": {...} }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(AuthResponse.builder()
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * POST /api/auth/register
     * Request body: { "email": "...", "username": "...", "password": "...", "role": "STUDENT" }
     * Response: Same as login
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse response = authService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(AuthResponse.builder()
                    .message(e.getMessage())
                    .build());
        }
    }

    /**
     * POST /api/auth/refresh-token
     * Request body: { "refreshToken": "jwt..." }
     * Response: { "accessToken": "jwt..." }
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String newAccessToken = authService.refreshAccessToken(request.getRefreshToken());
            return ResponseEntity.ok(
                Map.of("accessToken", newAccessToken)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/auth/validate-token
     * Header: Authorization: Bearer <token>
     * Response: { "valid": true, "userId": "...", "email": "..." }
     */
    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            boolean isValid = authService.validateToken(jwt);
            
            if (isValid) {
                return ResponseEntity.ok(
                    Map.of("valid", true, "message", "Token is valid")
                );
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "message", "Token is invalid"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "message", e.getMessage()));
        }
    }
}
```

### 3. JPA Repository & Entity

```java
// user-service/src/main/java/vn/careermate/userservice/entity/User.java
package vn.careermate.userservice.entity;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role; // STUDENT, RECRUITER, ADMIN

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "refresh_token")
    private String refreshToken;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// user-service/src/main/java/vn/careermate/userservice/repository/UserRepository.java
package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.entity.User;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
```

### 4. Feign Client for Inter-Service Communication

```java
// common/src/main/java/vn/careermate/common/feign/UserServiceClient.java
package vn.careermate.common.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import vn.careermate.common.dto.UserDTO;

@FeignClient(
    name = "user-service",
    url = "${app.services.user-service-url:http://localhost:8081}"
)
public interface UserServiceClient {

    @GetMapping("/api/users/{userId}")
    UserDTO getUserById(@PathVariable String userId);

    @PostMapping("/api/auth/validate-token")
    ValidateTokenResponse validateToken(@RequestBody ValidateTokenRequest request);

    @GetMapping("/api/students/{studentId}")
    StudentProfileDTO getStudentProfile(@PathVariable String studentId);
}

// Usage in another service
@Service
public class JobService {
    @Autowired
    private UserServiceClient userServiceClient;

    public void createJob(JobDTO jobDTO) {
        // Verify recruiter exists
        UserDTO recruiter = userServiceClient.getUserById(jobDTO.getRecruiterId().toString());
        
        if (recruiter == null) {
            throw new RuntimeException("Recruiter not found");
        }

        // Create job...
    }
}
```

### 5. Global Exception Handler

```java
// user-service/src/main/java/vn/careermate/userservice/exception/GlobalExceptionHandler.java
package vn.careermate.userservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import vn.careermate.common.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex,
        WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
            .status(HttpStatus.NOT_FOUND.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
        UnauthorizedException ex,
        WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
            .status(HttpStatus.UNAUTHORIZED.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
        Exception ex,
        WebRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .message("An internal error occurred")
            .timestamp(LocalDateTime.now())
            .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

---

## Common Patterns

### 1. Error Handling Pattern

**Frontend:**
```javascript
try {
  const response = await api.getJobs();
  setJobs(response);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    navigate('/login');
  } else if (error.response?.status === 403) {
    // Access denied
    setError('You do not have permission to perform this action');
  } else {
    setError(error.response?.data?.message || 'An error occurred');
  }
}
```

**Backend:**
```java
@GetMapping("/jobs")
public ResponseEntity<?> getJobs(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "10") int limit
) {
    try {
        List<Job> jobs = jobService.getJobs(page, limit);
        return ResponseEntity.ok(
            Map.of("status", "success", "data", jobs)
        );
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("status", "error", "message", e.getMessage()));
    }
}
```

### 2. Pagination Pattern

**Frontend:**
```javascript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [total, setTotal] = useState(0);

const loadData = async () => {
  const response = await api.getItems({ page, limit });
  setItems(response.items);
  setTotal(response.total);
};

const totalPages = Math.ceil(total / limit);
```

**Backend:**
```java
public Page<Job> getJobs(int page, int limit) {
    Pageable pageable = PageRequest.of(page - 1, limit);
    return jobRepository.findAll(pageable);
}

@GetMapping("/jobs")
public ResponseEntity<?> getJobs(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "10") int limit
) {
    Page<Job> jobsPage = jobService.getJobs(page, limit);
    return ResponseEntity.ok(Map.of(
        "items", jobsPage.getContent(),
        "total", jobsPage.getTotalElements(),
        "totalPages", jobsPage.getTotalPages(),
        "currentPage", page
    ));
}
```

### 3. Search & Filter Pattern

**Frontend:**
```javascript
const [filters, setFilters] = useState({
  search: '',
  location: '',
  salaryMin: 0,
  salaryMax: 999999,
});

const handleSearch = useCallback(
  debounce(async (filters) => {
    const response = await api.searchJobs(filters);
    setResults(response);
  }, 500),
  []
);

useEffect(() => {
  handleSearch(filters);
}, [filters]);
```

**Backend:**
```java
@GetMapping("/jobs/search")
public ResponseEntity<?> searchJobs(
    @RequestParam(required = false) String search,
    @RequestParam(required = false) String location,
    @RequestParam(required = false) BigDecimal salaryMin,
    @RequestParam(required = false) BigDecimal salaryMax,
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "10") int limit
) {
    Page<Job> results = jobService.searchJobs(
        search, location, salaryMin, salaryMax, page, limit
    );
    return ResponseEntity.ok(results);
}

@Override
public Page<Job> searchJobs(
    String search, String location, BigDecimal salaryMin, 
    BigDecimal salaryMax, int page, int limit
) {
    Specification<Job> spec = Specification
        .where(JobSpecifications.hasTitle(search))
        .and(JobSpecifications.hasLocation(location))
        .and(JobSpecifications.hasSalaryInRange(salaryMin, salaryMax));
    
    Pageable pageable = PageRequest.of(page - 1, limit);
    return jobRepository.findAll(spec, pageable);
}
```

---

## API Integration

### Call Flow Example: Student Applying for a Job

**Frontend:**
```javascript
// student/JobDetail.jsx
async function handleApplyJob() {
  try {
    setApplying(true);
    const response = await api.applyJob({
      jobId: job.id,
      cvId: selectedCV.id,
    });
    
    showSuccess('Application submitted successfully!');
    navigate('/student/applications');
  } catch (error) {
    showError(error.message);
  } finally {
    setApplying(false);
  }
}
```

**Backend Request Flow:**
```
1. API Gateway (8080) receives request
   POST /api/applications
   Header: Authorization: Bearer <jwt>
   Body: { jobId: "123", cvId: "456" }

2. API Gateway validates JWT

3. Routes to Job Service (8082)

4. JobController.applyJob() receives request
   - Extract user from JWT
   - Validate job exists (JobRepository)
   - Validate CV belongs to user (verify via CV metadata)
   - Create Application record
   
5. JobService calls UserServiceClient to get student profile
   - GET http://localhost:8081/api/students/{studentId}
   - Feign makes the call via Eureka discovery

6. JobService calls NotificationServiceClient to send notification
   - POST http://localhost:8086/api/notifications
   - Sends "Application Submitted" notification

7. Response sent back through API Gateway

8. Frontend receives response and updates UI
```

---

*End of Code Examples & Implementation Patterns Document*
