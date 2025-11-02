/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

var Generator = require('yeoman-generator');
var slugify = require('slugify')


let config = {}

module.exports = class extends Generator {

    defaultAppName = "app"

    constructor(args, opts) {
        super(args, opts);
        this.argument('appname', {type: String, required: false});
        config = require(this.env.cwd + "/config.json");
    }

    // Async Await
    async prompting() {
        this.answers = await this.prompt([{
            type: 'input',
            name: 'appName',
            message: 'Project name?',
            when: () => !config?.codeGen?.application,
        }, {
            type: 'input',
            name: 'rootNamespace',
            message: 'Root Namespace?',
            when: () => !config?.codeGen?.rootNamespace,
        },
            {
                type: 'list',
                name: 'generatorType',
                message: 'What should be generated?',
                choices: ['Skeleton', 'slices']
            }]);
    }

    setDefaults() {
        if (!this.answers.appName) {
            this.answers.appName = config?.codeGen?.application ?? this.defaultAppName
        }
        if (!this.answers.rootNamespace) {
            this.answers.rootNamespace = config?.codeGen?.rootNamespace
        }
    }

    writing() {

        if (this.answers.generatorType === 'Skeleton') {
            this._writeSkeleton();
        } else if (this.answers.generatorType === 'slices') {
            this.log('starting slices generation')
            this.composeWith(require.resolve('../slices'), {
                answers: this.answers,
                appName: this.answers.appName ?? this.appName
            });
        }
    }

    _writeSkeleton() {
        this.fs.copyTpl(
            this.templatePath('root'),
            this.destinationPath("."),
            {
                rootNamespace: this.answers.rootNamespace,
                appName: this.answers.appName !== "." ? slugify(this.answers.appName) : "app",
            }
        )
        this.fs.copyTpl(
            this.templatePath('src'),
            this.destinationPath(`.`),
            {
                rootNamespace: this.answers.rootNamespace
            }
        )
        this.fs.copyTpl(
            this.templatePath('test'),
            this.destinationPath(`./Specs`),
            {
                rootNamespace: this.answers.rootNamespace
            }
        )
        this.fs.copyTpl(
            this.templatePath('git/gitignore'),
            this.destinationPath(`./.gitignore`),
            {
                rootNamespace: this.answers.rootNamespace
            }
        )

    }

    end() {
    }
};
