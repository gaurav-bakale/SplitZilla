package com.splitzilla.pattern.command;

/**
 * Command Pattern - Command Interface
 */
public interface ICommand {
    String execute();
    void undo();
}
