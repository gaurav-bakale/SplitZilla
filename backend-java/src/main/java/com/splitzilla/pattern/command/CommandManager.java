package com.splitzilla.pattern.command;

import org.springframework.stereotype.Component;
import java.util.Stack;

/**
 * Command Pattern - Command Manager (Singleton via Spring)
 * Manages command execution, undo, and redo operations
 */
@Component
public class CommandManager {
    
    private final Stack<ICommand> history = new Stack<>();
    private final Stack<ICommand> redoStack = new Stack<>();
    
    public String execute(ICommand command) {
        String result = command.execute();
        history.push(command);
        redoStack.clear();
        return result;
    }
    
    public void undo() {
        if (history.isEmpty()) {
            throw new IllegalStateException("No commands to undo");
        }
        
        ICommand command = history.pop();
        command.undo();
        redoStack.push(command);
    }
    
    public String redo() {
        if (redoStack.isEmpty()) {
            throw new IllegalStateException("No commands to redo");
        }
        
        ICommand command = redoStack.pop();
        String result = command.execute();
        history.push(command);
        return result;
    }
    
    public void clearHistory() {
        history.clear();
        redoStack.clear();
    }
}
