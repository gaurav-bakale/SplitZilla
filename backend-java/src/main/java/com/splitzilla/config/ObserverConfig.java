package com.splitzilla.config;

import com.splitzilla.pattern.observer.ActivityObserver;
import com.splitzilla.pattern.observer.NotificationObserver;
import com.splitzilla.pattern.observer.NotificationService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

/**
 * Wires concrete observers into the NotificationService subject on startup.
 * Adding a new observer only requires registering it here — no changes to
 * existing services are needed (Open/Closed Principle).
 */
@Configuration
public class ObserverConfig {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationObserver notificationObserver;

    @Autowired
    private ActivityObserver activityObserver;

    @PostConstruct
    public void registerObservers() {
        notificationService.attach(notificationObserver);
        notificationService.attach(activityObserver);
    }
}
