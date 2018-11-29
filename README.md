# rollup 打包脚手架

gbpack-cli 搭配 rollup, 快速生成可通过rollup打包的项目.

### 安装

```js
npm i gb.pack-cli -g
```

### 使用

```js
// 1. 初始化新项目(init a new project):
gbpack init
gbpack init [projectname]
gbpack init [-l|--local, -i|--install] [myplugin]
// -l|--local 可选参数, 用于禁止检查版本更新
// -i|--install 可选参数, 创建项目后自动安装依赖

// 2. 切换到项目目录
cd myplugin

// 3. 安装依赖
npm install
```

### 依赖包

- gb.rollup-cli-temp

> 文档参见: [gb.rollup-cli-temp](https://www.npmjs.com/package/gb.rollup-cli-temp)
