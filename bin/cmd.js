#! /usr/bin/env node

const {
    pathExists,
    emptyDir,
    remove,
    mkdirs,
    copy,
} = require("fs-extra");
const path = require("path");
const chalk = require('chalk');                     // 彩色命令行提示
const prompts = require('prompts');                 // 命令行提示框交互
const program = require("commander");
const warning = chalk.keyword('orange');
const resolve = p => path.resolve(__dirname, "../", p);

// const constants = require('../src/utils/constants.js');
const actionMap = {
    init: {
        description: '初始化模版        (init app-template)',
        examples: [''],
    },
    config: {
        alias: 'c',
        description: '配置 .gbpackrc    (config .gbpackrc)',
        examples: [
            'gbpack config set <key> <value>',
            'gbpack config get <key>',
            'gbpack config remove <key>',
        ]
    },
    '*': {
        description: '命令错误          (command error)',
    }
}

Object.keys(actionMap).forEach(action => {
    const actions = actionMap[action];
    program.command(action)
    .description(actions.description)
    .alias(actions.alias)
    .action(async (args) => {
        if (action === 'config') {
            // 更改配置文件

        } else if (action === 'init') {
            // 初始化自定义模版
            if (typeof args === 'string') {
                const arg = /\/|\\|:|\*|\?|"|'|<|>|\|/g.test(args);
                if (arg) {
                    console.log(chalk.bold.red('项目名称不能包含 \\/:*?"<>| 等特殊字符!'));
                    console.log(warning('请重新运行脚手架命令'));
                    return;
                }
                if (/^@/.test(args)) {
                    // 以@开头是私有项目
                    const response = await prompts({
                        type: 'select',
                        name: 'inPrivate',
                        message: warning('以@开头的是企业项目(需要付费账户才可以发布到npm), 你确定要创建私有项目吗?'),
                        choices: [
                            {title: '是 (Yes)', value: 'y'},
                            {title: '否 (no)', value: 'n'},
                        ],
                    });
                    if (response.inPrivate === 'n') {
                        return console.log(chalk.inverse('>_< 请重新运行命令并去除@符号'));
                    }
                }
            }

            // 项目默认名称
            const defaultName = typeof args === 'string' ? args : 'myproject';

            if (pathExists(resolve("node_modules/gb.rollup-cli-temp"))) {
                console.log(warning("\n打包依赖已安装, 正在准备复制...\nDependencies have been installed, Hold on ...\n"));

                const projectPath = resolve(defaultName);
                if (pathExists(projectPath)) {
                    const response = await prompts({
                        type: 'select',
                        name: 'inPrivate',
                        message: warning("文件夹已存在, 继续将会覆盖已有项目, 是否继续?\n"),
                        choices: [
                            {title: '是 (Yes)', value: 'y'},
                            {title: '否 (no)', value: 'n'},
                        ],
                    });
                    if (response.inPrivate === 'n') {
                        return console.log('>_< 请重新运行命令');
                    }

                    // 先清空之前的文件夹
                    try {
                        await emptyDir(projectPath);
                        // await remove(projectPath);
                    } catch (err) {
                        console.error(err)
                    }

                }

                console.log(warning("准备创建项目模板\n"));
                await mkdirs(resolve(defaultName));
                console.log('文件夹创建完成\n');

                try {
                    await copy(resolve('src/utils/rc.js'), resolve(defaultName))
                    console.log('项目创建成功!');
                } catch (err) {
                    console.error(err)
                    if (err.syscall === 'unlink') {
                        console.log(chalk.red(`${err.path}被占用`));
                    }
                }

            } else {
                console.log(warning("去安装 gb.rollup-cli-temp 吧\nPlease install gb.rollup-cli-temp first!\n"));
            }
        }
    })
});

function showHelp() {

}

program.on('-h', showHelp);

program
    .version('version', "-v, --version")
    // .option("init [name]", "init app-template")
    .parse(process.argv);
