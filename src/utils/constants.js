import { version } from '../../package.json';

const platform = process.env.platform;
const HOME = process.env[platform === 'win32' ? 'USERPROFILE' : 'HOME'];
const Rcfile = `${HOME}/.gbpackrc`; // rc 文件的目录

export {
    version,
    Rcfile,
}
