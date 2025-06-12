const feedButton = document.querySelector(".btn-feed");
const playButton = document.querySelector(".play");
const sleepButton = document.querySelector(".sleep");
const adoptPet = document.querySelector(".start");
const thoughtBubble = document.querySelector(".thought-bubble");
const statusBar = document.querySelector(".status-bar");
const petImage = document.querySelector(".image");
const graveImage = document.querySelector(".grave");
const video = document.getElementById("petVideo");

const hungerBarFill = document.querySelector('[data-ref="hunger"] .gauge-fill');
const hungerBarValue = document.querySelector(
  '[data-ref="hunger"] .gauge-value'
);

const happinessBarFill = document.querySelector(
  '[data-ref="happiness"] .gauge-fill'
);
const happinessBarValue = document.querySelector(
  '[data-ref="happiness"] .gauge-value'
);
const gameButtonsContainer = document.querySelector(".game-buttons-container");
const adoptContainer = document.querySelector(".adopt-container");

class Pet {
  constructor(name) {
    this.name = name;
    this.hunger = 0;
    this.happiness = 10;
    this.lifeSpan = 20;
    this.state = "main";
    this.states = [
      "main",
      "eating",
      "sleeping",
      "playing",
      "sad",
      "hungry",
      "dead",
    ];

    this.stateVideos = {
      adopted: "./animations/main.mp4",
      main: "./animations/main.mp4",
      eating: "./animations/eating.mp4",
      sleeping: "./animations/sleeping.mp4",
      playing: "./animations/playing.mp4",
      sad: "./animations/weeping.mp4",
      hungry: "./animations/weeping.mp4",
    };

    this.stateSounds = {
      main: "mainSound",
      eating: "feedSound",
      sleeping: "sleepSound",
      playing: "barkSound",
      sad: "weepingSound",
      hungry: "weepingSound",
      dead: "mainSound",
    };

    this.source = document.querySelector("source");
    this.source.src = this.stateVideos[this.state]; // Set the initial video source
    this.source.type = "video/mp4"; // Set the video type
    this.isVideoPlayingFinished = true;

    this.stateTransitionsCondition = {
      "sad->playing": () => true,
      "playing->sad": () => this.isVideoPlayingFinished && this.happiness < 2,
      "sad->eating": () => true,
      "eating->sad": () => this.isVideoPlayingFinished && this.happiness < 2,
      "sad->sleeping": () => true,
      "sleeping->sad": () => this.isVideoPlayingFinished && this.happiness < 2,
      "sad->main": () =>
         this.hunger < 8 && this.happiness > 2,
      "main->sad": () => this.happiness < 2,
      "sad->dead": () => this.happiness === 0,
      "playing->eating": () => this.isVideoPlayingFinished && this.hunger !== 0,
      "playing->sleeping": () => this.isVideoPlayingFinished,
      "sleeping->playing": () =>
        this.isVideoPlayingFinished && this.happiness !== 10,
      "playing->main": () =>
        this.isVideoPlayingFinished && this.happiness >= 2 && this.hunger < 8,
      "main->playing": () => this.happiness !== 10,
      "playing->hungry": () => this.isVideoPlayingFinished && this.hunger > 8,
      "eating->sleeping": () => this.isVideoPlayingFinished,
      "sleeping->eating": () =>
        this.isVideoPlayingFinished && this.hunger !== 0,
      "eating->main": () =>
        this.isVideoPlayingFinished && this.hunger < 8 && this.happiness > 2,
      "main->eating": () => this.hunger !== 0,
      "eating->hungry": () => this.hunger > 8,
      "hungry->eating": () => true,
      "sleeping->main": () =>
        this.isVideoPlayingFinished && this.hunger < 8 && this.happiness > 2,
      "main->sleeping": () => true,
      "sleeping->hungry": () => this.isVideoPlayingFinished && this.hunger > 8,
      "hungry->sleeping": () => true,
      "main->hungry": () => this.hunger > 8,
      "hungry->main": () => this.hunger < 8 && this.happiness > 2,
      "hungry->dead": () => this.hunger === 10,
    };

    feedButton.addEventListener("click", () => {
      if (this.state === "dead") {
        return;
      } else {
        this.feed();
      }
    });

    playButton.addEventListener("click", () => {
      if (this.state === "dead") {
        return;
      } else {
        this.play();
      }
    });

    sleepButton.addEventListener("click", () => {
      if (this.state === "dead") {
        return;
      } else {
        this.sleep();
      }
    });

    video.addEventListener("ended", () => {
      this.isVideoPlayingFinished = true;
    });
    this.loadPetState();
  }

  transitionToNewState(newState) {
    if (
      this.stateTransitionsCondition[`${this.state}->${newState}`] &&
      this.stateTransitionsCondition[`${this.state}->${newState}`]()
    ) {
      this.state = newState;
      this.updateStateUI(this.state);
      return true;
    } else {
      // console.log(`Cannot transition from ${this.state} to ${newState}`);
      return false;
    }
  }

  updateHappinessAndHunger(happinessIncrement = 0, hungerIncrement = 0) {
    this.happiness = Math.max(
      0,
      Math.min(10, this.happiness + happinessIncrement)
    );
    this.hunger = Math.max(0, Math.min(10, this.hunger + hungerIncrement));

    this.updateUI();
    if (this.state === "dead") {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.savePetState();
  }

  updateUI() {
    hungerBarFill.style.width = (10 - this.hunger) * 10 + "%";
    happinessBarFill.style.width = this.happiness * 10 + "%";
    if (this.state === "dead") {
      gameButtonsContainer.style.display = "none";
      adoptContainer.style.display = "flex";
      video.style.display = "none";
      graveImage.style.display = 'block';
    }

    /////////////////not calling!!!!!!!!!!!!
    if (this.state === "adopted") {
      console.log("updateUI is working with adopted state");
      gameButtonsContainer.style.display = "flex";
      adoptContainer.style.display = "none";
      this.state = "main";
    }
  }

  updateStateUI(state = "main") {
    this.updateStatusBar(state);
    this.updateThoughtBubble(state);
    this.playStateVideo(state);
    this.playStateSound(state);
  }

  setIntervalId(intervalId) {
    this.intervalId = intervalId;
  }

  live() {
    const possibleStates = ["main", "sad", "hungry", "dead"];
    this.updateHappinessAndHunger(-1 / this.lifeSpan, 1 / this.lifeSpan);
    for (const state of possibleStates) {
      if (this.transitionToNewState(state)) {
        break;
      }
    }
    console.log(this.state);
  }

  feed() {
    if (
      this.state !== "eating" &&
      this.state !== "playing" &&
      this.state !== "sleeping"
    ) {
      this.updateHappinessAndHunger(0, -1, "eating");
      this.transitionToNewState("eating");
    } else return;
  }

  play() {
    if (
      this.state !== "eating" &&
      this.state !== "playing" &&
      this.state !== "sleeping"
    ) {
      this.updateHappinessAndHunger(1, 0, "playing");
      this.transitionToNewState("playing");
    }
  }

  sleep() {
    if (
      this.state !== "eating" &&
      this.state !== "playing" &&
      this.state !== "sleeping"
    ) {
      this.updateHappinessAndHunger(1, 0, "sleeping");
      this.transitionToNewState("sleeping");
    }
  }

  playStateVideo(state) {
    const videoFile = this.stateVideos[state];
    if (videoFile) {
      video.currentTime = 0;
      this.source.src = videoFile;
      video.loop = state === "main" || state === "sad" || state === "hungry";
      video.load();
      video.play();
      this.isVideoPlayingFinished = false;
    } else {
      console.log("Unknown state:", state);
    }
  }

  playStateSound(state) {
    const soundId = this.stateSounds[state];
    if (soundId) {
      const sound = document.getElementById(soundId);
      if (sound) {
        sound.currentTime = 0; // rewind to start
        sound.play();
      } else {
        console.log("Sound element not found for state:", state);
      }
    } else {
      console.log("Unknown state for sound:", state);
    }
  }

  savePetState() {
    const petState = {
      hunger: this.hunger,
      happiness: this.happiness,
      state: this.state,
    };
    localStorage.setItem("virtualPet", JSON.stringify(petState));
  }

  loadPetState() {
    const savedState = localStorage.getItem("virtualPet");
    if (savedState) {
      const pet = JSON.parse(savedState);
      this.hunger = pet.hunger;
      this.happiness = pet.happiness;
      this.state = pet.state;
      this.updateUI();
      this.updateStateUI(this.state);
    }
  }

  updateThoughtBubble(state) {
    switch (state) {
      case "main":
        thoughtBubble.textContent = "I feel okay!";
        break;
      case "eating":
        thoughtBubble.textContent = "Yummy! I love this food! 🍖";
        break;
      case "sleeping":
        thoughtBubble.textContent = "I am so sleepy! 💤";
        break;
      case "playing":
        thoughtBubble.textContent = "I love playing with you! 🐾";
        break;
      case "adopted":
        thoughtBubble.textContent = "I am your happy pet! 🐶";
        break;
      case "sad":
        thoughtBubble.textContent = "I am so sad! 😭";
        break;
      case "hungry":
        thoughtBubble.textContent = "I am so hungry! 😭";
        break;
      case "dead":
        thoughtBubble.textContent = "Goodbye, friend... ";
        break;
      default:
        thoughtBubble.textContent = "";
    }
  }

  updateStatusBar(state) {
    switch (state) {
      case "adopted":
        statusBar.textContent = "";
        statusBar.style.color = "black";
        break;
      case "main":
        statusBar.textContent = "Would you like to adopt this dog?";
        statusBar.style.color = "black";
        break;
      case "eating":
        statusBar.textContent = "";
        statusBar.style.color = "black";
        break;
      case "sleeping":
        statusBar.textContent = "";
        statusBar.style.color = "black";
        break;
      case "playing":
        statusBar.textContent = "";
        statusBar.style.color = "black";
        break;
      case "sad":
        statusBar.textContent = "";
        statusBar.style.color = "black";
        break;
      case "hungry":
        statusBar.textContent = "";
        statusBar.style.color = "black";
        break;
      case "dead":
        statusBar.textContent = "Your pet has passed away! 🪦";
        statusBar.style.color = "rgb(66, 66, 66)";
        break;
      default:
        statusBar.textContent = "";
    }
  }

  rename(newName) {
    statusBar.textContent = `I changed my pet's name from ${this.name} to ${newName}.`;
    this.name = newName;
  }
}

class GameManager {
  constructor(pet) {
    this.pet = pet;
    this.intervalId = null;
    this.gameStarted = true;

    adoptPet.addEventListener("click", () => {
      this.resetGame();
    });
  }

  resetGame() {
    this.gameStarted = true;
    this.pet.state = "adopted";
    this.pet.hunger = 0;
    this.pet.happiness = 10;
    this.pet.updateUI();
    graveImage.style.display = "none";
    video.style.display = "block";
    this.pet.updateStateUI("main");
    const intervalId = setInterval(() => this.updateLife(), 200);
    this.pet.setIntervalId(intervalId);
    this.pet.savePetState();
  }

  updateLife() {
    if (this.gameStarted) {
      this.gameStarted = false;
    } else {
      this.pet.live();
    }
  }
}

const myPet = new Pet("Fluffy");
const gameManager = new GameManager(myPet);
