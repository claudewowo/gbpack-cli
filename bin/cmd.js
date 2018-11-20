#! /usr/bin/env node

const program = require("commander");
const actionMap = require('./actionMap');
const package = require('../package.json');

Object.keys(actionMap).forEach(action => {
    const actions = actionMap[action];

    program
        .command(action)
        .option(actions.options[0], actions.options[1])
        .description(actions.description)
        .alias(actions.alias)
        .action((args) => {
            actions.action(args);
        })
});

function showHelp() {
    console.log(`\nexamples:
    - 初始化新项目(init a new project):
        gbpack init
        gbpack init [myplugin]
        gbpack init [-l|--local] [myplugin]
        (-l|--local is optional, to disable check the update)
    `);
}

program.on('--help', showHelp);

program
    .version(package.version, "-v, --version")
    .parse(process.argv);
