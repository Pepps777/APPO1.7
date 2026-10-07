import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'calendar.json');
const APP_PIN = process.env.APP_PIN || '';
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({days:{}}, null, 2));

function load(){ try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));}catch{return {days:{}};} }
function save(data){ const tmp=DATA_FILE+'.tmp'; fs.writeFileSync(tmp,JSON.stringify(data,null,2)); fs.renameSync(tmp,DATA_FILE); }
function send(res,status,type,body){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(body);}
function json(res,status,obj){send(res,status,'application/json; charset=utf-8',JSON.stringify(obj));}
async function readBody(req){let s='';for await(const chunk of req){s+=chunk;if(s.length>200000)throw new Error('body too large');}return s?JSON.parse(s):{};}
function authorized(req){return !APP_PIN || req.headers['x-app-pin']===APP_PIN;}
function safeFile(p){return p.replace(/[^a-zA-Z0-9._-]/g,'');}

const server=http.createServer(async (req,res)=>{
  try{
    const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
    if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,x-app-pin','Access-Control-Allow-Methods':'GET,PUT,DELETE,POST,OPTIONS'});return res.end();}
    if(u.pathname==='/api/config' && req.method==='GET') return json(res,200,{pinRequired:Boolean(APP_PIN)});
    if(u.pathname==='/api/auth' && req.method==='POST'){const b=await readBody(req);return json(res,200,{ok:!APP_PIN||b.pin===APP_PIN});}
    if(u.pathname==='/api/calendar' && req.method==='GET') return json(res,200,load());
    const m=u.pathname.match(/^\/api\/day\/(\d{4}-\d{2}-\d{2})$/);
    if(m){
      if(!authorized(req)) return json(res,401,{error:'Nicht autorisiert'});
      const date=m[1], data=load();
      if(req.method==='PUT'){
        const b=await readBody(req), allowed=['assignee','info','termine','speziell','fcBasel','color']; const day={};
        for(const k of allowed) if(typeof b[k]==='string') day[k]=b[k].slice(0,1000);
        data.days[date]=day;save(data);return json(res,200,{ok:true,date,day});
      }
      if(req.method==='DELETE'){delete data.days[date];save(data);return json(res,200,{ok:true});}
    }
    if(req.method==='GET'){
      let file=u.pathname==='/'?'/index.html':u.pathname;
      file=safeFile(file.replace(/^\//,''));
      const full=path.join(__dirname,'public',file);
      if(!full.startsWith(path.join(__dirname,'public'))) return send(res,403,'text/plain','Forbidden');
      if(fs.existsSync(full)&&fs.statSync(full).isFile()){
        const ext=path.extname(full);const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.ico':'image/x-icon'};
        return send(res,200,types[ext]||'application/octet-stream',fs.readFileSync(full));
      }
      return send(res,404,'text/plain','Not found');
    }
    send(res,404,'text/plain','Not found');
  }catch(e){console.error(e);json(res,500,{error:'Serverfehler'});}
});
server.listen(PORT,'0.0.0.0',()=>console.log(`APPO Kalender läuft auf http://localhost:${PORT}`));
