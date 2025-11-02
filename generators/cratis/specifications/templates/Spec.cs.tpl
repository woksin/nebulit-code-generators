// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Specifications;

namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

/// <summary>
/// Specifications for <%= commandName %>.
/// </summary>
/// <remarks>
/// TODO: This is a basic template. For proper testing with Cratis Chronicle,
/// consider using the command dispatcher and event store infrastructure.
/// See Cratis documentation for testing patterns with Chronicle.
/// </remarks>
public class <%= commandName %>Specs : Specification<(<%= commandName %> Command, <%= eventName %> Event)>
{
    Establish context = () =>
    {
        // TODO: Set up the test context
        // Example: Initialize any required data or mock dependencies
    };

    Because of = () =>
    {
        // TODO: Execute the command
        // Note: In production code, commands should be dispatched through
        // the Chronicle command handler infrastructure, not called directly
        var command = new <%= commandName %>(/* TODO: Add parameters */);
        result = (command, command.Handle());
    };

    It should_produce_the_expected_event = () => result.Event.ShouldNotBeNull();

    // TODO: Add more specific assertions about the event properties
    // Example:
    // It should_have_correct_title = () => result.Event.Title.ShouldEqual(expectedTitle);
    // It should_have_correct_isbn = () => result.Event.ISBN.ShouldEqual(expectedISBN);
}
