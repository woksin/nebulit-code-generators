// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Projections;
using MongoDB.Driver;

namespace <%= rootNamespace %>.<%= chapter %>.<%= sliceFolder %>;

/// <summary>
/// Represents a <%= readModelName %> read model.
/// </summary>
/// <param name="<%= fields %>">The read model properties.</param>
public record <%= readModelName %>(<%= fields %>);

/// <summary>
/// Projection for <%= readModelName %>.
/// </summary>
public class <%= readModelName %>Projection : IProjectionFor<<%= readModelName %>>
{
    /// <summary>
    /// Defines the projection mapping.
    /// </summary>
    /// <param name="builder">The projection builder.</param>
    public void Define(IProjectionBuilderFor<<%= readModelName %>> builder)
    {
        var projection = builder.AutoMap();<% eventNames.forEach(function(eventName) { %>
        projection.From<<%= eventName %>>();<% }); %>
    }
}

/// <summary>
/// Queries for <%= readModelName %>.
/// </summary>
[Route("/api/<%= sliceFolder.toLowerCase() %>")]
public class <%= readModelName %>Queries(IMongoCollection<<%= readModelName %>> collection) : ControllerBase
{
    /// <summary>
    /// Gets all <%= readModelName %> items.
    /// </summary>
    /// <returns>All <%= readModelName %> items.</returns>
    [HttpGet]
    public async Task<IEnumerable<<%= readModelName %>>> GetAll()
    {
        var result = await collection.FindAsync(_ => true);
        return result.ToList();
    }

    /// <summary>
    /// Observes all <%= readModelName %> items with real-time updates.
    /// </summary>
    /// <returns>An observable collection of <%= readModelName %> items.</returns>
    [HttpGet("observe")]
    public ISubject<IEnumerable<<%= readModelName %>>> ObserveAll() =>
        collection.Observe();
}
