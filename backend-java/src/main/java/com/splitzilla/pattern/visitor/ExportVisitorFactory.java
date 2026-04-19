package com.splitzilla.pattern.visitor;

import org.springframework.stereotype.Component;

@Component
public class ExportVisitorFactory {

    public IExportVisitor getVisitor(String format) {
        if (format == null) {
            return new CsvExportVisitor();
        }
        switch (format.toLowerCase()) {
            case "csv":
                return new CsvExportVisitor();
            case "json":
                return new JsonExportVisitor();
            case "md":
            case "markdown":
                return new MarkdownExportVisitor();
            default:
                throw new IllegalArgumentException("Unknown export format: " + format +
                        ". Valid values: csv, json, markdown");
        }
    }
}
