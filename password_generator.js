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
    this.lengthOutput = document.getElementById("length-display");
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
    // Check which options are selected
    const selectedTypes = Object.entries(this.options)
      .filter(([key, checkbox]) => checkbox.checked)
      .map(([key]) => key);

    if (selectedTypes.length === 0) {
      alert("Please select at least one character type");
      return;
    }

    const length = Number(this.lengthSlider.value);
    let password = [];

    // If only numbers are selected, fill the entire password with numbers
    if (selectedTypes.length === 1 && selectedTypes[0] === "numbers") {
      for (let i = 0; i < length; i++) {
        const nums = this.characters.numbers;
        password.push(nums[this.getSecureRandom(nums.length)]);
      }
    } else {
      // Handle mixed character types
      if (this.options.numbers.checked) {
        // Ensure at least 30% of characters are numbers when numbers are selected
        const numberCount = Math.max(1, Math.floor(length * 0.3));

        // Add required numbers
        for (let i = 0; i < numberCount; i++) {
          const nums = this.characters.numbers;
          password.push(nums[this.getSecureRandom(nums.length)]);
        }
      }

      // Fill remaining length with other selected character types
      const remainingLength = length - password.length;
      const remainingTypes = selectedTypes.filter(
        (type) => type !== "numbers" || selectedTypes.length === 1
      );

      for (let i = 0; i < remainingLength; i++) {
        const randomType =
          remainingTypes[this.getSecureRandom(remainingTypes.length)];
        const chars = this.characters[randomType];
        password.push(chars[this.getSecureRandom(chars.length)]);
      }
    }

    // Shuffle the password array using Fisher-Yates algorithm with secure random
    for (let i = password.length - 1; i > 0; i--) {
      const j = this.getSecureRandom(i + 1);
      [password[i], password[j]] = [password[j], password[i]];
    }

    this.result.value = password.join("");
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
