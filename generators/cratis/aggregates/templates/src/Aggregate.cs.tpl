namespace <%= namespace %>.<%= chapter %>.<%= aggregateName %>;

<% if (hasState) { %>
public record <%= aggregateName %>State
{
<%= stateProperties %>
}

<% } %>
public class <%= aggregateName %> : AggregateRoot<<% if (hasState) { %><%= aggregateName %>State<% } else { %>AggregateState<% } %>>
{
<%= commandHandlers %>
}
