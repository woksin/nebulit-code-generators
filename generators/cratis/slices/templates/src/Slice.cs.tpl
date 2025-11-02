namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

<% conceptDefinitions.forEach(function(concept) { %>
/// <summary>
/// Represents <%= concept.description %>.
/// </summary>
public record <%= concept.name %>(<%= concept.primitiveType %> Value) : ConceptAs<<%= concept.primitiveType %>>(Value)
{
    public static implicit operator <%= concept.name %>(<%= concept.primitiveType %> value) => new(value);
    public static implicit operator <%= concept.primitiveType %>(<%= concept.name %> concept) => concept.Value;
}

<% }); %>
/// <summary>
/// Represents the command to <%= commandName %>.
/// </summary>
[Command]
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

/// <summary>
/// Represents the validation rules for <%= commandName %>.
/// </summary>
public class <%= commandName %>Rules : AbstractValidator<<%= commandName %>>
{
    /// <summary>
    /// Initializes a new instance of the <<%= commandName %>Rules> class.
    /// </summary>
    public <%= commandName %>Rules()
    {
<%= rules %>
    }
}
