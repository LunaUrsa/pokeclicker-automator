// ==UserScript==
// @name         Auto Hatchery - pokeclicker.com
// @namespace    Violentmonkey Scripts
// @match        https://www.pokeclicker.com/
// @grant        none
// @version      1.2
// @author       Ivan Lay
// @contributors daniellockard, george-dy, EHoftiezer
// @description  Automatically hatches eggs at 100% completion. Then uses the sorting and filters from the Hatcher to fill it with the best remaining Pokémon.
// ==/UserScript==
let hatcheryAutomationEnabled = true;

function addAutoHatchButton() {
  const node = document.createElement('button');
  node.innerText = 'Auto On';
  node.setAttribute('id', 'toggleHatchery');
  node.setAttribute('class', 'btn btn-success');
  node.setAttribute('type', 'button');
  node.setAttribute('style', 'position: absolute; left: 0px; top: 0px; width: auto; height: 41px;');
  document.getElementById('eggList').before(node);
  document.getElementById('toggleHatchery').addEventListener('click', ToggleHatcheryAutomation, false);
}

function ToggleHatcheryAutomation() {
  hatcheryAutomationEnabled = !hatcheryAutomationEnabled;
  const button = document.getElementById('toggleHatchery');
  if (!hatcheryAutomationEnabled) {
    button.classList.remove('btn-success');
    button.classList.add('btn-danger');
    button.innerText = 'Auto Off';
  } else {
    button.classList.remove('btn-danger');
    button.classList.add('btn-success');
    button.innerText = 'Auto On';
  }
}

function loopEggs() {
  const eggLoop = setInterval(() => {
    if (hatcheryAutomationEnabled) {
      // Attempt to hatch each egg. If the egg is at 100% it will succeed
      [0, 1, 2, 3].forEach((index) => App.game.breeding.hatchPokemonEgg(index));

      // Now add eggs to empty slots if we can
      while (App.game.breeding.canBreedPokemon() && App.game.breeding.hasFreeEggSlot()) {
        // Filter the sorted list of Pokemon based on the parameters set in the Hatchery screen
        const filteredEggList = App.game.party.caughtPokemon.filter((partyPokemon) => {
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
          // console.log(`Added ${filteredEggList[0].name} to the Hatchery!`);
        }
      }
    }
  }, 50); // Runs every game tick
}

function waitForLoad() {
  var timer = setInterval(() => {
    if (!document.getElementById('game').classList.contains('loading')) {
      // Check if the game window has loaded
      clearInterval(timer);
      addAutoHatchButton();
      loopEggs();
    }
  }, 200);
}

waitForLoad();
