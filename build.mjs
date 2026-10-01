import {mkdir,copyFile,cp,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
await mkdir(join(root,'dist'),{recursive:true});
for(const name of ['index.html','style.css','game.js'])await copyFile(join(root,name),join(root,'dist',name));
await cp(join(root,'assets'),join(root,'dist/assets'),{recursive:true});
for(const name of ['atlas.png','ethan-run.png','powerups.png','environments40.png','bosses40.png','tubes8.png'])await access(join(root,'dist/assets',name));
console.log('Game and all six artwork files built into dist.');
