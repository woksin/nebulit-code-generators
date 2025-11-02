# Cratis Chronicle Code Generator

A Yeoman generator for creating ASP.NET applications using Cratis Chronicle event sourcing and ApplicationModel patterns.

## Overview

This generator creates a complete ASP.NET application structure based on Cratis Chronicle, following the vertical slice architecture pattern as demonstrated in the [Cratis Samples Library project](https://github.com/Cratis/Samples/tree/main/Library).

## Features

- **Skeleton Generation**: Creates complete project structure with ASP.NET Core, Cratis Chronicle, and testing setup
- **Slice Generation**: Generates vertical slices with Commands, Events, Rules, and Specifications
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

## Generated Structure

```
YourApp/
├── Features/
│   └── {Chapter}/              # Chapter = context from config
│       └── {Slice}/            # Slice = title from config
│           ├── Command.cs      # Command with [Command] attribute
│           ├── Event.cs        # Event with [EventType] attribute
│           └── CommandRules.cs # FluentValidation rules
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

Commands are defined with the `[Command]` attribute and include a `Handle()` method that returns an event:

```csharp
[Command]
public record AddBook(string Title, string ISBN, Guid AuthorId)
{
    public BookAdded Handle() => new(Title, ISBN, AuthorId);
}
```

Events are defined with the `[EventType]` attribute:

```csharp
[EventType]
public record BookAdded(string Title, string ISBN, Guid AuthorId);
```

## Validation Rules

Each command automatically gets a FluentValidation rules class:

```csharp
public class AddBookRules : AbstractValidator<AddBook>
{
    public AddBookRules()
    {
        RuleFor(cmd => cmd.Title).NotEmpty();
        RuleFor(cmd => cmd.ISBN).NotEmpty();
        RuleFor(cmd => cmd.AuthorId).NotEmpty();
    }
}
```

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
