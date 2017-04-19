// ==UserScript==
// @name         View on my Mastodon
// @namespace    http://hetima.com/
// @version      0.1
// @description  Mastodon tool: replace remote follow button to view on primary instance
// @author       hetima
// @match        *://*/@*
// @match        *://*/users/*/followers*
// @match        *://*/users/*/following*
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
        if(sender)sender.innerText='Connecting to ' + home + '...';
        GM_xmlhttpRequest({
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            url: protocol + '//' + home + '/api/v1/search?q=' + encodeURIComponent(query),
            onload: function(res) {
                var resJson = JSON.parse(res.responseText);
                var resId = resJson.accounts[0].id;
                if(resId!==null && isFinite(resId)){
                    var url=protocol + '//' + home + '/web/accounts/' + resId;
                    window.location.href=url;
                }else if(sender){
                    sender.innerText='error';
                }
            },
            onerror: function() {
                if(sender)sender.innerText='error';
            }
        });
    }

    function getRemoteFollowBtn(){
        var btn=document.querySelector('div.remote-follow a.button');
        if(btn===null) return null;

        return btn;
    }

    function alterRemoteFollowBtn(btn, home, query){
        btn.style.textTransform="none";
        btn.innerText="View on " + home;
        btn.addEventListener('click', function(event){
            event.preventDefault();
            goHome(home, query, event.target);
        }, false);
    }

    function getUserName(){
        var paths=window.location.pathname.split( '/' );
        if (paths[1][0] == '@') {
            return window.location.origin + '/' + paths[1];
        }else if(paths.length==4 && paths[1]=='users' && (paths[3]=='following'||paths[3]=='followers')){
           return window.location.origin + '/@' + paths[2];
        }
        return null;
    }

    function main(){
        var primaryHost=GM_getValue('vomh_primaryHost', '');
        if(primaryHost==='') return;
        var userName=getUserName();
        if(userName===null) return;

        var remoteFollowBtn=getRemoteFollowBtn();
        if(remoteFollowBtn){
            alterRemoteFollowBtn(remoteFollowBtn, primaryHost, userName);
        }
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
