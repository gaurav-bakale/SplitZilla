package com.splitzilla.pattern.observer;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Observer Pattern - Subject (Singleton)
 * Manages observers and notifies them of events
 */
@Service
public class NotificationService {
    
    private final List<IObserver> observers = new ArrayList<>();
    
    public void attach(IObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }
    
    public void detach(IObserver observer) {
        observers.remove(observer);
    }
    
    public void notifyObservers(Map<String, Object> event) {
        for (IObserver observer : observers) {
            observer.update(event);
        }
    }
}
