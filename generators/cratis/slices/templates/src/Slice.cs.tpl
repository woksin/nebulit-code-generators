namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

/// <summary>
/// Represents the command to <%= commandName %>.
/// </summary>
/// <param name="<%= fields %>">The command parameters.</param>
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
/// <param name="<%= eventFields %>">The event data.</param>
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
