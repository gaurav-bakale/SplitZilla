package com.splitzilla.pattern;

import com.splitzilla.model.Group;
import com.splitzilla.pattern.factory.GroupFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class FactoryPatternTest {

    private GroupFactory groupFactory;

    @BeforeEach
    public void setup() {
        groupFactory = new GroupFactory();
    }

    @Test
    public void testCreateTravelGroup() {
        Group group = groupFactory.createGroup("travel", "Europe Trip", "Summer vacation");
        
        assertNotNull(group);
        assertTrue(group.getName().contains("Europe Trip"));
        assertTrue(group.getName().contains("🌍"));
        assertEquals("Summer vacation", group.getDescription());
    }

    @Test
    public void testCreateRoommateGroup() {
        Group group = groupFactory.createGroup("roommate", "Apartment 5B", "Monthly expenses");
        
        assertNotNull(group);
        assertTrue(group.getName().contains("Apartment 5B"));
        assertTrue(group.getName().contains("🏠"));
        assertEquals("Monthly expenses", group.getDescription());
    }

    @Test
    public void testCreateEventGroup() {
        Group group = groupFactory.createGroup("event", "Birthday Party", "John's 30th");
        
        assertNotNull(group);
        assertTrue(group.getName().contains("Birthday Party"));
        assertTrue(group.getName().contains("🎉"));
        assertEquals("John's 30th", group.getDescription());
    }

    @Test
    public void testCreateGeneralGroup() {
        Group group = groupFactory.createGroup("general", "Friends", "General expenses");
        
        assertNotNull(group);
        assertEquals("Friends", group.getName());
        assertEquals("General expenses", group.getDescription());
    }

    @Test
    public void testDefaultToGeneralGroup() {
        Group group = groupFactory.createGroup("unknown", "Test Group", "Test description");
        
        assertNotNull(group);
        assertEquals("Test Group", group.getName());
    }

    @Test
    public void testDefaultDescription() {
        Group group = groupFactory.createGroup("travel", "Trip", null);
        
        assertNotNull(group);
        assertNotNull(group.getDescription());
        assertTrue(group.getDescription().contains("Travel"));
    }
}
