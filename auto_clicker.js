// ==UserScript==
// @name         Auto Clicker - pokeclicker.com
// @namespace    Violentmonkey Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.2
// @author       Ivan Lay
// @contributors daniellockard, george-dy, EHoftiezer
// @description  Clicks through battles appropriately depending on the game state.
// ==/UserScript==
var autoClick = true;

function addAutoClickButton(){
    var node = document.createElement('button');
    node.innerText = 'AutoClick Enabled'
    node.setAttribute('id', 'toggleClick');
    node.setAttribute('class', 'btn btn-success');
    node.setAttribute('type', 'button');
    node.setAttribute('style', 'position: absolute; left: 0px; top: 0px; width: auto; height: 41px;');
    document.getElementById('achievementTrackerBody').before(node);
    document.getElementById('toggleClick').addEventListener('click', ToggleAutoClick, false);
}

function ToggleAutoClick(){
  autoClick = !autoClick;
  var button = document.getElementById('toggleClick');
  if (!autoClick) {
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      button.innerText = 'AutoClick Disabled';
  } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-success');
      button.innerText = 'AutoClick Enabled';
  }
}

function autoClicker() {
  var autoClickerLoop = setInterval(function () {
    if (autoClick){
        // Click while in a normal battle
        if (App.game.gameState == GameConstants.GameState.fighting) {
            Battle.clickAttack();
        }

        // Click while in a gym battle
        if (App.game.gameState === GameConstants.GameState.gym) {
            GymBattle.clickAttack();
        }

        // Click while in a dungeon - will also interact with non-battle tiles (e.g. chests)
        if (App.game.gameState === GameConstants.GameState.dungeon) {
            if (DungeonRunner.fighting() && !DungeonBattle.catching()) {
                DungeonBattle.clickAttack();
            } else if (
                DungeonRunner.map.currentTile().type() ===
                GameConstants.DungeonTile.chest
            ) {
                DungeonRunner.openChest();
            } else if (
                DungeonRunner.map.currentTile().type() ===
                GameConstants.DungeonTile.boss &&
                !DungeonRunner.fightingBoss()
            ) {
                DungeonRunner.startBossFight();
            }
        }

        // Click while in Safari battles
        if (Safari.inBattle()) {
            BattleFrontierBattle.clickAttack();
        }
    }
  }, 50); // The app hard-caps click attacks at 50
}

function waitForLoad(){
  var timer = setInterval(function() {
      if (!document.getElementById("game").classList.contains("loading")) {
          // Check if the game window has loaded
          clearInterval(timer);
          addAutoClickButton();
          autoClicker();
      }
  }, 200);
}

waitForLoad();
