/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');

let config = {}

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.givenAnswers = opts.answers
        config = require(this.env.cwd + "/config.json");
    }

    writing() {
        var sliceName = this.givenAnswers.slice
        var slice = this._findSlice(sliceName)
        
        if (!slice) return
        
        this._writeSpecs(slice)
    }

    _writeSpecs(slice) {
        var chapter = this._getChapter(slice)
        var sliceFolder = this._getSliceFolder(slice)

        // Write specs for commands
        slice.commands?.filter((command) => command.title).forEach((command) => {
            this.fs.copyTpl(
                this.templatePath(`Spec.cs.tpl`),
                this.destinationPath(`./Specs/${chapter}/${sliceFolder}/${this._commandName(command.title)}Specs.cs`),
                {
                    rootNamespace: this.givenAnswers.rootNamespace,
                    chapter: chapter,
                    sliceFolder: sliceFolder,
                    commandName: this._commandName(command.title),
                    eventName: this._eventName(command.dependencies?.find(d => d.type === "OUTBOUND" && d.elementType === "EVENT")?.title || command.title + "Event")
                }
            )
        })

        // Write specs for specifications (given-when-then scenarios)
        if (slice.specifications && slice.specifications.length > 0) {
            slice.specifications.forEach((spec) => {
                var specClassName = this._pascalCase(spec.title || 'Specification')
                this.fs.copyTpl(
                    this.templatePath(`SpecificationSpec.cs.tpl`),
                    this.destinationPath(`./Specs/${chapter}/${sliceFolder}/${specClassName}Specs.cs`),
                    {
                        rootNamespace: this.givenAnswers.rootNamespace,
                        chapter: chapter,
                        sliceFolder: sliceFolder,
                        specTitle: spec.title || 'Specification',
                        specClassName: specClassName,
                        given: spec.given || 'Define preconditions',
                        when: spec.when || 'Define action',
                        then: spec.then || 'Define expected outcome'
                    }
                )
            })
        }
    }

    _getChapter(slice) {
        return slice.context ? this._pascalCase(slice.context) : "Default"
    }

    _getSliceFolder(slice) {
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

    _findSlice(sliceName) {
        return config.slices.find((item) => item.title === sliceName)
    }
};
