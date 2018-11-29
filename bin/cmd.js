#! /usr/bin/env node

const program = require("commander");
const actionMap = require('./actionMap');
const package = require('../package.json');

Object.keys(actionMap).forEach(action => {

    const actions = actionMap[action];

    if (action === 'init') {
        program
            .command(action)
            .option(...actions.options[0])
            .option(...actions.options[1])
            .description(actions.description)
            .alias(actions.alias)
            .action((args) => {
                actions.action(args);
            });
    } else {
        program
            .command(action)
            .description(actions.description)
            .alias(actions.alias)
            .action((args) => {
                actions.action(args);
            });
    }

});

function showHelp() {
    console.log(`\nexamples:
    - 初始化新项目(init a new project):
        gbpack init
        gbpack init [myproject]
        gbpack init [-l|--local, -i|--install] [myproject]
        (-l|--local is optional, to disable check the update when create app)
        (-i|--install is optional, to install dependencies after create app)
    `);
}

program.on('--help', showHelp);

program
    .version(package.version, "-v, --version")
    .parse(process.argv);
