import {mkdir,copyFile,cp,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
for(const name of ['game.js','quest-hub.js']){
 const check=spawnSync(process.execPath,['--check',join(root,name)],{encoding:'utf8'});
 if(check.status!==0)throw new Error(name+' failed syntax validation:\n'+(check.stderr||check.stdout));
}
await mkdir(join(root,'dist'),{recursive:true});
for(const name of ['index.html','style.css','game.js','quest-hub.js'])await copyFile(join(root,name),join(root,'dist',name));
await cp(join(root,'assets'),join(root,'dist/assets'),{recursive:true});
for(const name of ['atlas.png','ethan-run.png','powerups.png','environments40.png','bosses40.png','tubes8.png'])await access(join(root,'dist/assets',name));
console.log('Ethan Quest Hub and game files passed syntax checks and all six artwork files were copied to dist.');
