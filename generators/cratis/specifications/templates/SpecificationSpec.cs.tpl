using Cratis.Specifications;

namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

/// <summary>
/// Specifications for <%= specTitle %>.
/// </summary>
/// <remarks>
/// Given: <%= given %>
/// When: <%= when %>
/// Then: <%= then %>
/// </remarks>
public class <%= specClassName %>Specs : Specification<object>
{
    Establish context = () =>
    {
        // TODO: Arrange - Set up the test context
        // Given: <%= given %>
    };

    Because of = () =>
    {
        // TODO: Act - Execute the action
        // When: <%= when %>
    };

    It should_satisfy_the_specification = () =>
    {
        // TODO: Assert - Verify the expected outcome
        // Then: <%= then %>
    };
}
