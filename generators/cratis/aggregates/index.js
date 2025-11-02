/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
const path = require('path');

let config = {};

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers;
        config = require(this.env.cwd + "/config.json");
    }

    async prompting() {
        if (!config.aggregates || config.aggregates.length === 0) {
            this.log('No aggregates found in config.json');
            return;
        }

        this.answers = await this.prompt([
            {
                type: 'list',
                name: 'aggregate',
                message: 'Which Aggregate should be generated?',
                choices: config?.aggregates?.map((item) => item.title).sort()
            },
            {
                type: 'checkbox',
                name: 'aggregate_slices',
                loop: false,
                message: 'Choose for which Slices to generate Command Handlers:',
                choices: (items) => {
                    const aggregate = config.aggregates.find(a => a.title === items.aggregate);
                    return config.slices
                        .filter(slice => {
                            return slice.commands?.some(command => 
                                command.aggregateDependencies?.includes(aggregate.title)
                            );
                        })
                        .map((item) => item.title)
                        .sort();
                }
            }
        ]);
    }

    writeAggregates() {
        if (!this.answers) return;
        
        const aggregate = config.aggregates.find(item => item.title === this.answers.aggregate);
        if (!aggregate) return;

        this._writeAggregate(aggregate);
    }

    _writeAggregate(aggregate) {
        const aggregateName = this._pascalCase(aggregate.title);
        const namespace = this.givenAnswers.appName || 'Application';
        const chapter = aggregate.context || 'Domain';
        
        // Get command handlers
        const commandHandlers = this._generateCommandHandlers(aggregate);

        // Determine the folder - use the chapter folder directly
        // (aggregate file goes in the chapter folder, not a subfolder)
        const folderPath = `Features/${this._pascalCase(chapter)}`;

        this.fs.copyTpl(
            this.templatePath('src/Aggregate.cs.tpl'),
            this.destinationPath(`${folderPath}/${aggregateName}.cs`),
            {
                namespace,
                chapter: this._pascalCase(chapter),
                aggregateName,
                commandHandlers
            }
        );
    }

    _generateCommandHandlers(aggregate) {
        const handlers = [];

        const relevantSlices = config.slices.filter(slice => 
            this.answers.aggregate_slices?.includes(slice.title)
        );

        for (const slice of relevantSlices) {
            const commands = slice.commands?.filter(cmd => 
                cmd.aggregateDependencies?.includes(aggregate.title)
            ) || [];

            for (const command of commands) {
                const commandName = this._pascalCase(command.title);
                const sliceName = this._pascalCase(slice.title);
                
                // Find events this command produces
                const eventDeps = command.dependencies?.filter(d => 
                    d.type === "OUTBOUND" && d.elementType === "EVENT"
                ) || [];
                
                const events = config.slices
                    .flatMap(s => s.events || [])
                    .filter(e => eventDeps.some(dep => dep.id === e.id));

                const eventApplications = events.map(event => {
                    const eventName = this._pascalCase(event.title);
                    const eventFields = this._mapEventFields(command, event);
                    return `        Apply(new ${eventName}(${eventFields}));`;
                }).join('\n');

                // Get specs for TODO comments
                const specs = slice.specifications?.map(spec => {
                    return `        // ${spec.given || ''} ${spec.when || ''} ${spec.then || ''}`;
                }).join('\n') || '';

                const specsComment = specs ? `\n${specs}\n` : '';

                handlers.push(`    public Task ${commandName}(${sliceName}.${commandName} command)
    {${specsComment}        // TODO: Implement business logic
${eventApplications}
        return Task.CompletedTask;
    }`);
            }
        }

        return handlers.join('\n\n');
    }

    _mapEventFields(command, event) {
        // Map command fields to event fields
        const mappings = [];
        
        for (const eventField of (event.fields || [])) {
            const commandField = command.fields?.find(f => 
                f.name.toLowerCase() === eventField.name.toLowerCase()
            );
            
            if (commandField) {
                mappings.push(`command.${this._pascalCase(commandField.name)}`);
            } else {
                // Check if it's a state field
                mappings.push(`/* TODO: Map ${eventField.name} */`);
            }
        }
        
        return mappings.join(', ');
    }



    _mapType(type) {
        if (!type) return 'object';
        
        switch (type.toLowerCase()) {
            case 'string': return 'string';
            case 'int':
            case 'integer': return 'int';
            case 'long': return 'long';
            case 'double': return 'double';
            case 'decimal': return 'decimal';
            case 'boolean':
            case 'bool': return 'bool';
            case 'date': return 'DateOnly';
            case 'datetime': return 'DateTime';
            case 'guid':
            case 'uuid': return 'Guid';
            default: return type;
        }
    }

    _pascalCase(str) {
        if (!str) return '';
        return str
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/^(.)/, (_, chr) => chr.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
    }
};
