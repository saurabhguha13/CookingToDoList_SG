import { generateCookingPlan } from './api.js';

// Application State
let currentPlan = null;
let apiSettings = {
  apiKey: localStorage.getItem('gemini_api_key') || ''
};

// Loading statuses to rotate through during generation
const LOADING_STATUSES = [
  "Rinsing organic greens...",
  "Preheating the digital pans...",
  "Peeling cloves of garlic...",
  "Structuring grocery list by categories...",
  "Optimizing cooking timing checklist...",
  "Plate arrangement and final garnishing..."
];

// DOM Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsDialog = document.getElementById('settingsDialog');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
const apiStatusMessage = document.getElementById('apiStatusMessage');

const plannerForm = document.getElementById('plannerForm');
const dayDescription = document.getElementById('dayDescription');
const dietPreference = document.getElementById('dietPreference');
const portions = document.getElementById('portions');
const fridgeIngredients = document.getElementById('fridgeIngredients');
const mockModeToggle = document.getElementById('mockModeToggle');
const demoModeLabel = document.getElementById('demoModeLabel');

const outputPanel = document.getElementById('outputPanel');
const outputEmptyState = document.getElementById('outputEmptyState');
const outputLoadingState = document.getElementById('outputLoadingState');
const outputContent = document.getElementById('outputContent');
const loadingStatusText = document.getElementById('loadingStatusText');
const loadExampleBtn = document.getElementById('loadExampleBtn');

const planTitle = document.getElementById('planTitle');
const planSubtitle = document.getElementById('planSubtitle');
const mealsListContainer = document.getElementById('mealsListContainer');
const groceryContainer = document.getElementById('groceryContainer');
const timelineContainer = document.getElementById('timelineContainer');
const wasteTipsContainer = document.getElementById('wasteTipsContainer');
const energyExplanationText = document.getElementById('energyExplanationText');

const copyAllBtn = document.getElementById('copyAllBtn');
const resetPlanBtn = document.getElementById('resetPlanBtn');
const copyGroceryBtn = document.getElementById('copyGroceryBtn');
const addCustomItemForm = document.getElementById('addCustomItemForm');
const customItemInput = document.getElementById('customItemInput');

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Initialize App
function init() {
  // Theme Setup
  setupTheme();
  
  // Load Saved API key
  if (apiSettings.apiKey) {
    apiKeyInput.value = apiSettings.apiKey;
    mockModeToggle.checked = false;
    demoModeLabel.textContent = "Live AI Mode Active";
  } else {
    mockModeToggle.checked = true;
    demoModeLabel.textContent = "Demo/Mock Mode (API key missing)";
  }

  // Load Saved Plan (if any)
  loadSavedPlan();

  // Event Listeners
  themeToggleBtn.addEventListener('click', toggleTheme);
  openSettingsBtn.addEventListener('click', () => settingsDialog.showModal());
  closeSettingsBtn.addEventListener('click', () => settingsDialog.close());
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  clearApiKeyBtn.addEventListener('click', clearApiKey);
  
  plannerForm.addEventListener('submit', handleFormSubmit);
  loadExampleBtn.addEventListener('click', loadMockExample);
  resetPlanBtn.addEventListener('click', resetPlan);
  copyAllBtn.addEventListener('click', copyAllPlanText);
  copyGroceryBtn.addEventListener('click', copyGroceryText);
  addCustomItemForm.addEventListener('submit', addCustomGroceryItem);

  // Tab navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      
      // Update tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update panes
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(target).classList.add('active');
    });
  });

  // Modal dismiss on click outside
  settingsDialog.addEventListener('click', (e) => {
    const dialogDimensions = settingsDialog.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      settingsDialog.close();
    }
  });
}

// Theme Handling
function setupTheme() {
  const savedTheme = localStorage.getItem('color-scheme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('color-scheme', newTheme);
}

// API Key Management
function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem('gemini_api_key', key);
    apiSettings.apiKey = key;
    mockModeToggle.checked = false;
    demoModeLabel.textContent = "Live AI Mode Active";
    showStatusMessage("API key saved successfully!", "success");
    setTimeout(() => {
      settingsDialog.close();
      apiStatusMessage.classList.add('hidden');
    }, 1500);
  } else {
    showStatusMessage("Please enter a valid key.", "error");
  }
}

function clearApiKey() {
  localStorage.removeItem('gemini_api_key');
  apiSettings.apiKey = '';
  apiKeyInput.value = '';
  mockModeToggle.checked = true;
  demoModeLabel.textContent = "Demo/Mock Mode (API key missing)";
  showStatusMessage("API key removed.", "success");
  setTimeout(() => {
    settingsDialog.close();
    apiStatusMessage.classList.add('hidden');
  }, 1500);
}

function showStatusMessage(text, type) {
  apiStatusMessage.textContent = text;
  apiStatusMessage.className = `dialog-status-message ${type}`;
  apiStatusMessage.classList.remove('hidden');
}

// Form Submission & Generation
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const description = dayDescription.value.trim();
  const selectedEnergy = document.querySelector('input[name="energy"]:checked').value;
  const diet = dietPreference.value;
  const portionCount = portions.value;
  const ingredients = fridgeIngredients.value.trim();
  const useMock = mockModeToggle.checked;

  if (!description) return;

  // Transition to Loading State
  outputEmptyState.classList.add('hidden');
  outputContent.classList.add('hidden');
  outputLoadingState.classList.remove('hidden');

  // Rotate loading text
  let statusIndex = 0;
  loadingStatusText.textContent = LOADING_STATUSES[0];
  const statusInterval = setInterval(() => {
    statusIndex = (statusIndex + 1) % LOADING_STATUSES.length;
    loadingStatusText.textContent = LOADING_STATUSES[statusIndex];
  }, 3000);

  try {
    const inputData = {
      dayDescription: description,
      energy: selectedEnergy,
      diet: diet,
      portions: portionCount,
      fridgeIngredients: ingredients
    };

    const plan = await generateCookingPlan(apiSettings.apiKey, inputData, useMock);
    
    // Save generated plan state in app & localStorage
    currentPlan = plan;
    savePlanState();
    
    // Render
    renderPlan(plan);

    // Swap loading to content
    outputLoadingState.classList.add('hidden');
    outputContent.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert(`Generation failed: ${err.message || 'Check your internet connection or API Key settings.'}`);
    outputLoadingState.classList.add('hidden');
    outputEmptyState.classList.remove('hidden');
  } finally {
    clearInterval(statusInterval);
  }
}

function loadMockExample() {
  dayDescription.value = "Hectic workday. Busy until 2 PM with client calls, then a quick break. Evening is free but I am feeling slightly tired. Need simple meal options.";
  document.getElementById('energyLow').checked = true;
  dietPreference.value = "none";
  portions.value = "2 people";
  fridgeIngredients.value = "spinach, feta cheese";
  mockModeToggle.checked = true;
  
  // Trigger form submit
  plannerForm.dispatchEvent(new Event('submit'));
}

// Plan Persistence
function savePlanState() {
  if (currentPlan) {
    localStorage.setItem('prepday_saved_plan', JSON.stringify(currentPlan));
  }
}

function loadSavedPlan() {
  const saved = localStorage.getItem('prepday_saved_plan');
  if (saved) {
    try {
      currentPlan = JSON.parse(saved);
      renderPlan(currentPlan);
      outputEmptyState.classList.add('hidden');
      outputContent.classList.remove('hidden');
    } catch (e) {
      console.error("Error loading saved plan from localStorage", e);
      localStorage.removeItem('prepday_saved_plan');
    }
  }
}

function resetPlan() {
  if (confirm("Are you sure you want to clear your current cooking plan?")) {
    currentPlan = null;
    localStorage.removeItem('prepday_saved_plan');
    outputContent.classList.add('hidden');
    outputEmptyState.classList.remove('hidden');
    
    // Reset Form fields
    dayDescription.value = "";
    document.getElementById('energyMedium').checked = true;
    dietPreference.value = "none";
    portions.value = "2 people";
    fridgeIngredients.value = "";
  }
}

// Rendering Engine
function renderPlan(plan) {
  // Title & Subtitle
  planTitle.textContent = plan.planTitle || "Tailored Prep Plan";
  
  // Render Meals
  mealsListContainer.innerHTML = '';
  if (plan.meals && plan.meals.length > 0) {
    plan.meals.forEach((meal, mealIdx) => {
      const mealCard = document.createElement('div');
      mealCard.className = 'meal-card';
      
      const difficultyClass = (meal.difficulty || 'medium').toLowerCase();
      
      let prepStepsHTML = '';
      if (meal.prepSteps && meal.prepSteps.length > 0) {
        prepStepsHTML = `
          <h4 class="checklist-section-title">🔪 Prep Steps</h4>
          <ul class="checklist">
            ${meal.prepSteps.map((step, idx) => `
              <li class="checklist-item ${meal.checkedPrep?.includes(idx) ? 'checked' : ''}" data-meal="${mealIdx}" data-type="prep" data-index="${idx}">
                <input type="checkbox" ${meal.checkedPrep?.includes(idx) ? 'checked' : ''} id="meal-${mealIdx}-prep-${idx}">
                <label for="meal-${mealIdx}-prep-${idx}" class="checklist-text">${step}</label>
              </li>
            `).join('')}
          </ul>
        `;
      }

      let cookStepsHTML = '';
      if (meal.cookingSteps && meal.cookingSteps.length > 0) {
        cookStepsHTML = `
          <h4 class="checklist-section-title">🍳 Cooking Steps</h4>
          <ul class="checklist">
            ${meal.cookingSteps.map((step, idx) => `
              <li class="checklist-item ${meal.checkedCook?.includes(idx) ? 'checked' : ''}" data-meal="${mealIdx}" data-type="cook" data-index="${idx}">
                <input type="checkbox" ${meal.checkedCook?.includes(idx) ? 'checked' : ''} id="meal-${mealIdx}-cook-${idx}">
                <label for="meal-${mealIdx}-cook-${idx}" class="checklist-text">${step}</label>
              </li>
            `).join('')}
          </ul>
        `;
      }

      mealCard.innerHTML = `
        <div class="meal-card-header">
          <div>
            <span class="meal-type">${meal.type}</span>
            <h3 class="meal-title">${meal.name}</h3>
            <div class="meal-meta">
              <span>⏱️ ${meal.time}</span>
              <span>•</span>
              <span class="difficulty-badge ${difficultyClass}">${meal.difficulty}</span>
            </div>
          </div>
        </div>
        ${prepStepsHTML}
        ${cookStepsHTML}
        ${meal.tips ? `<div class="meal-tips">💡 <strong>Chef Tip:</strong> ${meal.tips}</div>` : ''}
      `;

      mealsListContainer.appendChild(mealCard);
    });

    // Add event listeners to checklist items
    document.querySelectorAll('.meals-list .checklist-item').forEach(item => {
      item.addEventListener('click', toggleChecklistItem);
    });
  }

  // Render Grocery List
  renderGrocery(plan);

  // Render Timeline
  timelineContainer.innerHTML = '';
  if (plan.timeline && plan.timeline.length > 0) {
    plan.timeline.forEach((step, idx) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = `timeline-step ${plan.completedTimelineSteps?.includes(idx) ? 'completed' : ''}`;
      stepDiv.dataset.index = idx;
      
      stepDiv.innerHTML = `
        <div class="timeline-step-header">
          <span class="timeline-time">${step.time}</span>
        </div>
        <p class="timeline-text">${step.action}</p>
      `;

      // Allow checking off timeline steps
      stepDiv.addEventListener('click', toggleTimelineStep);
      timelineContainer.appendChild(stepDiv);
    });
  }

  // Render Tips
  wasteTipsContainer.innerHTML = '';
  if (plan.wasteTips && plan.wasteTips.length > 0) {
    plan.wasteTips.forEach(tip => {
      const li = document.createElement('li');
      // Handle either string element or object {text: "..."}
      li.textContent = typeof tip === 'object' ? tip.text : tip;
      wasteTipsContainer.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = "Combine prep ingredients to cook multiple portions at once.";
    wasteTipsContainer.appendChild(li);
  }

  energyExplanationText.textContent = plan.energyExplanation || "This customized layout organizes dishes around your energy limits, focusing on speed when you are tired and culinary growth when you have the time.";
}

function renderGrocery(plan) {
  groceryContainer.innerHTML = '';
  if (plan.groceryList && plan.groceryList.length > 0) {
    plan.groceryList.forEach((cat, catIdx) => {
      const box = document.createElement('div');
      box.className = 'grocery-category-box';
      
      let icon = '🥫';
      const catLower = cat.category.toLowerCase();
      if (catLower.includes('produce') || catLower.includes('veggie')) icon = '🥦';
      else if (catLower.includes('meat') || catLower.includes('protein') || catLower.includes('fish')) icon = '🥩';
      else if (catLower.includes('dairy') || catLower.includes('cheese') || catLower.includes('milk')) icon = '🧀';
      else if (catLower.includes('bakery') || catLower.includes('bread')) icon = '🍞';
      
      box.innerHTML = `
        <h4 class="grocery-category-title"><span>${icon}</span> ${cat.category}</h4>
        <ul class="grocery-list">
          ${cat.items.map((item, itemIdx) => {
            const isChecked = item.checked === true;
            return `
              <li class="grocery-item ${isChecked ? 'checked' : ''}" data-cat="${catIdx}" data-item="${itemIdx}">
                <input type="checkbox" ${isChecked ? 'checked' : ''} id="grocery-${catIdx}-${itemIdx}">
                <label for="grocery-${catIdx}-${itemIdx}" class="grocery-item-text">${item.name}</label>
                ${item.amount ? `<span class="grocery-item-amount">${item.amount}</span>` : ''}
              </li>
            `;
          }).join('')}
        </ul>
      `;
      groceryContainer.appendChild(box);
    });

    // Add listeners to grocery items
    document.querySelectorAll('#groceryContainer .grocery-item').forEach(item => {
      item.addEventListener('click', toggleGroceryItem);
    });
  }
}

// Checklist Item Interactive Actions
function toggleChecklistItem(e) {
  // Prevent double trigger if clicking label/checkbox directly
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
    e.stopPropagation();
    if (e.target.tagName === 'LABEL') return; // let checkbox click bubble
  } else {
    // Tapping the row container flips the checkbox manually
    const checkbox = this.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
  }

  const mealIdx = parseInt(this.dataset.meal);
  const type = this.dataset.type;
  const index = parseInt(this.dataset.index);
  const isChecked = this.querySelector('input[type="checkbox"]').checked;

  if (isChecked) {
    this.classList.add('checked');
  } else {
    this.classList.remove('checked');
  }

  // Persist checked status in state
  const meal = currentPlan.meals[mealIdx];
  if (type === 'prep') {
    if (!meal.checkedPrep) meal.checkedPrep = [];
    if (isChecked) {
      if (!meal.checkedPrep.includes(index)) meal.checkedPrep.push(index);
    } else {
      meal.checkedPrep = meal.checkedPrep.filter(i => i !== index);
    }
  } else if (type === 'cook') {
    if (!meal.checkedCook) meal.checkedCook = [];
    if (isChecked) {
      if (!meal.checkedCook.includes(index)) meal.checkedCook.push(index);
    } else {
      meal.checkedCook = meal.checkedCook.filter(i => i !== index);
    }
  }

  savePlanState();
}

function toggleGroceryItem(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') {
    e.stopPropagation();
    if (e.target.tagName === 'LABEL') return;
  } else {
    const checkbox = this.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
  }

  const catIdx = parseInt(this.dataset.cat);
  const itemIdx = parseInt(this.dataset.item);
  const isChecked = this.querySelector('input[type="checkbox"]').checked;

  if (isChecked) {
    this.classList.add('checked');
  } else {
    this.classList.remove('checked');
  }

  currentPlan.groceryList[catIdx].items[itemIdx].checked = isChecked;
  savePlanState();
}

function toggleTimelineStep() {
  const index = parseInt(this.dataset.index);
  const isCompleted = this.classList.toggle('completed');

  if (!currentPlan.completedTimelineSteps) currentPlan.completedTimelineSteps = [];
  
  if (isCompleted) {
    if (!currentPlan.completedTimelineSteps.includes(index)) {
      currentPlan.completedTimelineSteps.push(index);
    }
  } else {
    currentPlan.completedTimelineSteps = currentPlan.completedTimelineSteps.filter(i => i !== index);
  }

  savePlanState();
}

// Custom Grocery Addition
function addCustomGroceryItem(e) {
  e.preventDefault();
  const name = customItemInput.value.trim();
  if (!name || !currentPlan) return;

  // Look for a "Custom" or "Pantry" category to dump into, or create "Other"
  let targetCat = currentPlan.groceryList.find(c => c.category === 'Other Items' || c.category === 'Custom additions');
  
  if (!targetCat) {
    targetCat = { category: 'Other Items', items: [] };
    currentPlan.groceryList.push(targetCat);
  }

  targetCat.items.push({ name: name, amount: '1', checked: false });
  customItemInput.value = '';
  
  renderGrocery(currentPlan);
  savePlanState();
}

// Clipboard Copy Helpers
function copyAllPlanText() {
  if (!currentPlan) return;

  let text = `=== PREPDAY AI COOKING PLAN: ${currentPlan.planTitle} ===\n\n`;
  
  text += `--- ENERGY METRIC: ---\n${currentPlan.energyExplanation}\n\n`;

  text += `--- MEALS CHECKLIST: ---\n`;
  currentPlan.meals.forEach(m => {
    text += `\n[ ] ${m.type.toUpperCase()}: ${m.name} (${m.time} - ${m.difficulty})\n`;
    text += `  Prep:\n`;
    m.prepSteps.forEach(s => text += `   - ${s}\n`);
    text += `  Cooking:\n`;
    m.cookingSteps.forEach(s => text += `   - ${s}\n`);
    if (m.tips) text += `  Chef Tip: ${m.tips}\n`;
  });

  text += `\n--- GROCERY LIST: ---\n`;
  currentPlan.groceryList.forEach(c => {
    text += `\n* ${c.category}\n`;
    c.items.forEach(i => {
      text += `  [ ] ${i.name} (${i.amount || 'as needed'})\n`;
    });
  });

  text += `\n--- WORKFLOW TIMELINE: ---\n`;
  currentPlan.timeline.forEach(t => {
    text += `* [${t.time}] ${t.action}\n`;
  });

  navigator.clipboard.writeText(text)
    .then(() => alert("Successfully copied entire plan to clipboard!"))
    .catch(err => console.error("Clipboard write failed", err));
}

function copyGroceryText() {
  if (!currentPlan) return;

  let text = `=== GROCERY LIST: ${currentPlan.planTitle} ===\n`;
  currentPlan.groceryList.forEach(c => {
    text += `\n* ${c.category}\n`;
    c.items.forEach(i => {
      if (!i.checked) {
        text += `  [ ] ${i.name} (${i.amount || 'as needed'})\n`;
      }
    });
  });

  navigator.clipboard.writeText(text)
    .then(() => alert("Successfully copied grocery list to clipboard!"))
    .catch(err => console.error("Clipboard write failed", err));
}

// Run application
document.addEventListener('DOMContentLoaded', init);
