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
        this._writeCommands(slice);
        this._writeEvents(slice)
        this._writeRules(slice)
        this._writeReadModels(slice)
        this.composeWith(require.resolve('../specifications'), {
            answers: {...this.answers, ...this.givenAnswers, slice: sliceName},
            appName: this.answers.appName ?? this.appName
        });
    }

    _writeCommands(slice) {
        var chapter = this._getChapter(slice)
        var sliceFolder = this._getSliceFolder(slice)

        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`src/Command.cs.tpl`),
                this.destinationPath(`./Features/${chapter}/${sliceFolder}/${this._commandName(command.title)}.cs`),
                {
                    rootNamespace: this.givenAnswers.rootNamespace,
                    chapter: chapter,
                    sliceFolder: sliceFolder,
                    commandName: this._commandName(command.title),
                    fields: this._generateFields(command.fields),
                    eventName: this._eventName(command.dependencies?.find(d => d.type === "OUTBOUND" && d.elementType === "EVENT")?.title || command.title + "d"),
                    eventFields: this._generateEventFields(command.fields)
                }
            )
        })
    }

    _writeEvents(slice) {
        var chapter = this._getChapter(slice)
        var sliceFolder = this._getSliceFolder(slice)

        slice.events?.filter((event) => event.title && event.context !== "EXTERNAL").forEach((event) => {
            this.fs.copyTpl(
                this.templatePath(`src/Event.cs.tpl`),
                this.destinationPath(`./Features/${chapter}/${sliceFolder}/${this._eventName(event.title)}.cs`),
                {
                    rootNamespace: this.givenAnswers.rootNamespace,
                    chapter: chapter,
                    sliceFolder: sliceFolder,
                    eventName: this._eventName(event.title),
                    fields: this._generateFields(event.fields)
                }
            )
        })
    }

    _writeRules(slice) {
        var chapter = this._getChapter(slice)
        var sliceFolder = this._getSliceFolder(slice)

        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`src/Rule.cs.tpl`),
                this.destinationPath(`./Features/${chapter}/${sliceFolder}/${this._commandName(command.title)}Rules.cs`),
                {
                    rootNamespace: this.givenAnswers.rootNamespace,
                    chapter: chapter,
                    sliceFolder: sliceFolder,
                    commandName: this._commandName(command.title),
                    rules: this._generateRules(command.fields)
                }
            )
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
                    eventNames: eventNames,
                    eventsImport: eventNames.length > 0 ? `using ${this.givenAnswers.rootNamespace}.${chapter}.${sliceFolder};` : ''
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

    _findSlice(sliceName) {
        return config.slices.find((item) => item.title === sliceName)
    }
};
