/* Lala Ayen Global Plaza: one shared customer login for every page.
   Talks to the Plaza account server at /auth/* (same site, secure HttpOnly cookie). No passwords or keys are stored in this file. */
(function(){
  'use strict';
  var byId=function(id){return document.getElementById(id);};
  var all=function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};
  var state={user:null,ready:false};
  window.LalaAuth=state;
  function say(msg){var el=byId('account-status');if(el)el.textContent=msg;}
  function api(path,body){
    var opt={method:body?'POST':'GET',credentials:'same-origin',headers:{'Accept':'application/json'}};
    if(body){opt.headers['Content-Type']='application/json';opt.body=JSON.stringify(body);}
    return fetch(path,opt).then(function(r){return r.json().catch(function(){return {};}).then(function(d){d.__status=r.status;return d;});});
  }
  function render(){
    var u=state.user;
    all('[data-signout]').forEach(function(e){e.hidden=!u;});
    all('[data-auth-open]').forEach(function(e){e.textContent=u?('Hi, '+(u.name||u.email.split('@')[0])):'Sign in / Create account';});
    var form=byId('account-form');
    if(form){
      var showForm=!u;
      ['account-email','account-password','account-name'].forEach(function(id){var el=byId(id);if(el&&el.closest('label'))el.closest('label').hidden=!showForm;});
      ['account-submit','account-create','account-reset'].forEach(function(id){var el=byId(id);if(el)el.hidden=!showForm;});
      var out=byId('account-signout-inline');if(out)out.hidden=showForm;
    }
    if(u)say('Signed in as '+u.email+'. You stay signed in on every Plaza page.');
    else if(state.ready)say('Sign in, or create a free customer account. One account works on every Plaza page.');
    document.dispatchEvent(new CustomEvent('lala-auth',{detail:{user:u}}));
  }
  function refresh(){
    return api('/auth/me').then(function(d){state.user=d&&d.user||null;state.ready=d.__status===200;if(!state.ready)say('Customer accounts are temporarily unavailable. Please try again soon.');render();})
      .catch(function(){state.ready=false;say('Customer accounts are temporarily unavailable. Please try again soon.');render();});
  }
  function busy(on){['account-submit','account-create'].forEach(function(id){var b=byId(id);if(b)b.disabled=on;});}
  function setup(){
    var dlg=byId('account-dialog'),form=byId('account-form');
    all('[data-auth-open]').forEach(function(b){b.addEventListener('click',function(){if(dlg&&!dlg.open)dlg.showModal();});});
    all('[data-auth-close]').forEach(function(b){b.addEventListener('click',function(){if(dlg&&dlg.open)dlg.close();});});
    function signOut(){api('/auth/logout',{}).then(function(){state.user=null;render();say('You are signed out.');}).catch(function(){say('Could not sign out. Please try again.');});}
    all('[data-signout]').forEach(function(b){b.addEventListener('click',signOut);});
    if(form){
      var pw=byId('account-password');if(pw){pw.minLength=8;pw.maxLength=200;}
      if(!byId('account-name')){var email=byId('account-email');var lab=document.createElement('label');lab.textContent='Name (for new accounts)';var inp=document.createElement('input');inp.id='account-name';inp.type='text';inp.maxLength=80;inp.autocomplete='name';inp.placeholder='Your name (optional)';lab.appendChild(inp);var el=email&&email.closest('label');if(el)el.parentNode.insertBefore(lab,el);else form.insertBefore(lab,form.firstChild);}
      if(!byId('account-signout-inline')){var so=document.createElement('button');so.type='button';so.id='account-signout-inline';so.textContent='Sign out';so.hidden=true;so.addEventListener('click',signOut);var acts=form.querySelector('.account-actions')||form;acts.appendChild(so);}
      var val=function(id){var e=byId(id);return e?String(e.value):'';};
      form.addEventListener('submit',function(e){e.preventDefault();busy(true);say('Signing in…');
        api('/auth/login',{email:val('account-email').trim(),password:val('account-password')}).then(function(d){busy(false);
          if(d.user){state.user=d.user;byId('account-password').value='';render();if(dlg&&dlg.open)dlg.close();}else say(d.error||'Sign-in failed. Please try again.');})
        .catch(function(){busy(false);say('Network problem. Please try again.');});});
      var create=byId('account-create');if(create)create.addEventListener('click',function(){
        var em=val('account-email').trim(),p=val('account-password');
        if(!em)return say('Enter your email first.');if(p.length<8)return say('Choose a password with at least 8 characters.');
        busy(true);say('Creating your account…');
        api('/auth/signup',{email:em,password:p,name:val('account-name').trim()}).then(function(d){busy(false);
          if(d.user){state.user=d.user;byId('account-password').value='';render();say('Welcome! Your account is ready.');}else say(d.error||'Could not create the account. Please try again.');})
        .catch(function(){busy(false);say('Network problem. Please try again.');});});
      var reset=byId('account-reset');if(reset)reset.addEventListener('click',function(){say('Forgot your password? Email lalaayenglobalplaza@gmail.com from your account email address and we will help you reset it.');});
    }
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
