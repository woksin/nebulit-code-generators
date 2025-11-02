namespace <%= namespace %>.<%= chapter %>;

public class <%= aggregateName %> : AggregateRoot
{
<%= commandHandlers %>
}
