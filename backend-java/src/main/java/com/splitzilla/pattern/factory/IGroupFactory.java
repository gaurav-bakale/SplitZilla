package com.splitzilla.pattern.factory;

import com.splitzilla.model.Group;

/**
 * Factory Pattern - Group Factory Interface
 */
public interface IGroupFactory {
    Group createGroup(String name, String description);
}
