class PasswordGenerator {
  constructor() {
    this.characters = {
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
    };

    this.init();
  }

  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.updateStrengthMeter();
  }

  cacheDOMElements() {
    this.result = document.getElementById("result");
    this.lengthSlider = document.getElementById("password-length");
    this.lengthOutput = document.getElementById("length-output");
    this.generateBtn = document.getElementById("generate-button");
    this.copyBtn = document.getElementById("copy-button");

    this.options = {
      lowercase: document.getElementById("lowercase-option"),
      uppercase: document.getElementById("uppercase-option"),
      numbers: document.getElementById("number-option"),
    };
  }

  bindEvents() {
    this.generateBtn.addEventListener("click", () => this.generatePassword());
    this.copyBtn.addEventListener("click", () => this.copyPassword());

    this.lengthSlider.addEventListener("input", (e) => {
      this.lengthOutput.textContent = e.target.value;
      if (this.result.value !== "Click Generate") {
        this.generatePassword();
      }
    });

    Object.values(this.options).forEach((option) => {
      option.addEventListener("change", () => {
        this.updateStrengthMeter();
        if (this.result.value !== "Click Generate") {
          this.generatePassword();
        }
      });
    });
  }

  getSelectedCharacters() {
    return Object.entries(this.options)
      .filter(([key, checkbox]) => checkbox.checked)
      .map(([key]) => this.characters[key])
      .join("");
  }

  getSecureRandom(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  generatePassword() {
    const characters = this.getSelectedCharacters();

    if (!characters) {
      alert("Please select at least one character type");
      return;
    }

    const length = Number(this.lengthSlider.value);
    let password = "";

    Object.entries(this.options).forEach(([key, checkbox]) => {
      if (checkbox.checked) {
        const chars = this.characters[key];
        password += chars[this.getSecureRandom(chars.length)];
      }
    });

    while (password.length < length) {
      const index = this.getSecureRandom(characters.length);
      password += characters[index];
    }

    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
    this.result.value = password;
    this.updateStrengthMeter();
  }

  async copyPassword() {
    try {
      await navigator.clipboard.writeText(this.result.value);
      this.copyBtn.textContent = "COPIED!";
      setTimeout(() => (this.copyBtn.textContent = "COPY"), 1500);
    } catch (err) {
      alert("Failed to copy password: " + err);
    }
  }

  calculatePasswordStrength(password) {
    if (password === "Click Generate") return 0;

    let strength = 0;
    strength += Math.min(password.length * 2, 30);
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;

    return Math.min(strength, 100);
  }

  updateStrengthMeter() {
    const password = this.result.value;
    const strength = this.calculatePasswordStrength(password);
    let strengthLabel = "None";

    if (strength < 50) strengthLabel = "Weak";
    else if (strength < 75) strengthLabel = "Medium";
    else strengthLabel = "Strong";

    document.getElementById("strength-text").textContent = strengthLabel;
  }
}

// Start the password generator when the page loads
document.addEventListener("DOMContentLoaded", () => new PasswordGenerator());
