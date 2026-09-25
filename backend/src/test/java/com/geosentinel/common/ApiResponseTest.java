package com.geosentinel.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    @DisplayName("Should create successful ApiResponse with data")
    void shouldCreateSuccessResponse() {
        ApiResponse<String> response = ApiResponse.success("Operation successful", "data-payload");

        assertTrue(response.isSuccess());
        assertEquals("Operation successful", response.getMessage());
        assertEquals("data-payload", response.getData());
        assertNotNull(response.getTimestamp());
    }

    @Test
    @DisplayName("Should create error ApiResponse")
    void shouldCreateErrorResponse() {
        ApiResponse<Void> response = ApiResponse.error("Something went wrong");

        assertFalse(response.isSuccess());
        assertEquals("Something went wrong", response.getMessage());
        assertNull(response.getData());
    }
}
