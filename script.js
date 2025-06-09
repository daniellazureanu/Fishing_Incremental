//wipe progress
if (localStorage.getItem("version") !== "1.0.2") {
  localStorage.clear(); 
  localStorage.setItem("version", "1.0.2");
}

const catchButton = document.querySelector(".fishing-area button");
const progressBar = document.getElementById("progressBar");
const catchMessage = document.querySelector(".fishing-area p");
const sellButton = document.getElementById("sellButton");
const fishImage = document.getElementById('fishImage');
let balanceDisplay;
let purchasedUpgrades = {};
let selectedCategory = "rods";
let multiplier = 1;
let canUseLures = false;

let shop = {
  rods: {
    name: 'Fishing Rods',
    logo: 'resources/CommonFishRod.png',
    items: [
      {
        name: 'Common Fishing Rod',
        image: 'resources/CommonFishRod.png',
        price: 50,
        description: 'Catch time decreased by 1 second',
        onClick: () => {
          duration -= 1000;

          catchMessage.innerHTML = `Fishing rod purchased!`;
          catchMessage.style.opacity = 1;
        }
      },
      {
        name: 'Uncommon Fishing Rod',
        image: 'resources/CommonFishRod.png',
        price: 100,
        description: 'Unlocks the ability to use lures',
        onClick: () => {
          canUseLures = true;

          catchMessage.innerHTML = `Fishing rod purchased!`;
          catchMessage.style.opacity = 1;
        }
      },
      {
        name: 'Rare Fishing Rod',
        image: 'resources/CommonFishRod.png',
        price: 500,
        description: '???',
        onClick: () => {
          endScreen();
        }
      },
    ]
  },
  lures: {
    name: 'Lures',
    logo: 'resources/StarterLure.png',
    items: [
      {
        name: 'Starter Lure',
        image: 'resources/StarterLure.png',
        price: 50,
        description: 'Chance of getting trash will be decreased',
        onClick: () => {
          fishWeights.RustyCan -=10;

          catchMessage.innerHTML = `Lure purchased!`;
          catchMessage.style.opacity = 1;
        }
      },
      {
        name: 'Lucky Lure',
        image: 'resources/LuckyLure.png',
        price: 150,
        description: 'Chance to catch rare fish increased',
        onClick: () => {
          fishWeights.Pufferfish+=20;
          fishWeights.Surgeonfish+=20;

          catchMessage.innerHTML = `Lure purchased!`;
          catchMessage.style.opacity = 1;
        }        
      },
      {
        name: 'Value Lure',
        image: 'resources/ValueLure.png',
        price: 200,
        description: 'Fish will be worth twice as much.',
        onClick: () => {
          for(let fish in fishValues){
            fishValues[fish]*=2;
          }

          catchMessage.innerHTML = `Lure purchased!`;
          catchMessage.style.opacity = 1;
        }        
      }
    ]
  },
  baits: {
    name: 'Baits',
    logo: 'resources/Worm.png',
    items: [
      {
        description: 'Work in progress'
      }
    ]
  }
};

let inventory = {};
let balance = 0;

const fishValues = {
  RustyCan: 1,
  Tuna: 8,
  Anchovy: 3,
  Clownfish: 15,
  Crab: 12,
  Pufferfish: 100,
  Surgeonfish: 50
};

const fishWeights = {
  RustyCan: 30,
  Anchovy: 80,
  Tuna: 30,
  Clownfish: 50,
  Crab: 40,
  Surgeonfish: 10,
  Pufferfish: 10
};


let duration = 5000;

loadProgress();
listShop();
listInventory();

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

  updateInventoryContent();

  catchMessage.innerHTML = `You've caught a ${randomFish}!`;
  catchMessage.style.opacity = 1;

  fishImage.src=`resources/${randomFish}.png`
  fishImage.style.opacity = 1;

  saveProgress();
}

function updateShopCategoryContent(){
  categoryItems.innerHTML = '';

  shop[selectedCategory].items.forEach(item => {
    if (purchasedUpgrades[item.name]) return;

    const categoryItem = document.createElement("div");
    categoryItem.className = "item";
    categoryItem.id = item.name;

    const itemImage = document.createElement("img");
    itemImage.className = "image";
    itemImage.src = item.image;

    const itemDescriptionContainer = document.createElement("div");
    itemDescriptionContainer.className = "description-container";

    const itemName = document.createElement("div");
    itemName.className = "name";
    itemName.textContent = item.name;

    const itemDescription = document.createElement("div");
    itemDescription.className = "description";
    itemDescription.textContent = item.description;

    const itemPrice = document.createElement("div");
    itemPrice.className = "price";
    itemPrice.textContent = `$${item.price}`;

    categoryItem.appendChild(itemImage);
    categoryItem.appendChild(itemDescriptionContainer);
    itemDescriptionContainer.appendChild(itemName)
    itemDescriptionContainer.appendChild(itemDescription);
    categoryItem.appendChild(itemPrice);

    categoryItems.appendChild(categoryItem);

    itemPrice.addEventListener("click", () => {
      buyItem(item.name);
    });
  });
}

function updateInventoryContent() {
  inventoryList.innerHTML = '';

  for (let fish in inventory) {
    const count = inventory[fish];

    const itemContainer = document.createElement("div");
    itemContainer.className = "item-container";

    const fishIcon = document.createElement("img");
    fishIcon.src = `resources/${fish}.png`;
    fishIcon.title = `${fish}\nValue: $${fishValues[fish]}`;
    fishIcon.className = "fish-icon";

    const fishAmmount = document.createElement("span");
    fishAmmount.className = "fish-count";
    fishAmmount.textContent = `${count}`;

    itemContainer.appendChild(fishIcon);
    itemContainer.appendChild(fishAmmount);
    inventoryList.appendChild(itemContainer);

    itemContainer.addEventListener("click", () => {
      sellAFish(fish);
    });
  }

  balanceDisplay.textContent = balance;
}

function sellAFish(fish){
    inventory[fish]--;

    balance += (fishValues[fish] * multiplier);

    if (inventory[fish] === 0) {
      delete inventory[fish];
    }

    updateInventoryContent();

    catchMessage.innerHTML = `You sold one ${fish} for $${fishValues[fish] * multiplier}!`;
    catchMessage.style.opacity = 1;
    balanceDisplay.textContent = balance;

    saveProgress();    
}

function sellAllFish(){

  if(!(Object.keys(inventory).length === 0)){
    let total = 0;

    for (let fish in inventory) {
      total += (fishValues[fish] * multiplier || 0) * inventory[fish];
    }

    balance += total;
    balanceDisplay.textContent = balance;

    inventory = {};
    updateInventoryContent();

    catchMessage.innerHTML = `You sold all your fish for $${total}!`;
    catchMessage.style.opacity = 1;
    saveProgress();
  }
  else{
    catchMessage.innerHTML = "No fish to sell!";
    catchMessage.style.opacity = 1;
  }
}

function buyItem(itemName) {
  for (let category in shop) {
    const item = shop[category].items.find(i => i.name === itemName);

    if (item && !purchasedUpgrades[item.name]) {
      if (balance >= item.price) {
        balance -= item.price;
        purchasedUpgrades[item.name] = true;
        balanceDisplay.textContent = balance;

        if (item.onClick) {
          item.onClick();
        }

        const itemElement = document.getElementById(item.name);
        if (itemElement) itemElement.remove();

        saveProgress();
      } else {
        catchMessage.innerHTML = "Not enough money!";
        catchMessage.style.opacity = 1;
      }
    }
  }

  updateShopCategoryContent();
  updateInventoryContent();
}

function selectCategory(p_category){
  if(p_category == "lures" && !canUseLures){
    catchMessage.innerHTML = "You can not use lures yet!";
    catchMessage.style.opacity = 1;
  }
  //WIP MESSAGE FOR BAITS CATEGORY (DELETE WHEN IMPLEMENTED)
  else if(p_category == "baits"){
    categoryItems.innerHTML = '';
    const wipMessage = document.createElement("div");
    wipMessage.textContent = "work in progress";
    wipMessage.style = "text-align: center; font-size: 2rem; background-color: #f1d384; color: #000000; border-radius: 15px; padding: 1rem;";
    categoryItems.appendChild(wipMessage);
  }
  /////////////////////////////////////////////////////////
  else{
    selectedCategory = p_category;
    updateShopCategoryContent();
  }
}

function saveProgress() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
  localStorage.setItem("balance", balance.toString());
  localStorage.setItem("purchasedUpgrades", JSON.stringify(purchasedUpgrades));
}

function loadProgress() {
  const savedInventory = localStorage.getItem("inventory");
  const savedBalance = localStorage.getItem("balance");
  const savedPurchasedUpgrades = localStorage.getItem("purchasedUpgrades");

  if (savedInventory) {
    inventory = JSON.parse(savedInventory);
  }

  if (savedBalance) {
    balance = parseInt(savedBalance, 10);
  }

  if (savedPurchasedUpgrades) {
    purchasedUpgrades = JSON.parse(savedPurchasedUpgrades);

    //aplicare efecte la upgradeurile cumparate
    for (let category in shop) {
      for (let item of shop[category].items) {
        if (purchasedUpgrades[item.name] && item.onClick) {
          item.onClick();
        }
      }
    }
  }

  catchMessage.style.opacity = 0;
  fishImage.style.opacity = 0;
}

function resetProgress() {
  localStorage.clear();
  location.reload();
}

function listShop(){
  const shopContainer = document.querySelector(".shop");
  shopContainer.innerHTML = '';

  const shopTopSection = document.createElement("div");
  shopTopSection.className = "top-section";

  const shopTitle = document.createElement("div");
  shopTitle.textContent = "Shop";

  const buySection = document.createElement("div");
  buySection.className = "buy-section";

  const shopCategories = document.createElement("div");
  shopCategories.className = "categories";

  categoryItems = document.createElement("div");
  categoryItems.className = "item-list";
  categoryItems.id = selectedCategory;

  shopContainer.appendChild(shopTopSection);
  shopTopSection.appendChild(shopTitle);
  buySection.appendChild(shopCategories);
  buySection.appendChild(categoryItems);
  shopContainer.appendChild(buySection);

  for (let category in shop){
    const categoryButton = document.createElement("button");
    categoryButton.id = shop[category].name;
    const buttonImage = document.createElement("img");
    const buttonTitle = document.createElement("div");
    buttonTitle.className = "title";

    buttonImage.src = shop[category].logo;
    buttonTitle.textContent = shop[category].name;

    categoryButton.appendChild(buttonImage);
    categoryButton.appendChild(buttonTitle);

    shopCategories.appendChild(categoryButton);

    categoryButton.addEventListener("click", () => {
      selectCategory(category);
    });
  }

  updateShopCategoryContent();
}

function listInventory(){
  const inventoryContainer = document.querySelector(".inventory");
  inventoryContainer.innerHTML = '';

  const inventoryTopSection = document.createElement("div");
  inventoryTopSection.className = "top-section";

  const inventoryTitle = document.createElement("div");
  inventoryTitle.className = "title";
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

  inventorySellButton.addEventListener("click", sellAllFish);

  updateInventoryContent();
}

function endScreen(){
  const endScreen = document.body;
  endScreen.className = "end-screen";
  endScreen.textContent = '';

  const endMessage = document.createElement("div");
  endMessage.textContent = "You finished the game!";

  const resetButton = document.createElement("button");
  resetButton.textContent="Play again!";

  endScreen.appendChild(endMessage);
  endScreen.appendChild(resetButton);

  resetButton.addEventListener("click", resetProgress);
}