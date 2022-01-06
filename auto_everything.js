// ==UserScript==
// @name         Auto Everything - pokeclicker.com
// @namespace    Violentmonkey Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.0
// @author       EHoftiezer
// @contributors daniellockard, george-dy, Ivan Lay
// @description  Automate the grind out of pokeclicker
// ==/UserScript==

var option = {
  "autoClick": true,
  "autoBuffs": true,
  "autoDungs": true,
  "autoFarms": true,
  "autoHatch": true,
  "autoDigin": true,
}

function addMobilityMenu(){
  var node = document.createElement('div');
  node.innerHTML = `
  <div id="automationContainer" class="card sortable border-secondary mb-3" draggable="false">
    <div class="card-header p-0" data-toggle="collapse" href="#automationBody" aria-expanded="true">
      <span style="text-align: center">Automation</span>
    </div>
    <div id="automationBody" class="card-body p-0 collapse show" style="">
      <table class="table table-sm m-0">
        <tbody>
          <tr>
            <td colspan="2" ><button id="toggleClick" class="btn btn-success" type="button">Auto Click Enabled</button></td>
            <td colspan="2" ><button id="toggleDungs" class="btn btn-success" type="button">Auto Dungs Enabled</button></td>
            <td colspan="2" ><button id="toggleGymin" class="btn btn-success" type="button">Auto Gymin Enabled</button></td>
          </tr>
          <tr>
            <td colspan="2" ><button id="toggleBuffs" class="btn btn-success" type="button">Auto Buffs Enabled</button></td>
            <td colspan="2" ><button id="toggleBuyin" class="btn btn-success" type="button">Auto Buyin Enabled</button></td>
            <td colspan="2" ><button id="toggleHatch" class="btn btn-success" type="button">Auto Hatch Enabled</button></td>
          </tr>
          <tr>
            <td colspan="2" ><button id="toggleFarms" class="btn btn-success" type="button">Auto Farms Enabled</button></td>
            <td colspan="2" ><button id="toggleDigin" class="btn btn-success" type="button">Auto Digin Enabled</button></td>
            <td colspan="2" ><button id="toggleQuest" class="btn btn-success" type="button">Auto Quest Enabled</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`
  document.getElementById('battleContainer').before(node)

  document.getElementById('toggleClick').addEventListener('click', toggle.bind(null,"Click"), false);
  document.getElementById('toggleBuffs').addEventListener('click', toggle.bind(null,"Buffs"), false);
  document.getElementById('toggleDungs').addEventListener('click', toggle.bind(null,"Dungs"), false);
  document.getElementById('toggleFarms').addEventListener('click', toggle.bind(null,"Farms"), false);
  document.getElementById('toggleHatch').addEventListener('click', toggle.bind(null,"Hatch"), false);
  document.getElementById('toggleDigin').addEventListener('click', toggle.bind(null,"Digin"), false);
}

function toggle(feature){
  var value = option['auto'+ feature]
  option['auto'+ feature] = !value;
  var button = document.getElementById('toggle' + feature);
  if (value) {
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      button.innerText = 'Auto ' + feature + ' Disabled';
  } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-success');
      button.innerText = 'Auto ' + feature + ' Enabled';
  }
}

function autoClick() {
  var autoClickLoop = setInterval(function () {
    if (option["autoClick"]){
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

function autoBuffs() {
  const autoBuffsLoop = setInterval(() => {
    if (option["autoBuffs"]) {
      if (player.effectList.Item_magnet() <= 6){
        ItemList.Item_magnet.use(1)
      }
      if (player.effectList.Lucky_egg() <= 6){
        ItemList.Lucky_egg.use(1)
      }
      if (player.effectList.Lucky_incense() <= 6){
        ItemList.Lucky_incense.use(1)
      }
      if (player.effectList.Token_collector() <= 6){
        ItemList.Token_collector.use(1)
      }
      if (player.effectList.xAttack() <= 6){
        ItemList.xAttack.use(1)
      }
      if (player.effectList.xClick() <= 6){
        ItemList.xClick.use(1)
      }
    }
  },50);
}

function autoDungs() {
  var autoDungsLoop = setInterval(function () {
    if (option["autoDungs"]){

      if (App.game.gameState == GameConstants.GameState.town) {
        DungeonRunner.initializeDungeon(player.town().dungeon)
      }

      if (App.game.gameState === GameConstants.GameState.dungeon) {
        DungeonRunner.map.showAllTiles()
        var allTiles = DungeonRunner.map.board()
        var bossX = 0
        var currentX = 0
        var bossY = 0
        var currentY = 0
        allTiles.forEach(yTiles => {

          yTiles.forEach(xTiles => {
            if (xTiles.cssClass().includes("tile-boss")){
              bossX = currentX
              bossY = currentY
            }
            currentX = currentX + 1
          });
          currentY = currentY + 1
          currentX = 0
        });
        // console.log("Boss found in coordinates (" + bossX + "," + bossY + ")")

        var playerPosX = DungeonRunner.map.playerPosition().x
        var playerPosY = DungeonRunner.map.playerPosition().y

        if (playerPosX < bossX){
          playerPosX = playerPosX + 1
        }
        if (playerPosX > bossX){
          playerPosX = playerPosX - 1
        }
        DungeonRunner.map.moveToCoordinates(playerPosX,playerPosY)
        if (playerPosY < bossY){
          playerPosY = playerPosY + 1
        }
        if (playerPosY > bossY){
          playerPosY = playerPosY - 1
        }
        DungeonRunner.map.moveToCoordinates(playerPosX,playerPosY)
      }
    }
  }, 50); // The app hard-caps click attacks at 50
}

function autoFarms() {
  const autoFarmsLoop = setInterval(() => {
    if (option["autoFarms"]) {
      // var bestBerry = App.game.farming.highestUnlockedBerry()
      App.game.farming.harvestAll()
      App.game.farming.plantAll(1)
    }
  },50);
}

function autoDigin() {
  var autoDiginLoop = setInterval(function () {
    if (option["autoFarms"]) {
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
  }, 10000); // Every 10 seconds
}

function autoHatch() {
  const autoHatchLoop = setInterval(() => {
    if (option["autoHatch"]) {
      // Attempt to hatch each egg. If the egg is at 100% it will succeed
      [0, 1, 2, 3].forEach((index) => App.game.breeding.hatchPokemonEgg(index));

      // Now add eggs to empty slots if we can
      while (App.game.breeding.canBreedPokemon() && App.game.breeding.hasFreeEggSlot()) {
        // Filter the sorted list of Pokemon based on the parameters set in the Hatchery screen
        // const filteredEggList = App.game.party.caughtPokemon.filter((partyPokemon) => {
        // Using the below instead of the above since it seems to be the "best" list, and
        const filteredEggList = PartyController.getSortedList().filter((partyPokemon) => {
            // Only level 100 Pokemon
            if (partyPokemon.breeding || partyPokemon.level < 100) {return false;}

            // Check based on category
            if (BreedingController.filter.category() >= 0) {
              if (
                partyPokemon.category !== BreedingController.filter.category()
              ) {
                return false;
              }
            }

            // Check based on shiny status
            if (BreedingController.filter.shinyStatus() >= 0) {
              if (
                +partyPokemon.shiny !== BreedingController.filter.shinyStatus()
              ) {
                return false;
              }
            }

            // Check based on native region
            if (BreedingController.filter.region() > -2) {
              if (
                PokemonHelper.calcNativeRegion(partyPokemon.name)
              !== BreedingController.filter.region()
              ) {
                return false;
              }
            }

            // Check if either of the types match
            const type1 = BreedingController.filter.type1() > -2
              ? BreedingController.filter.type1()
              : null;
            const type2 = BreedingController.filter.type2() > -2
              ? BreedingController.filter.type2()
              : null;
            if (type1 !== null || type2 !== null) {
              const { type: types } = pokemonMap[partyPokemon.name];
              if ([type1, type2].includes(PokemonType.None)) {
                const type = type1 == PokemonType.None ? type2 : type1;
                if (!BreedingController.isPureType(partyPokemon, type)) {
                  return false;
                }
              } else if (
                (type1 !== null && !types.includes(type1))
              || (type2 !== null && !types.includes(type2))
              ) {
                return false;
              }
            }
            return true;
          },);

        if (App.game.breeding.canBreedPokemon() && App.game.breeding.hasFreeEggSlot()) {
          App.game.breeding.addPokemonToHatchery(filteredEggList[0]);
          console.log(`Added ${filteredEggList[0].name} to the Hatchery!`);
        }
      }
    }
  }, 50);
}


function waitForLoad(){
  var timer = setInterval(function() {
      if (!document.getElementById("game").classList.contains("loading")) {
          // Check if the game window has loaded
          clearInterval(timer);
          addMobilityMenu();
          autoClick();
          autoBuffs();
          autoDungs();
          autoFarms();
          autoDigin();
          autoHatch();
      }
  }, 200);
}

waitForLoad();
