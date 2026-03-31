package com.splitzilla.pattern.observer;

import java.util.Map;

/**
 * Observer Pattern - Observer Interface
 */
public interface IObserver {
    void update(Map<String, Object> event);
}
