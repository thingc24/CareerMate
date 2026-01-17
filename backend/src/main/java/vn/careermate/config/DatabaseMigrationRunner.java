package vn.careermate.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Component để tự động chạy database migration khi ứng dụng khởi động
 * Chạy migration để thêm các cột hidden vào bảng jobs và articles
 */
@Slf4j
@Component
@Order(1) // Chạy sớm nhất có thể
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting database migration for hidden columns...");
        
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Migration cho jobs table
            log.info("Migrating jobservice.jobs table...");
            
            // Check and add hidden column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'jobservice' 
                            AND table_name = 'jobs' 
                            AND column_name = 'hidden'
                        ) THEN
                            ALTER TABLE jobservice.jobs 
                            ADD COLUMN hidden BOOLEAN DEFAULT false;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden' column to jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not add 'hidden' column to jobs (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_reason column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'jobservice' 
                            AND table_name = 'jobs' 
                            AND column_name = 'hidden_reason'
                        ) THEN
                            ALTER TABLE jobservice.jobs 
                            ADD COLUMN hidden_reason TEXT;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_reason' column to jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_reason' column to jobs (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_at column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'jobservice' 
                            AND table_name = 'jobs' 
                            AND column_name = 'hidden_at'
                        ) THEN
                            ALTER TABLE jobservice.jobs 
                            ADD COLUMN hidden_at TIMESTAMP;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_at' column to jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_at' column to jobs (may already exist): {}", e.getMessage());
            }
            
            // Create index for jobs
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_indexes 
                            WHERE schemaname = 'jobservice' 
                            AND tablename = 'jobs' 
                            AND indexname = 'idx_jobs_hidden'
                        ) THEN
                            CREATE INDEX idx_jobs_hidden ON jobservice.jobs(hidden);
                        END IF;
                    END $$;
                    """);
                log.info("✓ Created index 'idx_jobs_hidden' on jobservice.jobs");
            } catch (Exception e) {
                log.warn("Could not create index for jobs (may already exist): {}", e.getMessage());
            }
            
            // Migration cho articles table
            log.info("Migrating contentservice.articles table...");
            
            // Check and add hidden column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'contentservice' 
                            AND table_name = 'articles' 
                            AND column_name = 'hidden'
                        ) THEN
                            ALTER TABLE contentservice.articles 
                            ADD COLUMN hidden BOOLEAN DEFAULT false;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden' column to contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not add 'hidden' column to articles (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_reason column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'contentservice' 
                            AND table_name = 'articles' 
                            AND column_name = 'hidden_reason'
                        ) THEN
                            ALTER TABLE contentservice.articles 
                            ADD COLUMN hidden_reason TEXT;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_reason' column to contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_reason' column to articles (may already exist): {}", e.getMessage());
            }
            
            // Check and add hidden_at column
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_schema = 'contentservice' 
                            AND table_name = 'articles' 
                            AND column_name = 'hidden_at'
                        ) THEN
                            ALTER TABLE contentservice.articles 
                            ADD COLUMN hidden_at TIMESTAMP;
                        END IF;
                    END $$;
                    """);
                log.info("✓ Added 'hidden_at' column to contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not add 'hidden_at' column to articles (may already exist): {}", e.getMessage());
            }
            
            // Create index for articles
            try {
                statement.execute("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_indexes 
                            WHERE schemaname = 'contentservice' 
                            AND tablename = 'articles' 
                            AND indexname = 'idx_articles_hidden'
                        ) THEN
                            CREATE INDEX idx_articles_hidden ON contentservice.articles(hidden);
                        END IF;
                    END $$;
                    """);
                log.info("✓ Created index 'idx_articles_hidden' on contentservice.articles");
            } catch (Exception e) {
                log.warn("Could not create index for articles (may already exist): {}", e.getMessage());
            }
            
            log.info("✅ Database migration completed successfully!");
            
        } catch (Exception e) {
            log.error("❌ Error running database migration: {}", e.getMessage(), e);
            // Không throw exception để app vẫn có thể chạy được
            // Nếu migration fail, user có thể chạy manual script
        }
    }
}
