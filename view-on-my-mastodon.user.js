// ==UserScript==
// @name         View on my Mastodon
// @namespace    http://hetima.com/
// @version      0.2
// @description  Mastodon tool: put button that navigates to primary instance
// @author       hetima
// @match        *://*/@*
// @match        *://*/users/*/followers*
// @match        *://*/users/*/following*
// @match        *://*/users/*/updates/*
// @match        *://*/settings/preferences
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function goHome(home, query, sender){
        var protocol=GM_getValue('vomh_primaryProtocol', 'https:');
        if(sender) sender.disabled=true;
        GM_xmlhttpRequest({
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            url: protocol + '//' + home + '/api/v1/search?q=' + encodeURIComponent(query),
            onload: function(res) {
                if(sender) sender.disabled=false;
                var resJson = JSON.parse(res.responseText);
                var path=null;
                if(resJson.accounts[0]){
                    var resId = resJson.accounts[0].id;
                    if(resId!==null && isFinite(resId)){
                        path='/web/accounts/' + resId;
                    }
                }else if(resJson.statuses[0]){
                    var resId = resJson.statuses[0].id;
                    if(resId!==null && isFinite(resId)){
                        path='/web/statuses/' + resId;
                    }
                }
                if(path!==null){
                    var url=protocol + '//' + home + path;
                    window.location.href=url;
                }else if(sender){
                    sender.textContent='error';
                }
            },
            onerror: function() {
                if(sender){
                    sender.textContent='error';
                    sender.disabled=false;
                }
            }
        });
    }

    function jumpButton(title, host, query){
        var btn = document.createElement('button');
        btn.type='button';
        btn.className='button';
        btn.style.cssText='text-transform:none;';
        btn.textContent=title;
        btn.addEventListener('click', function(event){
            event.preventDefault();
            goHome(host, query, event.target);
        }, false);
        return btn;
    }

    function getQuery(){
        var paths=window.location.pathname.split( '/' );
        if (paths[1][0] == '@') {
            var query=window.location.origin + '/' + paths[1];
            if(paths.length==3){
                query += '/' + paths[2];
            }
            return query;
        }else if(paths.length==4 && paths[1]=='users' && (paths[3]=='following'||paths[3]=='followers'||paths[3]=='updates')){
            return window.location.origin + '/@' + paths[2];
        }else if(paths.length==5 && paths[1]=='users' && paths[3]=='updates'){
            return window.location.href;
        }
        return null;
    }

    function insertControl(primaryHost, query){
        var container=document.querySelector('div.container');
        if(!container) return;
        var card=container.querySelector('div.h-feed');
        if(!card) card=container.querySelector('div.h-card');
        if(!card) card=container.querySelector('div.h-entry');
        if(card){
            var base = document.createElement('div');
            var btn = jumpButton('View on ' + primaryHost, primaryHost, query);
            var ctl = document.createElement('div');

            base.className='landing-strip';
            ctl.className='controls';
            base.style.cssText='text-align:right;';

            ctl.appendChild(btn);
            base.appendChild(ctl);
            
            card.parentElement.insertBefore(base, card);
        }
    }

    function main(){
        var primaryHost=GM_getValue('vomh_primaryHost', '');
        if(primaryHost==='') return;
        var query=getQuery();
        if(query===null) return;
        insertControl(primaryHost, query);
    }

    function settingPage(){
        var primaryHost=GM_getValue('vomh_primaryHost', '');
        var desc='<p>View on my Mastodon setting:</p>';
        var label=' Use ' + window.location.host + ' as default instance';

        var setting = document.createElement('div');
        setting.style.cssText='position:fixed; top:10px; right:10px; font-size:105%';
        setting.innerHTML = ''+desc+'<label class="boolean optional checkbox" for="vomh_use_primal_here"><input class="boolean optional" type="checkbox" value="" name="" id="vomh_use_primal_here">'+label+'</label>';
        document.body.appendChild(setting);

        var checkBox=document.getElementById('vomh_use_primal_here');
        if(primaryHost==window.location.host) checkBox.checked=true;

        checkBox.addEventListener('change', function(event){
            if(event.target.checked){
                GM_setValue('vomh_primaryHost', window.location.host);
                GM_setValue('vomh_primaryProtocol', window.location.protocol);

            }else{
                GM_setValue('vomh_primaryHost', '');

            }
        }, false);
    }

    if (window.location.pathname === '/settings/preferences') {
        settingPage();
    }else{
        main();
    }
})();
