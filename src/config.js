// 管理当前用户目录下的 .gbpackrc 文件
// gbpack config set key value
import { get, set, remove } from './utils/rc';

export default config = (action, key, value) => {
    console.log('config');
    switch (action) {
        case 'get':
            if (key) {
                await get(key);
            }
            break;
        case 'set':
            await set(key, value);
            break;
        case 'remove':
            await remove(key, value);
            break;
    }
}
