// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

/// <summary>
/// Represents the event that is raised when <%= eventName %>.
/// </summary>
/// <param name="<%= fields %>">The event data.</param>
[EventType]
public record <%= eventName %>(<%= fields %>);
