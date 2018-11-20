
const {
    pathExists,
    emptyDir,
    mkdirs,
    copy,
} = require("fs-extra");
const { existsSync } = require('fs');
const { spawnSync } = require('child_process');
const ora = require("ora");
const path = require("path");
const chalk = require('chalk');                     // 彩色命令行提示
const prompts = require('prompts');                 // 命令行提示框交互
const warning = chalk.keyword('orange');
const package = require('../package.json');
const { platform, argv } = process;
const spinner = ora('正在处理...(hold on)  ');
const tips = chalk.blue;

const resolve = p => path.resolve(__dirname, "../", p);
const dependency = package.tempDependencies;

// console.log(argv);

const actionMap = {
    init: {
        options: ['-l, --local', 'do not check update'],
        description: '初始化模版        (init app-template)',
        examples: [''],
        action: async (args) => {
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

                // 项目名称黑名单
                const blackList = ['node_modules', '.git'];

                for (let i = 0, length = blackList.length; i < length; i++) {
                    const item = blackList[i];
                    if (args === item) {
                        console.log(chalk.red(`!!! 项目名称不能是: ${item}`));
                        return;
                    }
                }
            }

            // 项目默认名称
            const defaultName = typeof args === 'string' ? args : 'myproject';

            if (pathExists(resolve(`node_modules/${dependency}`))) {
                console.log(warning("\n打包依赖已安装, 正在准备复制...\nDependencies have been installed, hold on ...\n"));

                const projectPath = resolve(defaultName);

                if (existsSync(projectPath)) {
                    const response = await prompts({
                        type: 'select',
                        name: 'overwrite',
                        message: warning("文件夹已存在, 继续将会覆盖已有项目, 是否继续?\n"),
                        choices: [
                            {title: '是 (Yes)', value: 'y'},
                            {title: '否 (no)', value: 'n'},
                        ],
                    });
                    if (response.overwrite === 'n') {
                        return console.log('>_< 请重新运行命令');
                    }

                    spinner.start();
                    // 检查模版是否有更新
                    const template = require(resolve(`node_modules/${dependency}/package.json`));
                    const localVersion = +template.version.replace(/\./g, '');

                    const repos = spawnSync(platform === 'win32' ? 'npm.cmd' : 'npm', ['view', `${dependency}`, 'version'])
                    const cloudVersion = +repos.stdout.toString().replace('\n', '').replace('\r\n', '').replace(/\./g, '');

                    // 有更新
                    if (cloudVersion > localVersion) {
                        console.log(warning(`${dependency} 有新版可用, 建议升级模版后重新创建项目`));
                    }

                    // 先清空之前的文件夹
                    try {
                        await emptyDir(projectPath);
                    } catch (err) {
                        console.error(err)
                    }

                }

                console.log(warning("准备创建项目模板\n"));
                await mkdirs(resolve(defaultName));
                // console.log('文件夹创建完成\n');

                try {
                    // 复制项目模版
                    await copy(resolve(`node_modules/${dependency}`), resolve(defaultName));
                    console.log('项目创建成功!');

                } catch (err) {
                    console.error(err)
                    if (err.syscall === 'unlink') {
                        console.log(chalk.red(`${err.path}被占用`));
                    }
                }

                spinner.stop();

                spinner.succeed('处理完成! success!\n\n');

                console.log(tips(`tips:\n1. cd ${defaultName}  访问你的项目\n2. npm install  安装项目依赖`));

            } else {
                console.log(warning("去安装 gb.rollup-cli-temp 吧\nPlease install gb.rollup-cli-temp first!\n"));
            }
        }
    },
    config: {
        alias: 'c',
        options: ['', ''],
        description: '配置 .gbpackrc    (config .gbpackrc)',
        examples: [
            'gbpack config set <key> <value>',
            'gbpack config get <key>',
            'gbpack config remove <key>',
        ]
    },
    '*': {
        options: ['', ''],
        description: '命令错误          (command error)',
    }
};

module.exports = actionMap;
