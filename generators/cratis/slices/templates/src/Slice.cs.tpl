namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

<% conceptDefinitions.forEach(function(concept) { %>
<% if (concept.isEventSourceId) { %>
/// <summary>
/// Represents <%= concept.description %> as an event source identifier.
/// </summary>
public record <%= concept.name %>(<%= concept.primitiveType %> Value) : EventSourceId(Value)
{
    public static implicit operator <%= concept.name %>(<%= concept.primitiveType %> value) => new(value);
    public static implicit operator <%= concept.primitiveType %>(<%= concept.name %> id) => id.Value;
}
<% } else { %>
/// <summary>
/// Represents <%= concept.description %>.
/// </summary>
public record <%= concept.name %>(<%= concept.primitiveType %> Value) : ConceptAs<<%= concept.primitiveType %>>(Value)
{
    public static implicit operator <%= concept.name %>(<%= concept.primitiveType %> value) => new(value);
    public static implicit operator <%= concept.primitiveType %>(<%= concept.name %> concept) => concept.Value;
}

/// <summary>
/// Validator for <%= concept.name %> concept.
/// </summary>
public class <%= concept.name %>Validator : ConceptValidator<<%= concept.name %>>
{
    public <%= concept.name %>Validator()
    {
        RuleFor(c => c.Value).NotEmpty();
    }
}
<% } %>

<% }); %>
/// <summary>
/// Represents the command to <%= commandName %>.
/// </summary>
<% if (commandAttributes) { %><%= commandAttributes %>
<% } %>[Command]
public record <%= commandName %>(<%= fields %>)
{
    /// <summary>
    /// Handles the command and returns the resulting event.
    /// </summary>
    /// <returns>The <%= eventName %> event.</returns>
    public <%= eventName %> Handle() => new(<%= eventFields %>);
}

/// <summary>
/// Represents the event that is raised when <%= eventName %>.
/// </summary>
[EventType]
public record <%= eventName %>(<%= eventFields %>);

<% if (commandRules && commandRules.length > 0) { %>
/// <summary>
/// Command-specific validation rules for <%= commandName %>.
/// </summary>
public class <%= commandName %>Rules : AbstractValidator<<%= commandName %>>
{
    public <%= commandName %>Rules()
    {
<%= commandRules %>
    }
}
<% } %>
<% if (specifications && specifications.length > 0) { %>
<% specifications.forEach(function(spec) { %>

/// <summary>
/// Rule: <%= spec.title %>
/// </summary>
public class <%= spec.className %> : Rule<<%= commandName %>>
{
    public override void Define()
    {
        // TODO: Implement rule logic based on specification
        // Given: <%= spec.given || 'Define preconditions' %>
        // When: <%= spec.when || 'Define trigger condition' %>
        // Then: <%= spec.then || 'Define expected outcome' %>
    }
}
<% }); %>
<% } %>
