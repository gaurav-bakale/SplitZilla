package com.splitzilla.pattern.factory;

import com.splitzilla.model.Group;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

/**
 * Factory Pattern - Main Group Factory
 * Creates different types of groups based on type
 */
@Component
public class GroupFactory {
    
    private final Map<String, IGroupFactory> factories = new HashMap<>();
    
    public GroupFactory() {
        factories.put("travel", new TravelGroupFactory());
        factories.put("roommate", new RoommateGroupFactory());
        factories.put("event", new EventGroupFactory());
        factories.put("general", new GeneralGroupFactory());
    }
    
    public Group createGroup(String groupType, String name, String description) {
        IGroupFactory factory = factories.getOrDefault(groupType.toLowerCase(), factories.get("general"));
        return factory.createGroup(name, description);
    }
    
    private static class TravelGroupFactory implements IGroupFactory {
        @Override
        public Group createGroup(String name, String description) {
            Group group = new Group();
            group.setName("🌍 " + name);
            group.setDescription(description != null && !description.isEmpty() 
                ? description : "Travel expense group");
            return group;
        }
    }
    
    private static class RoommateGroupFactory implements IGroupFactory {
        @Override
        public Group createGroup(String name, String description) {
            Group group = new Group();
            group.setName("🏠 " + name);
            group.setDescription(description != null && !description.isEmpty() 
                ? description : "Roommate expense group");
            return group;
        }
    }
    
    private static class EventGroupFactory implements IGroupFactory {
        @Override
        public Group createGroup(String name, String description) {
            Group group = new Group();
            group.setName("🎉 " + name);
            group.setDescription(description != null && !description.isEmpty() 
                ? description : "Event expense group");
            return group;
        }
    }
    
    private static class GeneralGroupFactory implements IGroupFactory {
        @Override
        public Group createGroup(String name, String description) {
            Group group = new Group();
            group.setName(name);
            group.setDescription(description != null && !description.isEmpty() 
                ? description : "General expense group");
            return group;
        }
    }
}
