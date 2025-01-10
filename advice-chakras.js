document.addEventListener("DOMContentLoaded", async () => {
  // Define chakra color schemes
  const chakraThemes = {
    Root: {
      primary: '#E31E24',
      secondary: '#FFE6E6',
      accent: '#FF9999'
    },
    Sacral: {
      primary: '#F7931E',
      secondary: '#FFF3E6',
      accent: '#FFB266'
    },
    'Solar Plexus': {
      primary: '#FFF100',
      secondary: '#FFFDE6',
      accent: '#FFFF66'
    },
    Heart: {
      primary: '#00A651',
      secondary: '#E6FFE6',
      accent: '#99FF99'
    },
    Throat: {
      primary: '#00A99D',
      secondary: '#E6FFFF',
      accent: '#99FFFF'
    },
    'Third Eye': {
      primary: '#0072BC',
      secondary: '#E6F3FF',
      accent: '#99D6FF'
    },
    Crown: {
      primary: '#92278F',
      secondary: '#F9E6FF',
      accent: '#E699FF'
    }
  };

  // Function to apply chakra theme
  function applyChakraTheme(chakraName) {
    const theme = chakraThemes[chakraName];
    const root = document.documentElement;
    root.style.setProperty('--chakra-primary', theme.primary);
    root.style.setProperty('--chakra-secondary', theme.secondary);
    root.style.setProperty('--chakra-accent', theme.accent);
  }

  // Function to create list items from comma-separated string
  function createListItems(text) {
    if (!text) return '';
    return text.split(',')
      .map(item => `<li>${item.trim()}</li>`)
      .join('');
  }

  try {
    // Fetch Google Sheet data
    const googleSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiSqoTJHsc_CFZd59aE85yPNdFNDfmRVGHX2T3h-exgVOnJAxdjs4Xs7AZQdRYyMU8Sq6XSErQ-TZk/pub?gid=632041955&single=true&output=csv";
    const response = await fetch(googleSheetURL);
    const csvData = await response.text();

    // Parse CSV data
    const rows = csvData.split("\n");
    const headers = rows[0].split(",").map(header => header.trim());
    
    const chakraData = rows.slice(1).map(row => {
      const values = row.split(",");
      return headers.reduce((acc, header, index) => {
        acc[header] = values[index]?.trim();
        return acc;
      }, {});
    });

    // Get most unbalanced chakra from localStorage
    const mostUnbalanced = localStorage.getItem("mostUnbalanced1");
    
    // Find the chakra's data
    const selectedChakra = chakraData.find(item => item.Chakra === mostUnbalanced);

    if (selectedChakra) {
      // Apply color theme
      applyChakraTheme(mostUnbalanced);

      // Update page content
      document.getElementById("chakra-title").textContent = 
        `${mostUnbalanced} Chakra Advice`;

      // Update sections with formatted lists
      document.getElementById("things-to-do").innerHTML = `
        <h2>Things to Do</h2>
        <ul>${createListItems(selectedChakra["Things to Do"])}</ul>
      `;

      document.getElementById("things-to-eat").innerHTML = `
        <h2>Nurturing Foods</h2>
        <ul>${createListItems(selectedChakra["Things to Eat"])}</ul>
      `;

      document.getElementById("yoga-poses").innerHTML = `
        <h2>Yoga Poses</h2>
        <ul>${createListItems(selectedChakra["Yoga Poses"])}</ul>
      `;

      document.getElementById("products").innerHTML = `
        <h2>Healing Products</h2>
        <ul>${createListItems(selectedChakra["Products"])}</ul>
      `;
    }

    // Add event listener for color therapy button
    document.getElementById("color-therapy-button").addEventListener("click", () => {
      // Store the current chakra for the visualization page
      localStorage.setItem("selectedChakra", mostUnbalanced);
      window.location.href = "visualization.html";
    });

  } catch (error) {
    console.error("Error loading chakra advice:", error);
    document.getElementById("chakra-title").textContent = 
      "Error loading chakra advice. Please try again.";
  }
});
