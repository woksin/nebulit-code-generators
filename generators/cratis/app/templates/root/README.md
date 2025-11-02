# <%= appName %>

A Cratis Chronicle + ApplicationModel ASP.NET application.

## Overview

This project uses:
- **Cratis Chronicle** - Event sourcing made easy
- **Cratis ApplicationModel** - Application patterns and infrastructure
- **FluentValidation** - For command validation rules
- **Cratis Specifications** - For behavior-driven testing

## Project Structure

```
Features/
  {Chapter}/           # Chapters organize related features
    {Slice}/           # Vertical slices contain complete features
      Command.cs       # Command definitions with [Command] attribute
      Event.cs         # Event definitions with [EventType] attribute
      Rules.cs         # Validation rules using FluentValidation
Specs/
  {Chapter}/
    {Slice}/
      Specs.cs         # Specifications using Cratis.Specifications
```

## Getting Started

1. Ensure you have .NET 9.0 SDK installed
2. Run `dotnet restore` to restore dependencies
3. Run `dotnet run` to start the application
4. Open `https://localhost:{port}/swagger` to see the API documentation

## Running Tests

```bash
dotnet test
```

## Development

Each feature is organized as a vertical slice within a chapter. Commands are handled inline and produce events that are stored in Chronicle.

### Creating a New Feature

Use the Nebulit generator to scaffold new slices:

```bash
yo nebulit:cratis
```

### Validation Rules

Rules are implemented as FluentValidation validators. Each command should have corresponding rules that are automatically discovered and applied.

### Specifications

Tests are written using Cratis.Specifications following the Given-When-Then pattern with Machine.Specifications style syntax.

## Resources

- [Cratis Documentation](https://www.cratis.io)
- [Cratis Chronicle](https://github.com/Cratis/Chronicle)
- [Cratis Samples](https://github.com/Cratis/Samples)
