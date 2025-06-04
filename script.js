const catchButton = document.querySelector(".fish button");
const progressBar = document.getElementById("progressBar");
const catchMessage = document.querySelector(".fish p");
const sellButton = document.getElementById("sellButton");
const upgradeContainer = document.querySelector(".upgrades");
const inventoryContainer = document.querySelector(".inventory");
const fishImage = document.getElementById('fishImage');
let inventoryList;
let balanceDisplay;
let boughtUpgrades = [];

const upgrades = [
  {
    name: "common-lure",
    image: "resources/RustyCan.png",
    cost: 50,
    description: "Chance of getting trash will be decreased considerably",
    onClick: () => {
        balanceDisplay.textContent = balance;
        fishWeights.RustyCan -=20;
        fishWeights.Worm -=20;

        catchMessage.innerHTML = `Lure purchased!`;
        catchMessage.style.opacity = 1;
    }
  },
  {
    name: "common-fishing-rod",
    image: "resources/CommonFishRod.png",
    cost: 75,
    description: "The time necessary to catch a fish will be decreased by 1 second",
    onClick: () => {
      balanceDisplay.textContent = balance;
      duration -= 1000;

      catchMessage.innerHTML = `Fishing rod purchased!`;
      catchMessage.style.opacity = 1;
    }
  },
];

let inventory = {};
let balance = 0;

const fishValues = {
  RustyCan: 1,
  Worm: 2,
  Anchovy: 5,
  Clownfish: 10,
  Crab: 8,
  Pufferfish: 100,
  Surgeonfish: 50
};

const fishWeights = {
  RustyCan: 60,
  Worm: 60,
  Anchovy: 70,
  Clownfish: 40,
  Crab: 40,
  Surgeonfish: 1,
  Pufferfish: 1
};

let duration = 5000;

listUpgrades();
listInventory();
loadProgress();

catchButton.addEventListener("click", () => {
  catchMessage.style.opacity = 0;
  fishImage.style.opacity = 0;
  catchButton.disabled = true;
  progressBar.value = 0;

  let interval = 30;
  let elapsed = 0;

  const timer = setInterval(() => {
    elapsed += interval;
    progressBar.value = (elapsed / duration) * 100;

    if (elapsed >= duration) {
      clearInterval(timer);
      progressBar.value = 0;
      catchButton.disabled = false;
      getRandomFish();
    }
  }, interval);
});

function getRandomFish() {
  const fishTypes = Object.keys(fishValues);
  const weightedFish = [];

  fishTypes.forEach(fish => {
    for (let i = 0; i < fishWeights[fish]; i++) {
      weightedFish.push(fish);
    }
  });

  const randomFish = weightedFish[Math.floor(Math.random() * weightedFish.length)];

  inventory[randomFish] = (inventory[randomFish] || 0) + 1;

  updateInventoryDisplay();

  catchMessage.innerHTML = `You've caught a ${randomFish}!`;
  catchMessage.style.opacity = 1;

  fishImage.src=`resources/${randomFish}.png`
  fishImage.style.opacity = 1;

  saveProgress();
}

function updateInventoryDisplay() {
  inventoryList.innerHTML = '';

  for (let fish in inventory) {
    const count = inventory[fish];

    const itemContainer = document.createElement("div");
    itemContainer.className = "item-container";

    const fishIcon = document.createElement("img");
    fishIcon.src = `resources/${fish}.png`;
    fishIcon.className = "fish-icon";

    const fishAmmount = document.createElement("span");
    fishAmmount.textContent = `${fish} x${count} ($${fishValues[fish] * count})`;

    itemContainer.appendChild(fishIcon);
    itemContainer.appendChild(fishAmmount);
    inventoryList.appendChild(itemContainer);
  }

  balanceDisplay.textContent = balance;
}

function sellFish(){

  if(!(Object.keys(inventory).length === 0)){
    let total = 0;

    for (let fish in inventory) {
      total += (fishValues[fish] || 0) * inventory[fish];
    }

    balance += total;
    balanceDisplay.textContent = balance;

    inventory = {};
    updateInventoryDisplay();

    catchMessage.innerHTML = `You sold all your fish for $${total}!`;
    catchMessage.style.opacity = 1;
    saveProgress();
  }
  else{
    catchMessage.innerHTML = "No fish to sell!";
    catchMessage.style.opacity = 1;
  }
}

function upgradeOnClick(upgrade) {

  if (balance >= upgrade.cost) {
    balance -= upgrade.cost;
    balanceDisplay.textContent = balance;
    upgrade.onClick();

    boughtUpgrades.push(upgrade.name);

    upgradeContainer.removeChild(document.getElementById(upgrade.name));
  }

  saveProgress();
}

function saveProgress() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("balance", balance.toString());
  localStorage.setItem("boughtUpgrades", JSON.stringify(boughtUpgrades));
}

function loadProgress() {
  const savedInventory = localStorage.getItem("inventory");
  const savedBalance = localStorage.getItem("balance");
  const savedUpgrades = localStorage.getItem("boughtUpgrades");

  if (savedInventory) {
    inventory = JSON.parse(savedInventory);
  }

  if (savedBalance) {
    balance = parseInt(savedBalance, 10);
  }

  if (savedUpgrades) {
    boughtUpgrades = JSON.parse(savedUpgrades);
  }

  boughtUpgrades.forEach(upgradeName => {
    const upgrade = upgrades.find(u => u.name === upgradeName);
    if (upgrade) {
      const upgradeElement = document.getElementById(upgrade.name);
      if (upgradeElement) {
        upgradeContainer.removeChild(upgradeElement);
      }
      upgrade.onClick();
    }
  });

  catchMessage.style.opacity = 0;
  fishImage.style.opacity = 0;

  updateInventoryDisplay();
}

function resetProgress() {
  localStorage.clear();
  location.reload();
}


function listUpgrades() {
  upgrades.forEach(upgrade => {
    const upgradeButton = document.createElement("div");
    upgradeButton.id = upgrade.name;
    upgradeButton.className = "upgrade-button";
    
    const upgradeImage = document.createElement("img");
    upgradeImage.src = upgrade.image;
    upgradeImage.alt = upgrade.name;
    upgradeButton.appendChild(upgradeImage);

    const upgradeTitle = document.createElement("p");
    upgradeTitle.className = "upgrade-title";
    upgradeTitle.textContent = upgrade.description;
    upgradeButton.appendChild(upgradeTitle);

    const upgradeCost = document.createElement("div");
    upgradeCost.className = "price";
    upgradeCost.textContent = `$${upgrade.cost}`;
    upgradeButton.appendChild(upgradeCost);

    upgradeButton.title = upgrade.description;
    upgradeButton.addEventListener("click", () => {upgradeOnClick(upgrade)});
    
    upgradeContainer.appendChild(upgradeButton);
  });
}

function listInventory(){
  const inventoryTopSection = document.createElement("div");
  inventoryTopSection.className = "top-section";

  const inventoryTitle = document.createElement("h3");
  inventoryTitle.textContent = "Inventory";

  const inventoryBalance = document.createElement("p");
  inventoryBalance.innerHTML = 'Money: $<span id="balance-display">0</span>';

  const inventorySellButton = document.createElement("button");
  inventorySellButton.id ="sellButton";
  inventorySellButton.textContent = "Sell All Fish";

  inventoryList = document.createElement("div");
  inventoryList.className = "inventory-list";

  inventoryTopSection.appendChild(inventoryTitle);
  inventoryTopSection.appendChild(inventoryBalance);
  inventoryTopSection.appendChild(inventorySellButton);

  inventoryContainer.appendChild(inventoryTopSection);
  inventoryContainer.appendChild(inventoryList);

  balanceDisplay = document.getElementById("balance-display");

  inventorySellButton.addEventListener("click", sellFish);

  updateInventoryDisplay();
}