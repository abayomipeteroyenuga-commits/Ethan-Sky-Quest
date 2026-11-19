import {mkdir,copyFile,cp,access,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
for(const name of ['game.js','quest-hub.js','quest-online.js','online-config.js','progression.mjs','sw.js']){
 const check=spawnSync(process.execPath,['--check',join(root,name)],{encoding:'utf8'});
 if(check.status!==0)throw new Error(name+' failed syntax validation:\n'+(check.stderr||check.stdout));
}
const tests=spawnSync(process.execPath,['--test','progression.test.mjs'],{cwd:root,encoding:'utf8'});
if(tests.status!==0)throw new Error('Progression tests failed:\n'+(tests.stderr||tests.stdout));
await mkdir(join(root,'dist'),{recursive:true});
for(const name of ['index.html','style.css','game.js','quest-hub.js','quest-online.js','online-config.js','progression.mjs','manifest.webmanifest','sw.js','icon.svg'])await copyFile(join(root,name),join(root,'dist',name));
const onlineConfig={supabaseUrl:process.env.QUEST_SUPABASE_URL||'',publishableKey:process.env.QUEST_SUPABASE_PUBLISHABLE_KEY||''};
await writeFile(join(root,'dist','online-config.js'),'window.ETHAN_ONLINE_CONFIG = Object.freeze('+JSON.stringify(onlineConfig)+');\\n');
await cp(join(root,'assets'),join(root,'dist/assets'),{recursive:true});
for(const name of ['atlas.png','ethan-run.png','powerups.png','environments40.png','bosses40.png','tubes8.png'])await access(join(root,'dist/assets',name));
console.log('Ethan Quest syntax checks, progression tests, six artwork checks and online configuration generation passed. Offline PWA files copied to dist.');
