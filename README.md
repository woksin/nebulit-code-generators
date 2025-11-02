## Nebulit GmbH - Code Generators

This repository contains Yeoman generators for scaffolding event-sourced applications.

## Available Generators

### Axon Framework Generator (`yo nebulit:axon`)
Generates Kotlin/Spring Boot applications using Axon Framework for event sourcing and CQRS.

### Cratis Chronicle Generator (`yo nebulit:cratis`)
Generates C#/.NET applications using Cratis Chronicle for event sourcing with ApplicationModel patterns.

See [generators/cratis/README.md](generators/cratis/README.md) for detailed documentation.

### Other Generators
- `eventcatalog` - Event Catalog documentation
- `live-prototype` - Live prototyping tools
- `nextjs-prototype` - Next.js prototypes
- `open-api` - OpenAPI specifications
- `sample-generator` - Example generator template

## Installation

```bash
npm install -g yo
npm install -g @dilgerma/generator-nebulit
```

## Usage

```bash
# Axon Framework
yo nebulit:axon

# Cratis Chronicle
yo nebulit:cratis
```

### Setup

Slices sind im _root_ Package (wie im Generator angegeben) als Packages definiert.

### Todos nach der initialen Generierung

Im Code sind TODOs definiert für die Stellen die angepasst werden müssen.
Der Generator trifft bestimmte Grundannahmen (aggregateIds sind UUIDs beispielsweise).

Wird von diesen Annahmen abgewichen kompiliert der Code ggf. nicht sofort sondern muss leicht
angepasst werden.

Ihre Code Richtlinien sind natürlich führend, daher ist es erwartungskonform dass Code
nicht sofort kompiliert (es sollten aber wirklich nur kleine Anpassungen notwendig sein).

### Start der Applikation

Zum Start des Services kann die Klasse _ApplicationStarter_ verwendet werden in _src/test/kotlin_.
Warum in _test_?

Diese Klasse startet die komplette Umgebung (inkl. Postgres und ggf. Kafka über TestContainers)

### Package Struktur

Events sind im Package "events"

Aggregates liegen im Package "domain"

Slices haben jeweils ein isoliertes Package <sliceName>

Package "common" enthält einige Interfaces für die generelle Struktur.
