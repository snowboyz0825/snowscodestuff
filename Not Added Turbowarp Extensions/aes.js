(function(Scratch) {
  'use strict';

  var CryptoJS=CryptoJS||function(t,e){var r={},i=r.lib={},n=function(){},o=i.Base={extend:function(t){n.prototype=this;var e=new n;return t&&e.mixIn(t),e.hasOwnProperty("init")||(e.init=function(){e.$super.init.apply(this,arguments)}),e.init.prototype=e,e.$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},s=i.WordArray=o.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:4*t.length},toString:function(t){return(t||a).stringify(this)},concat:function(t){var e=this.words,r=t.words,i=this.sigBytes;if(t=t.sigBytes,this.clamp(),i%4)for(var n=0;n<t;n++)e[i+n>>>2]|=(r[n>>>2]>>>24-n%4*8&255)<<24-(i+n)%4*8;else if(65535<r.length)for(n=0;n<t;n+=4)e[i+n>>>2]=r[n>>>2];else e.push.apply(e,r);return this.sigBytes+=t,this},clamp:function(){var e=this.words,r=this.sigBytes;e[r>>>2]&=4294967295<<32-r%4*8,e.length=t.ceil(r/4)},clone:function(){var t=o.clone.call(this);return t.words=this.words.slice(0),t},random:function(e){for(var r=[],i=0;i<e;i+=4)r.push(4294967296*t.random()|0);return new s.init(r,e)}}),c=r.enc={},a=c.Hex={stringify:function(t){var e=t.words;t=t.sigBytes;for(var r=[],i=0;i<t;i++){var n=e[i>>>2]>>>24-i%4*8&255;r.push((n>>>4).toString(16)),r.push((15&n).toString(16))}return r.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i+=2)r[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new s.init(r,e/2)}},f=c.Latin1={stringify:function(t){var e=t.words;t=t.sigBytes;for(var r=[],i=0;i<t;i++)r.push(String.fromCharCode(e[i>>>2]>>>24-i%4*8&255));return r.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new s.init(r,e)}},h=c.Utf8={stringify:function(t){try{return decodeURIComponent(escape(f.stringify(t)))}catch(t){throw Error("Malformed UTF-8 data")}},parse:function(t){return f.parse(unescape(encodeURIComponent(t)))}},u=i.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new s.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=h.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(e){var r=this._data,i=r.words,n=r.sigBytes,o=this.blockSize,c=n/(4*o);if(e=(c=e?t.ceil(c):t.max((0|c)-this._minBufferSize,0))*o,n=t.min(4*e,n),e){for(var a=0;a<e;a+=o)this._doProcessBlock(i,a);a=i.splice(0,e),r.sigBytes-=n}return new s.init(a,n)},clone:function(){var t=o.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0});i.Hasher=u.extend({cfg:o.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){u.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(e,r){return new t.init(r).finalize(e)}},_createHmacHelper:function(t){return function(e,r){return new p.HMAC.init(t,r).finalize(e)}}});var p=r.algo={};return r}(Math);!function(){var t=CryptoJS,e=t.lib.WordArray;t.enc.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,i=this._map;t.clamp(),t=[];for(var n=0;n<r;n+=3)for(var o=(e[n>>>2]>>>24-n%4*8&255)<<16|(e[n+1>>>2]>>>24-(n+1)%4*8&255)<<8|e[n+2>>>2]>>>24-(n+2)%4*8&255,s=0;4>s&&n+.75*s<r;s++)t.push(i.charAt(o>>>6*(3-s)&63));if(e=i.charAt(64))for(;t.length%4;)t.push(e);return t.join("")},parse:function(t){var r=t.length,i=this._map;(n=i.charAt(64))&&(-1!=(n=t.indexOf(n))&&(r=n));for(var n=[],o=0,s=0;s<r;s++)if(s%4){var c=i.indexOf(t.charAt(s-1))<<s%4*2,a=i.indexOf(t.charAt(s))>>>6-s%4*2;n[o>>>2]|=(c|a)<<24-o%4*8,o++}return e.create(n,o)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),function(t){function e(t,e,r,i,n,o,s){return((t=t+(e&r|~e&i)+n+s)<<o|t>>>32-o)+e}function r(t,e,r,i,n,o,s){return((t=t+(e&i|r&~i)+n+s)<<o|t>>>32-o)+e}function i(t,e,r,i,n,o,s){return((t=t+(e^r^i)+n+s)<<o|t>>>32-o)+e}function n(t,e,r,i,n,o,s){return((t=t+(r^(e|~i))+n+s)<<o|t>>>32-o)+e}for(var o=CryptoJS,s=(a=o.lib).WordArray,c=a.Hasher,a=o.algo,f=[],h=0;64>h;h++)f[h]=4294967296*t.abs(t.sin(h+1))|0;a=a.MD5=c.extend({_doReset:function(){this._hash=new s.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,o){for(var s=0;16>s;s++){var c=t[a=o+s];t[a]=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8)}s=this._hash.words;var a=t[o+0],h=(c=t[o+1],t[o+2]),u=t[o+3],p=t[o+4],d=t[o+5],l=t[o+6],y=t[o+7],_=t[o+8],v=t[o+9],g=t[o+10],S=t[o+11],B=t[o+12],x=t[o+13],k=t[o+14],m=t[o+15],C=e(C=s[0],E=s[1],w=s[2],z=s[3],a,7,f[0]),z=e(z,C,E,w,c,12,f[1]),w=e(w,z,C,E,h,17,f[2]),E=e(E,w,z,C,u,22,f[3]);C=e(C,E,w,z,p,7,f[4]),z=e(z,C,E,w,d,12,f[5]),w=e(w,z,C,E,l,17,f[6]),E=e(E,w,z,C,y,22,f[7]),C=e(C,E,w,z,_,7,f[8]),z=e(z,C,E,w,v,12,f[9]),w=e(w,z,C,E,g,17,f[10]),E=e(E,w,z,C,S,22,f[11]),C=e(C,E,w,z,B,7,f[12]),z=e(z,C,E,w,x,12,f[13]),w=e(w,z,C,E,k,17,f[14]),C=r(C,E=e(E,w,z,C,m,22,f[15]),w,z,c,5,f[16]),z=r(z,C,E,w,l,9,f[17]),w=r(w,z,C,E,S,14,f[18]),E=r(E,w,z,C,a,20,f[19]),C=r(C,E,w,z,d,5,f[20]),z=r(z,C,E,w,g,9,f[21]),w=r(w,z,C,E,m,14,f[22]),E=r(E,w,z,C,p,20,f[23]),C=r(C,E,w,z,v,5,f[24]),z=r(z,C,E,w,k,9,f[25]),w=r(w,z,C,E,u,14,f[26]),E=r(E,w,z,C,_,20,f[27]),C=r(C,E,w,z,x,5,f[28]),z=r(z,C,E,w,h,9,f[29]),w=r(w,z,C,E,y,14,f[30]),C=i(C,E=r(E,w,z,C,B,20,f[31]),w,z,d,4,f[32]),z=i(z,C,E,w,_,11,f[33]),w=i(w,z,C,E,S,16,f[34]),E=i(E,w,z,C,k,23,f[35]),C=i(C,E,w,z,c,4,f[36]),z=i(z,C,E,w,p,11,f[37]),w=i(w,z,C,E,y,16,f[38]),E=i(E,w,z,C,g,23,f[39]),C=i(C,E,w,z,x,4,f[40]),z=i(z,C,E,w,a,11,f[41]),w=i(w,z,C,E,u,16,f[42]),E=i(E,w,z,C,l,23,f[43]),C=i(C,E,w,z,v,4,f[44]),z=i(z,C,E,w,B,11,f[45]),w=i(w,z,C,E,m,16,f[46]),C=n(C,E=i(E,w,z,C,h,23,f[47]),w,z,a,6,f[48]),z=n(z,C,E,w,y,10,f[49]),w=n(w,z,C,E,k,15,f[50]),E=n(E,w,z,C,d,21,f[51]),C=n(C,E,w,z,B,6,f[52]),z=n(z,C,E,w,u,10,f[53]),w=n(w,z,C,E,g,15,f[54]),E=n(E,w,z,C,c,21,f[55]),C=n(C,E,w,z,_,6,f[56]),z=n(z,C,E,w,m,10,f[57]),w=n(w,z,C,E,l,15,f[58]),E=n(E,w,z,C,x,21,f[59]),C=n(C,E,w,z,p,6,f[60]),z=n(z,C,E,w,S,10,f[61]),w=n(w,z,C,E,h,15,f[62]),E=n(E,w,z,C,v,21,f[63]);s[0]=s[0]+C|0,s[1]=s[1]+E|0,s[2]=s[2]+w|0,s[3]=s[3]+z|0},_doFinalize:function(){var e=this._data,r=e.words,i=8*this._nDataBytes,n=8*e.sigBytes;r[n>>>5]|=128<<24-n%32;var o=t.floor(i/4294967296);for(r[15+(n+64>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),r[14+(n+64>>>9<<4)]=16711935&(i<<8|i>>>24)|4278255360&(i<<24|i>>>8),e.sigBytes=4*(r.length+1),this._process(),r=(e=this._hash).words,i=0;4>i;i++)n=r[i],r[i]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8);return e},clone:function(){var t=c.clone.call(this);return t._hash=this._hash.clone(),t}}),o.MD5=c._createHelper(a),o.HmacMD5=c._createHmacHelper(a)}(Math),function(){var t,e=CryptoJS,r=(t=e.lib).Base,i=t.WordArray,n=(t=e.algo).EvpKDF=r.extend({cfg:r.extend({keySize:4,hasher:t.MD5,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=(c=this.cfg).hasher.create(),n=i.create(),o=n.words,s=c.keySize,c=c.iterations;o.length<s;){a&&r.update(a);var a=r.update(t).finalize(e);r.reset();for(var f=1;f<c;f++)a=r.finalize(a),r.reset();n.concat(a)}return n.sigBytes=4*s,n}});e.EvpKDF=function(t,e,r){return n.create(r).compute(t,e)}}(),CryptoJS.lib.Cipher||function(t){var e=(d=CryptoJS).lib,r=e.Base,i=e.WordArray,n=e.BufferedBlockAlgorithm,o=d.enc.Base64,s=d.algo.EvpKDF,c=e.Cipher=n.extend({cfg:r.extend(),createEncryptor:function(t,e){return this.create(this._ENC_XFORM_MODE,t,e)},createDecryptor:function(t,e){return this.create(this._DEC_XFORM_MODE,t,e)},init:function(t,e,r){this.cfg=this.cfg.extend(r),this._xformMode=t,this._key=e,this.reset()},reset:function(){n.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){return t&&this._append(t),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(t){return{encrypt:function(e,r,i){return("string"==typeof r?l:p).encrypt(t,e,r,i)},decrypt:function(e,r,i){return("string"==typeof r?l:p).decrypt(t,e,r,i)}}}});e.StreamCipher=c.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var a=d.mode={},f=function(t,e,r){var i=this._iv;i?this._iv=undefined:i=this._prevBlock;for(var n=0;n<r;n++)t[e+n]^=i[n]},h=(e.BlockCipherMode=r.extend({createEncryptor:function(t,e){return this.Encryptor.create(t,e)},createDecryptor:function(t,e){return this.Decryptor.create(t,e)},init:function(t,e){this._cipher=t,this._iv=e}})).extend();h.Encryptor=h.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;f.call(this,t,e,i),r.encryptBlock(t,e),this._prevBlock=t.slice(e,e+i)}}),h.Decryptor=h.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=t.slice(e,e+i);r.decryptBlock(t,e),f.call(this,t,e,i),this._prevBlock=n}}),a=a.CBC=h,h=(d.pad={}).Pkcs7={pad:function(t,e){for(var r,n=(r=(r=4*e)-t.sigBytes%r)<<24|r<<16|r<<8|r,o=[],s=0;s<r;s+=4)o.push(n);r=i.create(o,r),t.concat(r)},unpad:function(t){t.sigBytes-=255&t.words[t.sigBytes-1>>>2]}},e.BlockCipher=c.extend({cfg:c.cfg.extend({mode:a,padding:h}),reset:function(){c.reset.call(this);var t=(e=this.cfg).iv,e=e.mode;if(this._xformMode==this._ENC_XFORM_MODE)var r=e.createEncryptor;else r=e.createDecryptor,this._minBufferSize=1;this._mode=r.call(e,this,t&&t.words)},_doProcessBlock:function(t,e){this._mode.processBlock(t,e)},_doFinalize:function(){var t=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){t.pad(this._data,this.blockSize);var e=this._process(!0)}else e=this._process(!0),t.unpad(e);return e},blockSize:4});var u=e.CipherParams=r.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}}),p=(a=(d.format={}).OpenSSL={stringify:function(t){var e=t.ciphertext;return((t=t.salt)?i.create([1398893684,1701076831]).concat(t).concat(e):e).toString(o)},parse:function(t){var e=(t=o.parse(t)).words;if(1398893684==e[0]&&1701076831==e[1]){var r=i.create(e.slice(2,4));e.splice(0,4),t.sigBytes-=16}return u.create({ciphertext:t,salt:r})}},e.SerializableCipher=r.extend({cfg:r.extend({format:a}),encrypt:function(t,e,r,i){i=this.cfg.extend(i);var n=t.createEncryptor(r,i);return e=n.finalize(e),n=n.cfg,u.create({ciphertext:e,key:r,iv:n.iv,algorithm:t,mode:n.mode,padding:n.padding,blockSize:t.blockSize,formatter:i.format})},decrypt:function(t,e,r,i){return i=this.cfg.extend(i),e=this._parse(e,i.format),t.createDecryptor(r,i).finalize(e.ciphertext)},_parse:function(t,e){return"string"==typeof t?e.parse(t,this):t}})),d=(d.kdf={}).OpenSSL={execute:function(t,e,r,n){return n||(n=i.random(8)),t=s.create({keySize:e+r}).compute(t,n),r=i.create(t.words.slice(e),4*r),t.sigBytes=4*e,u.create({key:t,iv:r,salt:n})}},l=e.PasswordBasedCipher=p.extend({cfg:p.cfg.extend({kdf:d}),encrypt:function(t,e,r,i){return r=(i=this.cfg.extend(i)).kdf.execute(r,t.keySize,t.ivSize),i.iv=r.iv,(t=p.encrypt.call(this,t,e,r.key,i)).mixIn(r),t},decrypt:function(t,e,r,i){return i=this.cfg.extend(i),e=this._parse(e,i.format),r=i.kdf.execute(r,t.keySize,t.ivSize,e.salt),i.iv=r.iv,p.decrypt.call(this,t,e,r.key,i)}})}(),function(){for(var t=CryptoJS,e=t.lib.BlockCipher,r=t.algo,i=[],n=[],o=[],s=[],c=[],a=[],f=[],h=[],u=[],p=[],d=[],l=0;256>l;l++)d[l]=128>l?l<<1:l<<1^283;var y=0,_=0;for(l=0;256>l;l++){var v=(v=_^_<<1^_<<2^_<<3^_<<4)>>>8^255&v^99;i[y]=v,n[v]=y;var g=d[y],S=d[g],B=d[S],x=257*d[v]^16843008*v;o[y]=x<<24|x>>>8,s[y]=x<<16|x>>>16,c[y]=x<<8|x>>>24,a[y]=x,x=16843009*B^65537*S^257*g^16843008*y,f[v]=x<<24|x>>>8,h[v]=x<<16|x>>>16,u[v]=x<<8|x>>>24,p[v]=x,y?(y=g^d[d[d[B^g]]],_^=d[d[_]]):y=_=1}var k=[0,1,2,4,8,16,32,64,128,27,54];r=r.AES=e.extend({_doReset:function(){for(var t=(r=this._key).words,e=r.sigBytes/4,r=4*((this._nRounds=e+6)+1),n=this._keySchedule=[],o=0;o<r;o++)if(o<e)n[o]=t[o];else{var s=n[o-1];o%e?6<e&&4==o%e&&(s=i[s>>>24]<<24|i[s>>>16&255]<<16|i[s>>>8&255]<<8|i[255&s]):(s=i[(s=s<<8|s>>>24)>>>24]<<24|i[s>>>16&255]<<16|i[s>>>8&255]<<8|i[255&s],s^=k[o/e|0]<<24),n[o]=n[o-e]^s}for(t=this._invKeySchedule=[],e=0;e<r;e++)o=r-e,s=e%4?n[o]:n[o-4],t[e]=4>e||4>=o?s:f[i[s>>>24]]^h[i[s>>>16&255]]^u[i[s>>>8&255]]^p[i[255&s]]},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._keySchedule,o,s,c,a,i)},decryptBlock:function(t,e){var r=t[e+1];t[e+1]=t[e+3],t[e+3]=r,this._doCryptBlock(t,e,this._invKeySchedule,f,h,u,p,n),r=t[e+1],t[e+1]=t[e+3],t[e+3]=r},_doCryptBlock:function(t,e,r,i,n,o,s,c){for(var a=this._nRounds,f=t[e]^r[0],h=t[e+1]^r[1],u=t[e+2]^r[2],p=t[e+3]^r[3],d=4,l=1;l<a;l++){var y=i[f>>>24]^n[h>>>16&255]^o[u>>>8&255]^s[255&p]^r[d++],_=i[h>>>24]^n[u>>>16&255]^o[p>>>8&255]^s[255&f]^r[d++],v=i[u>>>24]^n[p>>>16&255]^o[f>>>8&255]^s[255&h]^r[d++];p=i[p>>>24]^n[f>>>16&255]^o[h>>>8&255]^s[255&u]^r[d++],f=y,h=_,u=v}y=(c[f>>>24]<<24|c[h>>>16&255]<<16|c[u>>>8&255]<<8|c[255&p])^r[d++],_=(c[h>>>24]<<24|c[u>>>16&255]<<16|c[p>>>8&255]<<8|c[255&f])^r[d++],v=(c[u>>>24]<<24|c[p>>>16&255]<<16|c[f>>>8&255]<<8|c[255&h])^r[d++],p=(c[p>>>24]<<24|c[f>>>16&255]<<16|c[h>>>8&255]<<8|c[255&u])^r[d++],t[e]=y,t[e+1]=_,t[e+2]=v,t[e+3]=p},keySize:8});t.AES=e._createHelper(r)}();var encrypt=(t,e)=>CryptoJS.AES.encrypt(t,e).toString(),decrypt=(t,e)=>CryptoJS.AES.decrypt(t,e).toString(CryptoJS.enc.Utf8);

  class AESE {
    getInfo () {
      return {
        id: 'AES',
        name: 'AES Encryption',
        blocks: [
          {
            opcode: 'encrypt',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Encrypt [TEXT][KEY]',
            arguments: {
                TEXT: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'TEXT'
                },
                KEY: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'KEY'
                }
              }
          },
          {
            opcode: 'decrypt',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Decrypt [TEXT][KEY]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'TEXT'
              },
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'KEY'
              }
            }
          }
        ]
      };
    }

    encrypt (args) {
      return CryptoJS.AES.encrypt(args.TEXT,args.KEY).toString()
    }
    decrypt (args) {
      return CryptoJS.AES.decrypt(args.TEXT,args.KEY).toString().match(/.{1,2}/g).map(function(v){
        return String.fromCharCode(parseInt(v, 16));
      }).join('');
    }
  }

  Scratch.extensions.register(new AESE());
})(Scratch);