
const {
    emptyDir,
    mkdirs,
    copy,
} = require("fs-extra");
const {
    existsSync,
    writeFileSync,
} = require('fs');
const { spawnSync } = require('child_process');
const ora = require("ora");
const path = require("path");
const boxen = require('boxen');
const chalk = require('chalk');                     // 彩色命令行提示
const prompts = require('prompts');                 // 命令行提示框交互
const shell = require('shelljs');
const package = require('../package.json');
const spinner = ora(chalk.yellow('正在处理... hold on...'));
const { platform, argv } = process;

const warning = chalk.cyanBright;
const resolve = p => path.resolve(__dirname, "../", p);
const dependency = package.tempDependencies;

// console.log(argv);

const actionMap = {
    init: {
        options: [
            ['-l, --local', 'do not check update when create app'],
            ['-i, --install', 'install dependencies after create app'],
        ],
        description: '初始化模版        (init app-template)',
        examples: [''],
        action: async (args) => {
            // 初始化自定义模版
            if (typeof args === 'string') {
                const arg = /\/|\\|:|\*|\?|"|'|<|>|\|/g.test(args);
                if (arg) {
                    console.log(chalk.bgRed('项目名称不能包含 \\/:*?"<>| 等特殊字符!'));
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
            // 全局环境 vs 当前目录下的依赖
            const gbEnv = path.resolve(__dirname, "../../", `${dependency}`);
            const dependencyPath = existsSync(gbEnv) ? gbEnv : resolve(`node_modules/${dependency}`);

            if (existsSync(dependencyPath)) {
                console.log("\n打包依赖已安装, 正在准备复制...\nDependencies have been installed, hold on ...\n");

                const projectPath = resolve(`${process.cwd()}/${defaultName}`);

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
                        return console.log('>_< 请重新运行命令\n');
                    }

                    spinner.start();

                    // 检查模版是否有更新
                    const template = require(resolve(`${dependencyPath}/package.json`));
                    const localVersion = +template.version.replace(/\./g, '');

                    const repos = spawnSync(platform === 'win32' ? 'npm.cmd' : 'npm', ['view', `${dependency}`, 'version'])
                    const cloudVersion = +repos.stdout.toString().replace('\n', '').replace('\r\n', '').replace(/\./g, '');

                    // 有更新
                    if (!args.local && cloudVersion > localVersion) {
                        console.log('\n');
                        console.log(boxen(`打包模版 ${dependency} 有新版可用\n${chalk.white('建议升级模版后重新创建项目')}\nnpm i ${dependency} -g`,
                            {
                                padding: 1,
                                borderColor: 'red',
                                borderStyle: 'double',
                                backgroundColor: '#808080',
                            }
                        ));
                        console.log('\n');
                    }

                    // 先清空之前的文件夹
                    try {
                        await emptyDir(projectPath);
                    } catch (err) {
                        console.error(err)
                    }

                }

                spinner.start();
                console.log("\n\n- 准备创建项目模板...\n");

                try {

                    await mkdirs(resolve(defaultName));
                    // console.log('文件夹创建完成\n');
                    // 复制项目模版
                    await copy(resolve(dependencyPath), projectPath);

                    // 更改包名等信息
                    const packagePath = resolve(`${projectPath}/package.json`);
                    const packageJson = require(packagePath);
                    const packageFile = {
                        description: '',
                        scripts: '',
                        devDependencies: '',
                        keywords: '',
                        author: '',
                        license: '',
                        dependencies: '',
                    };

                    for (let item in packageFile) {
                        packageFile[item] = packageJson[item];
                    }

                    Object.assign(packageFile, {
                        name: defaultName,
                        version: '1.0.0',
                        main: '',
                        module: '',
                    });

                    writeFileSync(packagePath, JSON.stringify(packageFile, false, 4));

                } catch (err) {
                    console.error(err)
                    if (err.syscall === 'unlink') {
                        console.log(chalk.red(`${err.path}被占用`));
                    }
                }

                spinner.stop();

                spinner.succeed('项目创建成功! success!\n');

                console.log(boxen(`tips:\n1. ${chalk.greenBright(`cd ${defaultName}`)}  访问你的项目\n2. ${chalk.greenBright('npm install')}  安装项目依赖`,
                    {
                        padding: 1,
                        borderColor: 'green',
                        borderStyle: 'round',
                    }
                ));

                shell.cd(`${defaultName}`);

                const { code } = shell.exec('git init');
                if (code === 0 && args.install) {
                    shell.exec('npm install');
                }

            } else {
                console.log(warning(`去全局安装 ${dependency} 吧\nPlease npm install ${dependency} -g first!\n`));
            }
        }
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
};

module.exports = actionMap;
