const LOCAL_STORAGE_KEY = "mfb_dev_extension_data";
let config = localStorage.getItem(LOCAL_STORAGE_KEY);

if (config === null) {
  config = { zipCode: "", county: "", delay: 50 };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
} else {
  config = JSON.parse(config);
}

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

class Step {
  title = "";

  async fill() {}

  isOnPage() {
    return this.title === document.title;
  }

  async continue() {
    await this._clickButton(document.querySelector('button[type="submit"]'));
  }

  async _fillTextField(value, element) {
    await wait(config.delay);
    element.focus();
    for (let i = 0; i < 100; i++) {
      document.execCommand("delete");
    }
    document.execCommand("insertText", true, value);
  }

  async _fillSelectField(value, element) {
    await wait(config.delay);

    element.focus();
    for (let i = 0; i < 100; i++) {
      document.execCommand("delete");
    }
    document.execCommand("insertText", true, value);
  }

  async _fillRadioField(value, element) {
    await wait(config.delay);
    element.querySelector(`[value="${value}"]`).click();
  }

  async _clickButton(element) {
    await wait(config.delay);
    element.click();
  }
}

class Language extends Step {
  title = "Preferred Language";
}

class Disclaimer extends Step {
  title = "Legal";

  async fill() {
    await this._clickButton(
      document.querySelector('[name="agreeToTermsOfService"]'),
    );
    await this._clickButton(document.querySelector('[name="is13OrOlder"]'));
  }
}

class ZipCode extends Step {
  title = "Zip and County";

  async fill() {
    await this._fillTextField(
      config.zipCode,
      document.querySelector('[name="zipcode"]'),
    );
    await this._fillSelectField(
      config.county,
      document.querySelector('[name="county"]'),
    );
  }
}

class HouseholdSize extends Step {
  title = "Number of Household Members";

  async fill() {
    await this._fillTextField(
      "2",
      document.querySelector('[name="householdSize"]'),
    );
  }
}

class HouseholdMember extends Step {
  title = "Household Member";

  isOnPage() {
    return (
      document.title === this.title &&
      document.location.toString().endsWith("1")
    );
  }

  async fill() {
    await this._fillSelectField(
      "1",
      document.querySelector('[name="birthMonth"]'),
    );
    await this._fillTextField(
      "2000",
      document.querySelector(".MuiAutocomplete-input"),
    );
    await this._clickButton(
      document
        .querySelector(".option-cards-container")
        .querySelectorAll("button")[0],
    );
    await this._fillRadioField(
      "true",
      document.querySelector('[role="radiogroup"]'),
    );
    await wait(config.delay);
    await this._fillSelectField(
      "wages",
      document.querySelector('[name="incomeStreams.0.incomeStreamName"]'),
    );
    await this._fillSelectField(
      "monthly",
      document.querySelector('[name="incomeStreams.0.incomeFrequency"]'),
    );
    await this._fillTextField(
      "1000",
      document.querySelector('[name="incomeStreams.0.incomeAmount"]'),
    );
  }
}

class HouseholdMemberChild extends Step {
  title = "Household Member";

  isOnPage() {
    return (
      document.title === this.title &&
      !document.location.toString().endsWith("1")
    );
  }

  async fill() {
    await this._fillSelectField(
      "1",
      document.querySelector('[name="birthMonth"]'),
    );
    await this._fillTextField(
      "2021",
      document.querySelector(".MuiAutocomplete-input"),
    );
    await this._fillSelectField(
      "child",
      document.querySelector('[name="relationshipToHH"]'),
    );
    await this._clickButton(
      document
        .querySelector(".option-cards-container")
        .querySelectorAll("button")[0],
    );
  }
}

class Expenses extends Step {
  title = "Expenses";

  async fill() {
    try {
      // if it is the energy calculator
      for (const button of document
        .querySelector(".multiselect-tiles-container")
        .querySelectorAll("button")) {
        await this._clickButton(button);
      }
    } catch (err) {}
  }
}

class Assets extends Step {
  title = "Assets";

  async fill() {
    await this._fillTextField(
      "100",
      document.querySelector('[name="householdAssets"]'),
    );
  }
}

class Benefits extends Step {
  title = "Existing Benefits";
}

class UrgenNeeds extends Step {
  title = "Near Term Help";

  async fill() {
    for (const button of document
      .querySelector(".multiselect-tiles-container")
      .querySelectorAll("button")) {
      await this._clickButton(button);
    }
  }
}

class ReferrerSource extends Step {
  title = "Referral";

  async fill() {
    await this._fillSelectField(
      "testOrProspect",
      document.querySelector('[name="referralSource"]'),
    );
  }
}

class SignUp extends Step {
  title = "Optional Sign Up";
}

class EnergyCalculatorElectricProvider extends Step {
  title = "Electricity Provider";

  async fill() {
    await this._fillSelectField(
      "other",
      document.querySelector('[name="electricityProvider"]'),
    );
  }
}

class EnergyCalculatorGasProvider extends Step {
  title = "Gas Provider";

  async fill() {
    await this._fillSelectField(
      "other",
      document.querySelector('[name="gasProvider"]'),
    );
  }
}

class EnergyCalculatorUtilityStatus extends Step {
  title = "Utility Service Status";

  async fill() {
    for (const button of document
      .querySelector(".option-cards-container")
      .querySelectorAll("button")) {
      await this._clickButton(button);
    }
  }
}

class EnergyCalculatorApplianceBroken extends Step {
  title = "Appliance Broken or Needs Replacement?";

  async fill() {
    for (const button of document
      .querySelector(".option-cards-container")
      .querySelectorAll("button")) {
      await this._clickButton(button);
    }
  }
}

const steps = [
  new Language(),
  new Disclaimer(),
  new ZipCode(),
  new HouseholdSize(),
  new HouseholdMember(),
  new HouseholdMemberChild(),
  new Expenses(),
  new Assets(),
  new Benefits(),
  new UrgenNeeds(),
  new ReferrerSource(),
  new SignUp(),
  new EnergyCalculatorElectricProvider(),
  new EnergyCalculatorGasProvider(),
  new EnergyCalculatorUtilityStatus(),
  new EnergyCalculatorApplianceBroken(),
];

let prevUrl = "";
let running = false;
let prevRunning = false;

async function fill() {
  let ran = false;
  for (const step of steps) {
    if (step.isOnPage()) {
      console.log("Filling:", document.title);
      await step.fill();
      await step.continue();
      ran = true;
      break;
    }
  }

  if (!ran) {
    running = false;
  }
}

const i = setInterval(() => {
  if (running) {
    if (running !== prevRunning) {
      console.log("--STARTING IN AUTOFILL MODE--");
    }

    if (document.location.toString() !== prevUrl || running !== prevRunning) {
      fill();
      prevUrl = document.location.toString();
    }
  }
  if (running !== prevRunning) {
    console.log("--STOPING IN AUTOFILL MODE--");
  }
  prevRunning = running;
}, config.delay * 5);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_auto_fill") {
    running = !running;
  }
});
