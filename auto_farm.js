// ==UserScript==
// @name         Auto Farmer - pokeclicker.com
// @namespace    Violentmonkey Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.0
// @author       EHoftiezer
// @description  Automatically plants/harvests chesto berries.
// ==/UserScript==
var autoFarm = true;

function addautoFarmButton(){
  var node = document.createElement('td');
  node.innerHTML = '<td><button id="toggleFarm" class="btn btn-success" type="button">Enabled</button></div>'
  document.getElementById('shortcutsBody').firstElementChild.firstElementChild.children[1].firstElementChild.after(node)

  document.getElementById('toggleFarm').addEventListener('click', ToggleautoFarm, false);
}

function ToggleautoFarm(){
  autoFarm = !autoFarm;
  var button = document.getElementById('toggleFarm');
  if (!autoFarm) {
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      button.innerText = 'AutoFarm Disabled';
  } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-success');
      button.innerText = 'AutoFarm Enabled';
  }
}

function loopFarm() {
  const farmLoop = setInterval(() => {
    if (autoFarm) {
      // var bestBerry = App.game.farming.highestUnlockedBerry()
      App.game.farming.harvestAll()
      App.game.farming.plantAll(1)
    }
  },50);
}


function waitForLoad(){
  var timer = setInterval(function() {
      if (!document.getElementById("game").classList.contains("loading")) {
          // Check if the game window has loaded
          clearInterval(timer);
          addautoFarmButton();
          loopFarm();
      }
  }, 200);
}

waitForLoad();
