console.log("Advice script loaded!");
console.log("Advice page script loaded successfully!");
console.log(window.location.href);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("advice-container").textContent =
    "Hello from JavaScript!";
});
