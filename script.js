document.addEventListener("DOMContentLoaded", function () {
  const catchButton = document.querySelector(".fish button");
  const progressBar = document.getElementById("progressBar");
  const catchMessage = document.querySelector(".fish p");
  const sellButton = document.getElementById("sellButton");
  const inventoryList = document.getElementById("inventoryList");
  const balanceDisplay = document.getElementById("balanceDisplay");
  const fishImage = document.getElementById('fishImage');
  const fishUpgradeButton1 = document.getElementById('upgrade-button-1');
  const fishUpgradeButton2 = document.getElementById('upgrade-button-2');
  const upgrade1Cost = 50;
  const upgrade2Cost = 150;

  let inventory = {};
  let balance = 0;

  const fishValues = {
    Anchovy: 5,
    Clownfish: 10,
    Crab: 8,
    Pufferfish: 100,
    Surgeonfish: 50
  };

  const fishWeights = {
    Anchovy: 70,
    Clownfish: 40,
    Crab: 50,
    Surgeonfish: 0,
    Pufferfish: 0
  };

  let duration = 5000;

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

  fishUpgradeButton1.addEventListener("click", buyUpgrade1);
  fishUpgradeButton2.addEventListener("click", buyUpgrade2);

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
  }

  function updateInventoryDisplay() {
    inventoryList.innerHTML = '';

    for (let fish in inventory) {
      const count = inventory[fish];
      const listItem = document.createElement("li");
      listItem.textContent = `${fish} x${count} ($${fishValues[fish] * count})`;
      inventoryList.appendChild(listItem);
    }
  }

  let bought=false;

  function buyUpgrade2(){
    if(bought==false && balance>=upgrade2Cost){
      bought=true;
      balance-=upgrade2Cost;
      balanceDisplay.textContent = balance;
      fishWeights.Surgeonfish = 30;
      
      fishUpgradeButton2.remove();

      catchMessage.innerHTML = `New fish unlocked: Surgeonfish`;
      catchMessage.style.opacity = 1;

      fishImage.src=`resources/Surgeonfish.png`
      fishImage.style.opacity = 1;
      bought=false;
    }
  }

  function buyUpgrade1(){
    if(bought==false && balance>=upgrade1Cost){
      bought=true;
      balance-=upgrade1Cost;
      balanceDisplay.textContent = balance;
      duration = 3000;
      
      fishUpgradeButton1.remove();

      catchMessage.innerHTML = `Upgrade purchased!`;
      catchMessage.style.opacity = 1;
      bought = false;
    }
  }

  function saveProgress() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("balance", balance.toString());
  }

  sellButton.addEventListener("click", () => {

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
  });
});
