package vn.careermate.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();
        
        // Log authentication attempts for profile endpoints
        if (requestPath.contains("/students/profile")) {
            logger.debug("JWT Filter - Request to: " + requestPath + " with Authorization header: " + 
                (authHeader != null ? "Present" : "Missing"));
        }
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (requestPath.contains("/students/profile")) {
                logger.warn("JWT Filter - No Bearer token found for: " + requestPath);
            }
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(jwt);
            
            if (requestPath.contains("/students/profile")) {
                logger.debug("JWT Filter - Extracted email from token: " + (userEmail != null ? userEmail : "null"));
            }

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    if (requestPath.contains("/students/profile")) {
                        logger.info("JWT Filter - Authentication set successfully for user: " + userEmail);
                    }
                } else {
                    if (requestPath.contains("/students/profile")) {
                        logger.warn("JWT Filter - Token is invalid for user: " + userEmail);
                    }
                }
            } else {
                if (requestPath.contains("/students/profile")) {
                    if (userEmail == null) {
                        logger.warn("JWT Filter - Could not extract email from token");
                    } else {
                        logger.debug("JWT Filter - Authentication already set or userEmail is null");
                    }
                }
            }
        } catch (Exception e) {
            logger.error("JWT Filter - Cannot set user authentication for path: " + requestPath, e);
            if (requestPath.contains("/students/profile")) {
                logger.error("JWT Filter - Error details: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
