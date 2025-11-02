/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')

let config = {}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");
    }

    async prompting() {
        this.answers = await this.prompt([
            {
                type: 'checkbox',
                name: 'slice',
                loop: false,
                message: 'Choose Slices to generate?',
                choices: (items) => config.slices.filter((slice) => !items.context || items.context?.length === 0 || items.context?.includes(slice.context)).map((item, idx) => item.title).sort(),
                when: (answers) => !answers.allSlices
            }])
    }

    writeSlice() {
        if (this.answers.slice.length === 0)
            return
        if (this.answers.slice.length > 1) {
            this.answers.slice.forEach(slice => this._writeSingleSlice(slice))
        } else {
            this._writeSingleSlice(this.answers.slice[0])
        }
    }

    _writeSingleSlice(sliceName) {
        var slice = this._findSlice(sliceName)
        this._writeSlice(slice);
        this._writeReadModels(slice)
        this.composeWith(require.resolve('../specifications'), {
            answers: {...this.answers, ...this.givenAnswers, slice: sliceName},
            appName: this.answers.appName ?? this.appName
        });
    }

    _writeSlice(slice) {
        var chapter = this._getChapter(slice)
        var sliceFolder = this._getSliceFolder(slice)

        // Write one file per command that includes command, event, and rules
        slice.commands?.filter((command) => command.title).forEach((command) => {
            var eventDep = command.dependencies?.find(d => d.type === "OUTBOUND" && d.elementType === "EVENT")
            var eventName = this._eventName(eventDep?.title || command.title + "Event")
            
            // Get the event fields - if event exists, use its fields, otherwise use command fields
            var event = slice.events?.find(e => e.id === eventDep?.id)
            var eventFieldsRaw = event ? event.fields : command.fields
            
            // Check if command belongs to an aggregate
            var aggregateName = command.aggregateDependencies && command.aggregateDependencies.length > 0 
                ? command.aggregateDependencies[0] 
                : null
            
            var aggregate = aggregateName ? this._findAggregate(aggregateName) : null
            var aggregateIdField = aggregate ? this._getAggregateIdField(aggregate) : null
            
            // Generate concept definitions for all unique fields
            var allFields = this._collectUniqueFields(command.fields, eventFieldsRaw)
            var conceptDefinitions = this._generateConceptDefinitions(allFields, aggregateIdField)
            
            // Generate command-specific rules (not basic field validation)
            var commandRules = this._generateCommandRules(command.fields)
            
            // Get specifications for this slice and generate rule classes
            var specifications = this._generateSpecifications(slice.specifications, this._commandName(command.title))
            
            // Determine command attributes
            var commandAttributes = this._generateCommandAttributes(aggregateName, chapter)

            this.fs.copyTpl(
                this.templatePath(`src/Slice.cs.tpl`),
                this.destinationPath(`./Features/${chapter}/${sliceFolder}/${this._commandName(command.title)}.cs`),
                {
                    rootNamespace: this.givenAnswers.rootNamespace,
                    chapter: chapter,
                    sliceFolder: sliceFolder,
                    commandName: this._commandName(command.title),
                    fields: this._generateFieldsWithConcepts(command.fields),
                    eventName: eventName,
                    eventFields: this._generateFieldsWithConcepts(eventFieldsRaw),
                    commandRules: commandRules,
                    conceptDefinitions: conceptDefinitions,
                    specifications: specifications,
                    commandAttributes: commandAttributes
                }
            )
        })
    }

    _collectUniqueFields(commandFields, eventFields) {
        var fieldMap = new Map()
        var addFields = (fields) => {
            if (!fields) return
            fields.forEach(f => {
                if (!fieldMap.has(f.name)) {
                    fieldMap.set(f.name, f)
                }
            })
        }
        addFields(commandFields)
        addFields(eventFields)
        return Array.from(fieldMap.values())
    }

    _generateConceptDefinitions(fields, aggregateIdField) {
        if (!fields || fields.length === 0) return []
        return fields.map(f => {
            let primitiveType = this._mapType(f.type, f.cardinality)
            let conceptName = this._pascalCase(f.name)
            let description = `the ${f.name} concept`
            
            // Check if this is the aggregate ID field
            let isAggregateId = aggregateIdField && 
                (f.name.toLowerCase() === aggregateIdField.name.toLowerCase() || 
                 f.idAttribute === true)
            
            return {
                name: conceptName,
                primitiveType: primitiveType,
                description: description,
                isEventSourceId: isAggregateId
            }
        })
    }

    _writeReadModels(slice) {
        var chapter = this._getChapter(slice)
        var sliceFolder = this._getSliceFolder(slice)

        slice.readmodels?.filter((readmodel) => readmodel.title).forEach((readmodel) => {
            // Get events that feed into this read model
            var eventIds = readmodel.dependencies?.filter(d => d.type === "INBOUND" && d.elementType === "EVENT").map(d => d.id) || []
            var events = slice.events?.filter(e => eventIds.includes(e.id)) || []
            var eventNames = events.map(e => this._eventName(e.title))

            this.fs.copyTpl(
                this.templatePath(`src/ReadModel.cs.tpl`),
                this.destinationPath(`./Features/${chapter}/${sliceFolder}/${this._pascalCase(readmodel.title)}.cs`),
                {
                    rootNamespace: this.givenAnswers.rootNamespace,
                    chapter: chapter,
                    sliceFolder: sliceFolder,
                    readModelName: this._pascalCase(readmodel.title),
                    fields: this._generateFields(readmodel.fields),
                    eventNames: eventNames
                }
            )
        })
    }

    _getChapter(slice) {
        // Extract chapter from context or use slice title
        return slice.context ? this._pascalCase(slice.context) : "Default"
    }

    _getSliceFolder(slice) {
        // Remove "slice:" prefix and convert to PascalCase
        return this._pascalCase(slice.title.replace(/^slice:\s*/i, ''))
    }

    _commandName(title) {
        return this._pascalCase(title)
    }

    _eventName(title) {
        return this._pascalCase(title)
    }

    _pascalCase(str) {
        return str
            .split(/[\s-_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
    }

    _generateFields(fields) {
        if (!fields || fields.length === 0) return ""
        return fields.map(f => {
            let type = this._mapType(f.type, f.cardinality)
            let nullable = f.optional ? "?" : ""
            return `${type}${nullable} ${this._pascalCase(f.name)}`
        }).join(', ')
    }

    _generateFieldsWithConcepts(fields) {
        if (!fields || fields.length === 0) return ""
        return fields.map(f => {
            let conceptType = this._pascalCase(f.name)
            let nullable = f.optional ? "?" : ""
            return `${conceptType}${nullable} ${conceptType}`
        }).join(', ')
    }

    _generateEventFields(fields) {
        if (!fields || fields.length === 0) return ""
        return fields.map(f => this._pascalCase(f.name)).join(', ')
    }

    _mapType(type, cardinality) {
        let baseType = type
        switch (type?.toLowerCase()) {
            case 'string': baseType = 'string'; break;
            case 'int':
            case 'integer': baseType = 'int'; break;
            case 'boolean':
            case 'bool': baseType = 'bool'; break;
            case 'date':
            case 'datetime': baseType = 'DateTimeOffset'; break;
            case 'uuid':
            case 'guid': baseType = 'Guid'; break;
            default: baseType = type || 'string'; break;
        }
        
        if (cardinality?.toLowerCase() === 'list') {
            return `IEnumerable<${baseType}>`
        }
        return baseType
    }

    _generateRules(fields) {
        if (!fields || fields.length === 0) return ""
        return fields.map(f => {
            let fieldName = this._pascalCase(f.name)
            return `        RuleFor(cmd => cmd.${fieldName}).NotEmpty();`
        }).join('\n')
    }

    _generateCommandRules(fields) {
        // For now, leave empty for command-specific rules
        // User can add custom business logic rules here
        // Basic field validation is handled by ConceptValidators
        return ""
    }

    _generateSpecifications(specifications, commandName) {
        if (!specifications || specifications.length === 0) return []
        
        return specifications.map(spec => {
            let className = this._pascalCase(spec.title || 'Specification') + 'Rule'
            return {
                title: spec.title || 'Specification',
                className: className,
                given: spec.given || '',
                when: spec.when || '',
                then: spec.then || ''
            }
        })
    }
    
    _findAggregate(aggregateName) {
        if (!config.aggregates) return null
        return config.aggregates.find(agg => 
            agg.title.toLowerCase() === aggregateName.toLowerCase()
        )
    }
    
    _getAggregateIdField(aggregate) {
        if (!aggregate || !aggregate.fields) return null
        return aggregate.fields.find(f => f.idAttribute === true) || 
               aggregate.fields.find(f => f.name.toLowerCase().includes('id'))
    }
    
    _generateCommandAttributes(aggregateName, chapter) {
        const attributes = []
        
        if (aggregateName) {
            attributes.push(`[EventSourceType("${aggregateName}")]`)
        }
        
        if (chapter && chapter !== "Default") {
            attributes.push(`[EventStreamType("${chapter}")]`)
        }
        
        return attributes.join('\n')
    }

    _findSlice(sliceName) {
        return config.slices.find((item) => item.title === sliceName)
    }
};
