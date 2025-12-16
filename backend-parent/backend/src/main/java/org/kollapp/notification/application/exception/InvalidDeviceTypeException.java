package org.kollapp.notification.application.exception;

public class InvalidDeviceTypeException extends RuntimeException {
    public InvalidDeviceTypeException() {
        super("Invalid device type provided.");
    }
}
