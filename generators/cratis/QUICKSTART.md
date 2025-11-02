# Cratis Generator Quick Start

## Installation

```bash
npm install -g yo
npm install -g @dilgerma/generator-nebulit
```

## Create a New Project

### 1. Create config.json

```json
{
  "slices": [
    {
      "id": "slice-001",
      "title": "slice: Your Feature",
      "context": "YourChapter",
      "commands": [
        {
          "id": "cmd-001",
          "title": "Your Command",
          "fields": [
            { "name": "fieldName", "type": "String", "cardinality": "Single" }
          ],
          "dependencies": [
            { "id": "evt-001", "type": "OUTBOUND", "title": "Your Event", "elementType": "EVENT" }
          ]
        }
      ],
      "events": [
        {
          "id": "evt-001",
          "title": "Your Event",
          "context": "INTERNAL",
          "fields": [
            { "name": "fieldName", "type": "String" }
          ]
        }
      ],
      "readmodels": [
        {
          "id": "rm-001",
          "title": "YourReadModel",
          "fields": [
            { "name": "fieldName", "type": "String" }
          ],
          "dependencies": [
            { "id": "evt-001", "type": "INBOUND", "title": "Your Event", "elementType": "EVENT" }
          ]
        }
      ]
    }
  ],
  "codeGen": {
    "application": "YourApp",
    "rootNamespace": "YourApp"
  }
}
```

### 2. Generate Skeleton

```bash
yo nebulit:cratis
# Choose: Skeleton
```

### 3. Generate Slices

```bash
yo nebulit:cratis
# Choose: slices
# Select your slices
```

### 4. Run Application

```bash
# Start Chronicle server
docker-compose up -d

# Run app
dotnet run

# Run tests
dotnet test
```

## Type Mappings

| Config Type | C# Type | Notes |
|------------|---------|-------|
| String | string | |
| Int/Integer | int | |
| Boolean/Bool | bool | |
| Date/DateTime | DateTimeOffset | |
| UUID/Guid | Guid | |
| Any with cardinality="List" | IEnumerable<T> | |

## Project Structure

```
YourApp/
├── Features/
│   └── {Chapter}/
│       └── {Slice}/
│           ├── Command.cs
│           ├── Event.cs
│           ├── Rules.cs
│           └── ReadModel.cs
├── Specs/
│   └── {Chapter}/
│       └── {Slice}/
│           └── Specs.cs
├── Program.cs
├── GlobalUsings.cs
├── Assembly.cs
└── YourApp.csproj
```

## Common Tasks

### Add a New Command
Update config.json with new command, then run:
```bash
yo nebulit:cratis
# Choose: slices
```

### Add Validation Rules
Edit `{Slice}/{Command}Rules.cs`:
```csharp
RuleFor(cmd => cmd.FieldName)
    .NotEmpty()
    .MaximumLength(100);
```

### Add Custom Projection Logic
Edit `{Slice}/{ReadModel}.cs`:
```csharp
public void Define(IProjectionBuilderFor<Model> builder)
{
    var projection = builder.AutoMap();
    projection.From<Event1>();
    projection.From<Event2>()
        .Set(model => model.CustomField).To(evt => evt.SourceField);
}
```

### Add Test Assertions
Edit `Specs/{Slice}/{Command}Specs.cs`:
```csharp
It should_have_correct_field = () => 
    result.Event.FieldName.ShouldEqual(expectedValue);
```

## API Endpoints

Generated read models create endpoints:
- `GET /api/{slice}` - Get all items
- `GET /api/{slice}/observe` - Observable stream

## Resources

- Full documentation: [README.md](README.md)
- Example: [EXAMPLE.md](EXAMPLE.md)
- [Cratis.io](https://www.cratis.io)
