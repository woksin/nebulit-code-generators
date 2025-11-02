// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

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
