#!/usr/bin/env node
const {
    existsSync,
    mkdirSync,
    readFileSync,
    unlink,
    copyFileSync
} = require("fs");
const path = require("path");
const resolve = p => path.resolve(__dirname, "../", p);
const program = require("commander");

program
    .version("0.1.0", "-v, --version")
    .option("init [name]", "init app-template")
    .parse(process.argv);

if (program.init) {
    console.log("  - init");
    if (existsSync(resolve("node_modules/gb.rollup-cli-temp"))) {
        console.log("打包依赖已安装, 正在复制...\nDependencies have been installed, copy to ...");
        if (existsSync(resolve(`${program.init}`))) {
            console.warn("文件夹已存在, 继续将会覆盖已有项目, 是否继续?\n");
        } else {
            console.warn("准备创建项目模板");
            const creates = mkdirSync(resolve(program.init));
            console.log('文件夹创建完成');
        }
    } else {
        console.log("去安装 gb.rollup-cli-temp 吧\nPlease install gb.rollup-cli-temp first!");
    }
}
