// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

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
