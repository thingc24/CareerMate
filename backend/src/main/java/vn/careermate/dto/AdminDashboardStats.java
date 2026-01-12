package vn.careermate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {
    private long totalUsers;
    private long totalStudents;
    private long totalRecruiters;
    private long totalAdmins;
    private long totalJobs;
    private long pendingJobs;
    private long activeJobs;
    private long totalApplications;
    private long totalCompanies;
    private long totalArticles;
    private long pendingArticles;
    private long publishedArticles;
}
