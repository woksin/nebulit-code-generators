// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Specifications;

namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

/// <summary>
/// Specifications for <%= commandName %>.
/// </summary>
public class <%= commandName %>Specs : Specification<(<%= commandName %> Command, <%= eventName %> Event)>
{
    Establish context = () =>
    {
        // TODO: Arrange - Set up the test context
    };

    Because of = () =>
    {
        // TODO: Act - Execute the command
        var command = new <%= commandName %>(/* TODO: Add parameters */);
        result = (command, command.Handle());
    };

    It should_produce_the_expected_event = () => result.Event.ShouldNotBeNull();

    // TODO: Add more specific assertions about the event properties
    // Example:
    // It should_have_correct_property = () => result.Event.PropertyName.ShouldEqual(expectedValue);
}
