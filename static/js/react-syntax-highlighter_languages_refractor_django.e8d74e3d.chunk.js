(this["webpackJsonpeos-transit-demo-multipass"]=this["webpackJsonpeos-transit-demo-multipass"]||[]).push([[33,81],{596:function(e,n,t){"use strict";function a(e){!function(e){function n(e,n){return"___"+e.toUpperCase()+n+"___"}Object.defineProperties(e.languages["markup-templating"]={},{buildPlaceholders:{value:function(t,a,o,i){if(t.language===a){var s=t.tokenStack=[];t.code=t.code.replace(o,(function(e){if("function"===typeof i&&!i(e))return e;for(var o,r=s.length;-1!==t.code.indexOf(o=n(a,r));)++r;return s[r]=e,o})),t.grammar=e.languages.markup}}},tokenizePlaceholders:{value:function(t,a){if(t.language===a&&t.tokenStack){t.grammar=e.languages[a];var o=0,i=Object.keys(t.tokenStack);!function s(r){for(var l=0;l<r.length&&!(o>=i.length);l++){var u=r[l];if("string"===typeof u||u.content&&"string"===typeof u.content){var c=i[o],p=t.tokenStack[c],g="string"===typeof u?u:u.content,d=n(a,c),f=g.indexOf(d);if(f>-1){++o;var k=g.substring(0,f),b=new e.Token(a,e.tokenize(p,t.grammar),"language-"+a,p),h=g.substring(f+d.length),m=[];k&&m.push.apply(m,s([k])),m.push(b),h&&m.push.apply(m,s([h])),"string"===typeof u?r.splice.apply(r,[l,1].concat(m)):u.content=m}}else u.content&&s(u.content)}return r}(t.tokens)}}}})}(e)}e.exports=a,a.displayName="markupTemplating",a.aliases=[]},670:function(e,n,t){"use strict";var a=t(596);function o(e){e.register(a),function(e){e.languages.django={comment:/^{#[\s\S]*?#}$/,tag:{pattern:/(^{%[+-]?\s*)\w+/,lookbehind:!0,alias:"keyword"},delimiter:{pattern:/^{[{%][+-]?|[+-]?[}%]}$/,alias:"punctuation"},string:{pattern:/("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,greedy:!0},filter:{pattern:/(\|)\w+/,lookbehind:!0,alias:"function"},test:{pattern:/(\bis\s+(?:not\s+)?)(?!not\b)\w+/,lookbehind:!0,alias:"function"},function:/\b[a-z_]\w+(?=\s*\()/i,keyword:/\b(?:and|as|by|else|for|if|import|in|is|loop|not|or|recursive|with|without)\b/,operator:/[-+*/%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,number:/\b\d+(?:\.\d+)?\b/,boolean:/[Tt]rue|[Ff]alse|[Nn]one/,variable:/\b\w+?\b/,punctuation:/[{}[\](),.:;]/};var n=/{{[\s\S]*?}}|{%[\s\S]*?%}|{#[\s\S]*?#}/g,t=e.languages["markup-templating"];e.hooks.add("before-tokenize",(function(e){t.buildPlaceholders(e,"django",n)})),e.hooks.add("after-tokenize",(function(e){t.tokenizePlaceholders(e,"django")})),e.languages.jinja2=e.languages.django,e.hooks.add("before-tokenize",(function(e){t.buildPlaceholders(e,"jinja2",n)})),e.hooks.add("after-tokenize",(function(e){t.tokenizePlaceholders(e,"jinja2")}))}(e)}e.exports=o,o.displayName="django",o.aliases=["jinja2"]}}]);
//# sourceMappingURL=react-syntax-highlighter_languages_refractor_django.e8d74e3d.chunk.js.map