import {randomBytes,scryptSync,timingSafeEqual,createHmac} from 'node:crypto';
export function hashPassword(password){
 if(typeof password!=='string'||password.length<12||password.length>1024) throw new Error('Password must be 12-1024 characters');
 const salt=randomBytes(16).toString('hex');
 return 'scrypt$'+salt+'$'+scryptSync(password,salt,64).toString('hex');
}
export function verifyPassword(password,encoded){
 if(typeof password!=='string'||typeof encoded!=='string')return false;
 const parts=encoded.split('$');
 if(parts.length!==3||parts[0]!=='scrypt'||!/^[0-9a-f]{32}$/.test(parts[1])||!/^[0-9a-f]{128}$/.test(parts[2]))return false;
 const expected=Buffer.from(parts[2],'hex');
 return timingSafeEqual(scryptSync(password,parts[1],64),expected);
}
export function issueSession(accountId,secret,now=Date.now()){
 if(!/^[0-9a-f-]{36}$/i.test(accountId)||typeof secret!=='string'||secret.length<32)throw new Error('Invalid session configuration');
 const payload=Buffer.from(JSON.stringify({sub:accountId,exp:now+86400000,nonce:randomBytes(16).toString('hex')})).toString('base64url');
 const sig=createHmac('sha256',secret).update(payload).digest('base64url');
 return payload+'.'+sig;
}
export function verifySession(token,secret,now=Date.now()){
 if(typeof token!=='string'||typeof secret!=='string'||secret.length<32)return null;
 const parts=token.split('.');if(parts.length!==2)return null;
 const sig=createHmac('sha256',secret).update(parts[0]).digest();
 let provided;try{provided=Buffer.from(parts[1],'base64url');}catch{return null;}
 if(provided.length!==sig.length||!timingSafeEqual(provided,sig))return null;
 try{const p=JSON.parse(Buffer.from(parts[0],'base64url').toString());return p.exp>now&&p.exp<=now+86400000&&/^[0-9a-f-]{36}$/i.test(p.sub)?p.sub:null;}catch{return null;}
}
// Production sessions require server-side revocation, rate limits, CSRF protection and secure cookies.
