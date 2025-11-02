# Cratis Chronicle Code Generator

A Yeoman generator for creating ASP.NET applications using Cratis Chronicle event sourcing and ApplicationModel patterns.

## Overview

This generator creates a complete ASP.NET application structure based on Cratis Chronicle, following the vertical slice architecture pattern as demonstrated in the [Cratis Samples Library project](https://github.com/Cratis/Samples/tree/main/Library).

## Features

- **Skeleton Generation**: Creates complete project structure with ASP.NET Core, Cratis Chronicle, and testing setup
- **Slice Generation**: Generates vertical slices with Commands, Events, Rules, and Specifications
- **Aggregate Generation**: Creates AggregateRoot classes with command handlers and event sourcing handlers
- **Chapter Organization**: Organizes features into chapters (contexts) and slices
- **Validation Rules**: Automatic FluentValidation rule generation
- **Specifications**: Cratis.Specifications-based test scaffolding

## Installation

This generator is part of the `@dilgerma/generator-nebulit` package:

```bash
npm install -g yo
npm install -g @dilgerma/generator-nebulit
```

## Usage

### 1. Create a config.json

Create a `config.json` file that describes your domain model:

```json
{
  "slices": [
    {
      "id": "slice-001",
      "title": "slice: Add Book",
      "context": "Inventory",
      "commands": [
        {
          "id": "cmd-001",
          "title": "Add Book",
          "fields": [
            {
              "name": "title",
              "type": "String",
              "cardinality": "Single",
              "optional": false
            },
            {
              "name": "isbn",
              "type": "String",
              "cardinality": "Single",
              "optional": false
            }
          ],
          "dependencies": [
            {
              "id": "evt-001",
              "type": "OUTBOUND",
              "title": "Book Added",
              "elementType": "EVENT"
            }
          ]
        }
      ],
      "events": [
        {
          "id": "evt-001",
          "title": "Book Added",
          "context": "INTERNAL",
          "fields": [
            {
              "name": "title",
              "type": "String"
            },
            {
              "name": "isbn",
              "type": "String"
            }
          ]
        }
      ]
    }
  ],
  "codeGen": {
    "application": "MyApp",
    "rootNamespace": "MyApp"
  },
  "context": "My Domain"
}
```

### 2. Generate Skeleton

Generate the initial project structure:

```bash
yo nebulit:cratis
```

Select "Skeleton" when prompted. This creates:
- ASP.NET Core project with Cratis Chronicle
- Program.cs with Chronicle and ApplicationModel setup
- Global usings and assembly configuration
- Specs project with test infrastructure
- Docker compose for Chronicle server
- Directory.Build.props and Directory.Packages.props for centralized package management

### 3. Generate Slices

Add feature slices to your application:

```bash
yo nebulit:cratis
```

Select "slices" when prompted, then choose which slices to generate.

### 4. Generate Aggregates (Optional)

If your domain model includes aggregates with complex business logic, generate aggregate roots:

```bash
yo nebulit:cratis
```

Select "aggregates" when prompted, then choose which aggregate to generate and which slices it should handle commands from.

## Generated Structure

```
YourApp/
├── Features/
│   └── {Chapter}/              # Chapter = context from config
│       ├── {Slice}/            # Slice = title from config
│       │   └── Command.cs      # Command + Event + Rules (all in one file)
│       └── {Aggregate}/        # Aggregate root (optional)
│           └── Aggregate.cs    # AggregateRoot with command handlers
├── Specs/
│   └── {Chapter}/
│       └── {Slice}/
│           └── CommandSpecs.cs # Cratis.Specifications tests
├── Program.cs
├── GlobalUsings.cs
├── Assembly.cs
├── appsettings.json
├── docker-compose.yml
└── YourApp.csproj
```

## Field Type Mapping

The generator maps config.json types to C# types:

| Config Type | C# Type |
|------------|---------|
| String | string |
| Int/Integer | int |
| Boolean/Bool | bool |
| Date/DateTime | DateTimeOffset |
| UUID/Guid | Guid |

Cardinality "List" wraps the type in `IEnumerable<T>`.

## Chapters and Slices

- **Chapter**: Represents a context or bounded domain area (e.g., "Inventory", "Lending")
- **Slice**: A complete vertical slice with all layers (command → event → rules → specs)

The generator extracts the chapter from the slice's `context` field in config.json.

## Commands and Events

## Commands, Events, and Validation Rules

All command-related code is generated in a single file per slice with ConceptAs types:

```csharp
namespace YourApp.Chapter.Slice;

/// <summary>
/// Represents the title concept.
/// </summary>
public record Title(string Value) : ConceptAs<string>(Value)
{
    public static implicit operator Title(string value) => new(value);
    public static implicit operator string(Title concept) => concept.Value;
}

/// <summary>
/// Validator for Title concept.
/// </summary>
public class TitleValidator : ConceptValidator<Title>
{
    public TitleValidator()
    {
        RuleFor(c => c.Value).NotEmpty();
    }
}

/// <summary>
/// Represents the isbn concept.
/// </summary>
public record Isbn(string Value) : ConceptAs<string>(Value)
{
    public static implicit operator Isbn(string value) => new(value);
    public static implicit operator string(Isbn concept) => concept.Value;
}

/// <summary>
/// Validator for Isbn concept.
/// </summary>
public class IsbnValidator : ConceptValidator<Isbn>
{
    public IsbnValidator()
    {
        RuleFor(c => c.Value).NotEmpty();
    }
}

// Similar for AuthorId...

/// <summary>
/// Represents the command to AddBook.
/// </summary>
[Command]
public record AddBook(Title Title, Isbn Isbn, AuthorId AuthorId)
{
    /// <summary>
    /// Handles the command and returns the resulting event.
    /// </summary>
    public BookAdded Handle() => new(Title, Isbn, AuthorId);
}

/// <summary>
/// Represents the event that is raised when BookAdded.
/// </summary>
[EventType]
public record BookAdded(Title Title, Isbn Isbn, AuthorId AuthorId);

// Command-specific rules (optional, only generated if needed)
// Basic field validation is handled by ConceptValidators above
```

## Validation Strategy

The generator creates a **three-tier validation approach**:

1. **ConceptValidators**: Basic field validation at the concept level
   - Each concept has its own validator (e.g., `TitleValidator`)
   - Handles required fields, format validation, etc.
   - Validates the primitive value within the concept

2. **Command Rules** (optional): Command-specific business rules
   - Only generated when business logic validation is needed
   - For cross-field validation or complex business rules
   - Separated from basic field validation

3. **Specifications as Rules**: Domain rules from config.json
   - If specifications exist, generates `Rule<T>` classes
   - Follows given-when-then pattern
   - Uses Cratis rule engine for business logic

Fields are wrapped as **ConceptAs** types following Cratis best practices:
- Strong typing prevents field mix-ups
- Implicit operators for seamless conversion to/from primitives
- Better domain language in code

## Specifications

Specifications follow the Cratis.Specifications pattern:

```csharp
public class AddBookSpecs : Specification<(AddBook Command, BookAdded Event)>
{
    Establish context = () =>
    {
        // Arrange
    };

    Because of = () =>
    {
        var command = new AddBook(/* parameters */);
        result = (command, command.Handle());
    };

    It should_produce_the_expected_event = () => result.Event.ShouldNotBeNull();
}
```

## Running the Generated Application

1. Start Chronicle server:
   ```bash
   docker-compose up -d
   ```

2. Run the application:
   ```bash
   dotnet run
   ```

3. Run tests:
   ```bash
   dotnet test
   ```

4. View Swagger UI:
   ```
   https://localhost:{port}/swagger
   ```

## Resources

- [Cratis Documentation](https://www.cratis.io)
- [Cratis Chronicle GitHub](https://github.com/Cratis/Chronicle)
- [Cratis Samples](https://github.com/Cratis/Samples)
- [Cratis ApplicationModel](https://github.com/Cratis/ApplicationModel)

## License

MIT License - Copyright (c) 2025 Nebulit GmbH

## Aggregates

Aggregates represent entities with complex business logic that maintain consistency boundaries. They inherit from `AggregateRoot<TState>` and handle commands by applying events.

### When to Use Aggregates

Use aggregates when:
- You need complex business logic that spans multiple commands
- You need to maintain consistency within a boundary
- Your entity has a lifecycle managed through events
- Commands need to validate against current state before applying changes

### Aggregate Structure

```csharp
namespace YourApp.Domain.BookAggregate;

public record BookState
{
    public string Title { get; set; }
    public string ISBN { get; set; }
    public int Stock { get; set; }
}

public class Book : AggregateRoot<BookState>
{
    public async Task Handle(AddBook.AddBook command)
    {
        // Business logic
        if (IsNew)
        {
            Apply(new BookAdded(command.Title, command.ISBN, command.AuthorId));
        }
        
        await Commit();
    }
    
    private void On(BookAdded @event)
    {
        State.Title = @event.Title;
        State.ISBN = @event.ISBN;
    }
    
    public async Task Handle(UpdateStock.UpdateStock command)
    {
        // Validate against current state
        if (State.Stock + command.Quantity < 0)
        {
            throw new InvalidOperationException("Insufficient stock");
        }
        
        Apply(new StockUpdated(command.Quantity));
        await Commit();
    }
    
    private void On(StockUpdated @event)
    {
        State.Stock += @event.Quantity;
    }
}
```

### Config.json Structure for Aggregates

```json
{
  "aggregates": [
    {
      "id": "agg-001",
      "title": "Book",
      "context": "Domain",
      "fields": [
        {
          "name": "bookId",
          "type": "Guid",
          "idAttribute": true
        },
        {
          "name": "title",
          "type": "String"
        },
        {
          "name": "stock",
          "type": "Int"
        }
      ]
    }
  ],
  "slices": [
    {
      "title": "slice: Add Book",
      "commands": [
        {
          "title": "Add Book",
          "aggregateDependencies": ["Book"],
          "dependencies": [
            {
              "type": "OUTBOUND",
              "elementType": "EVENT",
              "id": "evt-001"
            }
          ]
        }
      ]
    }
  ]
}
```

The `aggregateDependencies` field links commands to aggregates, indicating which aggregate handles each command.

