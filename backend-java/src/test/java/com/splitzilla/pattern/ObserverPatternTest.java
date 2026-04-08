package com.splitzilla.pattern;

import com.splitzilla.pattern.observer.IObserver;
import com.splitzilla.pattern.observer.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ObserverPatternTest {

    private NotificationService notificationService;
    private TestObserver testObserver;

    @BeforeEach
    public void setup() {
        notificationService = new NotificationService();
        testObserver = new TestObserver();
    }

    @Test
    public void testObserverAttachment() {
        notificationService.attach(testObserver);
        
        Map<String, Object> event = new HashMap<>();
        event.put("type", "test_event");
        event.put("message", "Test message");
        
        notificationService.notifyObservers(event);
        
        assertEquals(1, testObserver.getReceivedEvents().size());
        assertEquals("test_event", testObserver.getReceivedEvents().get(0).get("type"));
    }

    @Test
    public void testMultipleObservers() {
        TestObserver observer1 = new TestObserver();
        TestObserver observer2 = new TestObserver();
        
        notificationService.attach(observer1);
        notificationService.attach(observer2);
        
        Map<String, Object> event = new HashMap<>();
        event.put("type", "broadcast_event");
        
        notificationService.notifyObservers(event);
        
        assertEquals(1, observer1.getReceivedEvents().size());
        assertEquals(1, observer2.getReceivedEvents().size());
    }

    @Test
    public void testObserverDetachment() {
        notificationService.attach(testObserver);
        notificationService.detach(testObserver);
        
        Map<String, Object> event = new HashMap<>();
        event.put("type", "test_event");
        
        notificationService.notifyObservers(event);
        
        assertEquals(0, testObserver.getReceivedEvents().size());
    }

    private static class TestObserver implements IObserver {
        private final List<Map<String, Object>> receivedEvents = new ArrayList<>();

        @Override
        public void update(Map<String, Object> event) {
            receivedEvents.add(event);
        }

        public List<Map<String, Object>> getReceivedEvents() {
            return receivedEvents;
        }
    }
}
