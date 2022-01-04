// ==UserScript==
// @name         Auto Buffer - pokeclicker.com
// @namespace    Violentmonkey Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.0
// @author       EHoftiezer
// @description  Automatically applies battle items, and buys new ones when needed
// ==/UserScript==
var autoBuff = true;

function addautoBuffButton(){
  var node = document.createElement('td');
  node.innerHTML = '<td><button id="toggleBuff" class="btn btn-success" type="button">Enabled</button></div>'
  document.getElementById('shortcutsBody').firstElementChild.firstElementChild.children[2].firstElementChild.after(node)

  document.getElementById('toggleBuff').addEventListener('click', ToggleautoBuff, false);
}

function ToggleautoBuff(){
  autoBuff = !autoBuff;
  var button = document.getElementById('toggleBuff');
  if (!autoBuff) {
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      button.innerText = 'autoBuff Disabled';
  } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-success');
      button.innerText = 'autoBuff Enabled';
  }
}

function loopBuffs() {
  const farmLoop = setInterval(() => {
    if (autoBuff) {
      if (player.effectList.Item_magnet() == 6){
        ItemList.Item_magnet.use(1)
      }
      if (player.effectList.Lucky_egg() == 6){
        ItemList.Lucky_egg.use(1)
      }
      if (player.effectList.Lucky_incense() == 6){
        ItemList.Lucky_incense.use(1)
      }
      if (player.effectList.Token_collector() == 6){
        ItemList.Token_collector.use(1)
      }
      if (player.effectList.xAttack() == 6){
        ItemList.xAttack.use(1)
      }
      if (player.effectList.xClick() == 6){
        ItemList.xClick.use(1)
      }
    }
  },50);
}


function waitForLoad(){
  var timer = setInterval(function() {
      if (!document.getElementById("game").classList.contains("loading")) {
          // Check if the game window has loaded
          clearInterval(timer);
          addautoBuffButton();
          loopBuffs();
      }
  }, 200);
}

waitForLoad();
