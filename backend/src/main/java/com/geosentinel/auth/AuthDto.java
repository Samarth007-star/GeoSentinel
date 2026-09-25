package com.geosentinel.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AuthDto {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        private String displayName;

        public RegisterRequest() {}
        public RegisterRequest(String email, String password, String displayName) {
            this.email = email;
            this.password = password;
            this.displayName = displayName;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
    }

    public static class AuthResponse {
        private String token;
        private String userId;
        private String email;
        private String displayName;
        private List<String> roles;

        public AuthResponse() {}
        public AuthResponse(String token, String userId, String email, String displayName, List<String> roles) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.displayName = displayName;
            this.roles = roles;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String token;
            private String userId;
            private String email;
            private String displayName;
            private List<String> roles;

            public Builder token(String token) { this.token = token; return this; }
            public Builder userId(String userId) { this.userId = userId; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder displayName(String displayName) { this.displayName = displayName; return this; }
            public Builder roles(List<String> roles) { this.roles = roles; return this; }
            public AuthResponse build() {
                return new AuthResponse(token, userId, email, displayName, roles);
            }
        }
    }
}
