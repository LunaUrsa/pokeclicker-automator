// ==UserScript==
// @name         Auto Dig - pokeclicker.com
// @namespace    Violentmonkey Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.2
// @author       Ivan Lay
// @contributors daniellockard, george-dy, EHoftiezer
// @description  Automatically use Bomb when the next energy tick will put you at max energy or above. Use it or lose it! This is horribly horribly inefficient, but it's better than wasting energy.
// ==/UserScript==
var autoDig = true;

function addAutoDigButton(){
  var node = document.createElement('td');
  node.innerHTML = '<td><button id="toggleDig" class="btn btn-success" type="button">Enabled</button></div>'
  document.getElementById('shortcutsBody').firstElementChild.firstElementChild.children[0].firstElementChild.after(node)

  document.getElementById('toggleDig').addEventListener('click', toggleAutoDig, false);
}

function toggleAutoDig(){
  audoDig = !audoDig;
  var button = document.getElementById('toggleDig');
  if (!audoDig) {
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      button.innerText = 'AutoDig Disabled';
  } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-success');
      button.innerText = 'AutoDig Enabled';
  }
}

function useBomb() {
  while (
    App.game.underground.getMaxEnergy() -
      Math.floor(App.game.underground.energy) <=
    App.game.underground.getEnergyGain() *
      App.game.oakItems.calculateBonus(OakItems.OakItem.Cell_Battery)
  ) {
    Mine.bomb();
    //console.log("Mined!");
  }
}

function loopMine() {
  var bombLoop = setInterval(function () {
    //console.log("Checking underground...");
    useBomb();
  }, 10000); // Every 10 seconds
}

function waitForLoad(){
  var timer = setInterval(function() {
      if (!document.getElementById("game").classList.contains("loading")) {
          // Check if the game window has loaded
          clearInterval(timer);
          addAutoDigButton()
          loopMine();
      }
  }, 200);
}

waitForLoad();
