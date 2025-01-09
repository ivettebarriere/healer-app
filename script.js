function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function getProgressClass(currentQuestion) {
  const chakra = questions[currentQuestion].Chakra.toLowerCase().replace(
    /\s+/g,
    ""
  );
  return `progress-${chakra}`;
}

const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiSqoTJHsc_CFZd59aE85yPNdFNDfmRVGHX2T3h-exgVOnJAxdjs4Xs7AZQdRYyMU8Sq6XSErQ-TZk/pub?gid=0&single=true&output=csv"; // Replace with your actual URL

let questions = [];
let currentQuestionIndex = 0;
const chakraScores = {};
const totalPossibleScores = {};

async function loadQuestions() {
  try {
    // Add a try-catch block
    const response = await fetch(sheetURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Throw error for bad responses
    }
    const text = await response.text();

    const rows = text.split("\n").map((row) => row.split(","));
    const headers = rows.shift();

    questions = rows.map((row) => {
      const question = Object.fromEntries(
        row.map((cell, i) => [headers[i], cell])
      );
      question.Negative = question.Negative?.toUpperCase() === "TRUE";
      return question;
    });

    questions.forEach((question) => {
      const chakra = question.Chakra;
      chakraScores[chakra] = 0;
      totalPossibleScores[chakra] =
        (totalPossibleScores[chakra] || 0) +
        Math.max(
          parseInt(question.Score1 || 0),
          parseInt(question.Score2 || 0),
          parseInt(question.Score3 || 0)
        );
    });

    console.log("Loaded Questions:", questions);
    console.log("Initialized Scores:", chakraScores);
    console.log("Total Possible Scores:", totalPossibleScores);

    calculateMostUnbalancedChakra();
    showQuestion();
  } catch (error) {
    console.error("Error loading questions:", error);
    // Display an error message to the user on the page
    const quizContainer = document.getElementById("quiz-container");
    if (quizContainer) {
      quizContainer.innerHTML =
        "<p>Error loading quiz. Please check your internet connection and the spreadsheet URL.</p>";
    }
  }
}

function showQuestion() {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const progressContainer =
    document.querySelector(".progress-wrapper") || createProgressElement();
  const progressBar = progressContainer.querySelector(".progress-bar");

  progressBar.style.width = `${progress}%`;

  progressBar.classList.remove(
    "progress-root",
    "progress-sacral",
    "progress-solarplexus",
    "progress-heart",
    "progress-throat",
    "progress-thirdeye",
    "progress-crown"
  );

  progressBar.classList.add(getProgressClass(currentQuestionIndex));

  progressContainer.querySelector(".progress-text").textContent = `${Math.round(
    progress
  )}%`;

  const questionContainer = document.getElementById("question-container");
  const nextButton = document.getElementById("next-button");

  questionContainer.innerHTML = "";
  nextButton.disabled = true;

  if (!document.querySelector(".question-header")) {
    const header = document.createElement("h2");
    header.className = "question-header";
    header.textContent =
      "Connect to your heart and body and answer how you are feeling in the present moment:";
    questionContainer.parentElement.insertBefore(header, questionContainer);
  }

  const question = questions[currentQuestionIndex];

  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  questionDiv.innerHTML = `
      <h3>${question.Question}</h3>
      <label>
          <input type="radio" name="answer" value="${question.Score1}">
          ${question.Option1}
      </label>
      <label>
          <input type="radio" name="answer" value="${question.Score2}">
          ${question.Option2}
      </label>
      <label>
          <input type="radio" name="answer" value="${question.Score3}">
          ${question.Option3}
      </label>
  `;
  questionContainer.appendChild(questionDiv);

  questionContainer
    .querySelectorAll("input[name='answer']")
    .forEach((input) => {
      input.addEventListener("change", () => {
        nextButton.disabled = false;
      });
    });
}

function createProgressElement() {
  const wrapper = document.createElement("div");
  wrapper.className = "progress-wrapper";
  wrapper.innerHTML = `
      <div class="progress-text">0%</div>
      <div class="progress-container">
          <div class="progress-bar"></div>
      </div>
  `;
  document
    .getElementById("quiz-container")
    .insertBefore(wrapper, document.getElementById("question-container"));
  return wrapper;
}

function showResults() {
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "<h2>Your Chakra Balance Results</h2>";
  const mostUnbalancedChakras = calculateMostUnbalancedChakra();

  const chakraPercentages = {};
  Object.keys(chakraScores).forEach((chakra) => {
    const score = chakraScores[chakra];
    const total = totalPossibleScores[chakra];
    chakraPercentages[chakra] = Math.min(
      100,
      Math.round((score / total) * 100)
    );
  });

  Object.keys(chakraPercentages).forEach((chakra) => {
    const percentage = chakraPercentages[chakra];
    const isMostUnbalanced = mostUnbalancedChakras.includes(chakra);
    const resultElement = document.createElement("div");
    resultElement.className = "result-item";

    resultElement.innerHTML = `
          <p><strong>${capitalize(
            chakra
          )} Chakra:</strong> ${percentage}% imbalance ${
      isMostUnbalanced ? "(most balanced)" : ""
    }</p>
          <div class="results-progress-container">
              <div class="results-progress-bar" style="width: ${percentage}%"></div>
          </div>
      `;
    quizContainer.appendChild(resultElement);
  });

  // Add "Let's Fix This" button (OUTSIDE the loop)
  if (mostUnbalancedChakras.length > 0) {
    const fixThisButton = document.createElement("button");
    fixThisButton.id = "fixThisButton";
    fixThisButton.textContent = "Let's Fix This!";
    fixThisButton.style.cssFloat = "right";
    fixThisButton.style.marginTop = "20px";
    quizContainer.appendChild(fixThisButton);

    fixThisButton.addEventListener("click", () => {
      // Store the two most unbalanced chakras in local storage
      localStorage.setItem("mostUnbalanced1", mostUnbalancedChakras[0]);
      if (mostUnbalancedChakras.length > 1)
        localStorage.setItem("mostUnbalanced2", mostUnbalancedChakras[1]);

      // Redirect to the next page
      window.location.href = "/nodebox/advice_page.html";
      // Replace with your actual URL

      if (window.location.pathname === "/index.html") {
        // Code for index.html only
      } else if (window.location.pathname === "/advice_page.html") {
        // Code for advice_page.html
      }
    });
  }
}

function calculateMostUnbalancedChakra() {
  const chakraPercentages = {};
  Object.keys(chakraScores).forEach((chakra) => {
    const score = chakraScores[chakra];
    const total = totalPossibleScores[chakra];
    chakraPercentages[chakra] = Math.min(
      100,
      Math.round((score / total) * 100)
    );
  });

  const minPercentage = Math.min(...Object.values(chakraPercentages));

  const mostUnbalancedChakras = [];
  Object.keys(chakraPercentages).forEach((chakra) => {
    if (chakraPercentages[chakra] === minPercentage) {
      mostUnbalancedChakras.push(chakra);
    }
  });

  console.log("Most Unbalanced Chakras:", mostUnbalancedChakras);
  return mostUnbalancedChakras;
}

document.addEventListener("DOMContentLoaded", () => {
  const nextButton = document.getElementById("next-button");
  const questionContainer = document.getElementById("question-container");

  if (!nextButton || !questionContainer) {
    console.error("Required elements not found in the DOM.");
    return;
  }

  // ... (other functions)

  nextButton.onclick = () => {
    const selectedAnswer = questionContainer.querySelector(
      "input[name='answer']:checked"
    )?.value;
    if (!selectedAnswer) return;

    const scoreToAdd = parseInt(selectedAnswer);
    chakraScores[questions[currentQuestionIndex].Chakra] += scoreToAdd; // Directly add the score

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      calculateMostUnbalancedChakra();
      showResults();
    }
  };

  function calculateMostUnbalancedChakra() {
    const chakraPercentages = {};
    Object.keys(chakraScores).forEach((chakra) => {
      const score = chakraScores[chakra];
      const total = totalPossibleScores[chakra];
      // Calculate percentage, handling potential division by zero
      chakraPercentages[chakra] =
        total === 0 ? 0 : Math.round((score / total) * 100);
    });

    // Find the MAXIMUM percentage (higher percentage = more imbalance)
    const maxPercentage = Math.max(...Object.values(chakraPercentages));

    const mostUnbalancedChakras = [];
    Object.keys(chakraPercentages).forEach((chakra) => {
      if (chakraPercentages[chakra] === maxPercentage) {
        mostUnbalancedChakras.push(chakra);
      }
    });

    console.log("Most Unbalanced Chakras:", mostUnbalancedChakras);
    return mostUnbalancedChakras;
  }

  loadQuestions();
});
