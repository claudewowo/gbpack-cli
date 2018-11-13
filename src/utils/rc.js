import { Rcfile } from './constants';
import { promisify } from 'util';
import fs from 'fs';

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export const get = async (key) => {
    const got = await exists(Rcfile);
    let opts;

    if (got) {
        opts = await readFile(Rcfile, 'utf8');
        return opts[key];
    }
    return '';
}

export const set = async (key, value) => {
    const got = await exists(Rcfile);
    let opts;

    if (got) {
        opts = await readFile(Rcfile, 'utf8');
        opts = Object.assign(opts, { [key]: value });
    }
    await writeFile(Rcfile, opts, 'utf8');
}

export const remove = async (key, value) => {
    const got = await exists(Rcfile);
    let opts;

    if (got) {
        opts = await readFile(Rcfile, 'utf8');
        delete opts[key];
    }
    await writeFile(Rcfile, opts, 'utf8');
}
