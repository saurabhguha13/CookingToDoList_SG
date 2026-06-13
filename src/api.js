/**
 * API Handler for PrepDay AI
 * Manages connections to Gemini API and houses mock templates for local testing.
 */

// Mock Templates to allow testing without an API key
const MOCK_PLANS = {
  low: {
    planTitle: "Low-Energy Simplicity Plan",
    meals: [
      {
        type: "breakfast",
        name: "Quick Avocado & Seed Toast",
        time: "5 mins",
        difficulty: "Easy",
        prepSteps: [
          "Halve, de-stone, and scoop out avocado flesh.",
          "Toast 2 slices of whole wheat bread."
        ],
        cookingSteps: [
          "Mash avocado onto toast with a fork.",
          "Drizzle with olive oil, sprinkle sea salt, chili flakes, and hemp seeds."
        ],
        tips: "Use pre-toasted seeds to save time. Add a squeeze of lemon if available."
      },
      {
        type: "lunch",
        name: "10-Minute Mediterranean Chickpea Salad",
        time: "10 mins",
        difficulty: "Easy",
        prepSteps: [
          "Rinse and drain one can of chickpeas.",
          "Dice half a cucumber and halve a cup of cherry tomatoes."
        ],
        cookingSteps: [
          "In a bowl, toss chickpeas, tomatoes, cucumbers, and crumbled feta cheese.",
          "Drizzle with ready-made vinaigrette or olive oil and dried oregano."
        ],
        tips: "No cooking needed. This is high in fiber and protein, keeping blood sugar stable during your afternoon meetings."
      },
      {
        type: "dinner",
        name: "Sheet-Pan Cherry Tomato & Feta Gnocchi",
        time: "25 mins",
        difficulty: "Easy",
        prepSteps: [
          "Preheat oven to 400°F (200°C).",
          "Mince 2 cloves of garlic.",
          "Rinse a pint of cherry tomatoes."
        ],
        cookingSteps: [
          "Toss shelf-stable gnocchi, cherry tomatoes, minced garlic, and olive oil on a baking sheet.",
          "Place a block of feta cheese in the middle. Season with salt, pepper, and oregano.",
          "Bake for 20 minutes until tomatoes burst and gnocchi is tender. Stir everything together before serving."
        ],
        tips: "Using a single sheet pan means minimal cleanup, fitting perfectly with your low evening energy levels."
      }
    ],
    groceryList: [
      {
        category: "Produce",
        items: [
          { name: "Avocado", amount: "1" },
          { name: "Cucumber", amount: "1" },
          { name: "Cherry Tomatoes", amount: "2 pints" },
          { name: "Garlic", amount: "1 bulb" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { name: "Whole wheat bread", amount: "1 loaf" },
          { name: "Canned chickpeas", amount: "1 can" },
          { name: "Shelf-stable gnocchi", amount: "1 pack (500g)" },
          { name: "Olive oil & seasonings", amount: "On hand" }
        ]
      },
      {
        category: "Dairy & Cold",
        items: [
          { name: "Feta cheese", amount: "2 blocks" }
        ]
      }
    ],
    timeline: [
      { time: "08:00 AM", action: "Breakfast: Toast bread, mash avocado, and assemble. (5 mins)" },
      { time: "01:00 PM", action: "Lunch: Drain chickpeas, chop vegetables, toss with cheese & vinaigrette. (10 mins)" },
      { time: "06:30 PM", action: "Preheat oven to 400°F. Mince garlic. (5 mins)" },
      { time: "06:40 PM", action: "Toss gnocchi, tomatoes, garlic, and oil on the sheet pan, nestle feta, and roast. (20 mins)" },
      { time: "07:00 PM", action: "Stir the sheet-pan dish to form a creamy sauce and serve. (2 mins)" }
    ],
    wasteTips: [
      { text: "Use the remaining cucumber and feta from lunch to garnish or snack on later." },
      { text: "Baking gnocchi directly from the package saves you from boiling water and washing a pot." }
    ],
    energyExplanation: "This plan focuses on high-yield, low-effort meals. Breakfast and lunch require zero active cooking, protecting your energy for work, while dinner uses a single sheet pan so you are not overwhelmed by dishes at the end of a long day."
  },
  medium: {
    planTitle: "Balanced Daily Fuel Plan",
    meals: [
      {
        type: "breakfast",
        name: "Protein-Packed Scrambled Eggs & Fruit",
        time: "10 mins",
        difficulty: "Easy",
        prepSteps: [
          "Crack and whisk 4 eggs with a splash of milk, salt, and pepper.",
          "Wash a handful of fresh berries."
        ],
        cookingSteps: [
          "Melt butter in a pan over medium-low heat.",
          "Pour eggs and cook, stirring slowly, until soft curds form. Serve alongside berries."
        ],
        tips: "Cooking eggs low and slow makes them incredibly creamy. Top with chopped chives if available."
      },
      {
        type: "lunch",
        name: "Warm Quinoa, Spinach & Goat Cheese Salad",
        time: "20 mins",
        difficulty: "Medium",
        prepSteps: [
          "Rinse 1/2 cup of quinoa.",
          "Wash and dry 2 cups of baby spinach."
        ],
        cookingSteps: [
          "Boil quinoa in 1 cup of water or vegetable broth for 15 minutes.",
          "While warm, toss quinoa with baby spinach (which will wilt slightly), goat cheese, toasted walnuts, and honey-mustard dressing."
        ],
        tips: "Make extra quinoa. It can be stored in the fridge for future dinners or quick bowls."
      },
      {
        type: "dinner",
        name: "Pan-Seared Lemon Herb Salmon with Asparagus",
        time: "25 mins",
        difficulty: "Medium",
        prepSteps: [
          "Pat salmon fillets dry and season with salt, pepper, and garlic powder.",
          "Trim the woody ends off a bunch of asparagus."
        ],
        cookingSteps: [
          "Heat olive oil in a skillet. Sear salmon skin-side down for 4-5 minutes, flip, and cook 3-4 minutes more. Squeeze lemon juice over.",
          "In a separate pan, sauté asparagus with garlic and olive oil until bright green and slightly tender (5-6 minutes)."
        ],
        tips: "Salmon is rich in Omega-3 fatty acids, which promotes brain function and helps restore mental stamina after a productive day."
      }
    ],
    groceryList: [
      {
        category: "Produce",
        items: [
          { name: "Fresh berries", amount: "1 basket" },
          { name: "Baby spinach", amount: "1 bag" },
          { name: "Asparagus", amount: "1 bunch" },
          { name: "Lemon", amount: "2" }
        ]
      },
      {
        category: "Proteins",
        items: [
          { name: "Eggs", amount: "1 dozen" },
          { name: "Salmon fillets", amount: "2 portions" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { name: "Quinoa", amount: "1 bag" },
          { name: "Walnuts", amount: "1 pack" },
          { name: "Honey-mustard dressing", amount: "1 bottle" }
        ]
      },
      {
        category: "Dairy",
        items: [
          { name: "Goat cheese", amount: "1 roll" },
          { name: "Butter & Milk", amount: "On hand" }
        ]
      }
    ],
    timeline: [
      { time: "07:30 AM", action: "Whisk eggs. Scramble slowly in butter and wash fresh berries for breakfast. (10 mins)" },
      { time: "12:15 PM", action: "Start quinoa cooking. While it boils, wash spinach and crumble goat cheese. (15 mins)" },
      { time: "12:30 PM", action: "Combine warm quinoa with spinach and dressing. Eat lunch. (5 mins)" },
      { time: "06:45 PM", action: "Prep salmon and trim asparagus stalks. (8 mins)" },
      { time: "06:53 PM", action: "Sauté asparagus in one pan while pan-searing salmon in the skillet. (10 mins)" },
      { time: "07:05 PM", action: "Plate salmon and asparagus, squeeze fresh lemon juice, and serve. (2 mins)" }
    ],
    wasteTips: [
      { text: "Leftover quinoa can be frozen or mixed with leftover eggs for a quick fried-rice styled breakfast tomorrow." },
      { text: "Use salmon skin-on for extra flavor and nutrients. Searing skin-side down first keeps the flesh moist." }
    ],
    energyExplanation: "This plan distributes cooking tasks evenly. A quick high-protein breakfast fuels your morning, lunch uses a single grain cooker, and dinner involves active pan-searing to create a satisfying, restaurant-quality meal when you have moderate evening energy."
  },
  high: {
    planTitle: "Gourmet Culinary Exploration Plan",
    meals: [
      {
        type: "breakfast",
        name: "Classic French Omelette with Herb Salad",
        time: "15 mins",
        difficulty: "Medium",
        prepSteps: [
          "Whisk 3 eggs with salt, pepper, and finely chopped parsley and chives.",
          "Toss mixed greens with oil and vinegar."
        ],
        cookingSteps: [
          "Heat butter in a non-stick pan. Pour in eggs, shake pan rapidly while stirring with a fork to form fine curds.",
          "Smooth the eggs down, tilt the pan, and roll the omelette into a cylinder. Plate with salad."
        ],
        tips: "The secret is low heat and constant movement. A perfectly cooked omelette is pale yellow and creamy inside."
      },
      {
        type: "lunch",
        name: "Crispy Pan-Fried Tofu with Peanut Soba Noodles",
        time: "30 mins",
        difficulty: "Medium",
        prepSteps: [
          "Press block of extra-firm tofu to remove water; cut into cubes.",
          "Whisk peanut butter, soy sauce, maple syrup, sesame oil, and warm water for dressing.",
          "Slice green onions and carrots."
        ],
        cookingSteps: [
          "Boil soba noodles for 4-5 minutes, drain and rinse under cold water.",
          "Coat tofu in cornstarch and pan-fry in oil until crispy on all sides (8-10 minutes).",
          "Toss noodles, carrots, and peanut sauce together. Top with crispy tofu and green onions."
        ],
        tips: "Pressing the tofu is essential. The drier the tofu, the crispier it will get when fried."
      },
      {
        type: "dinner",
        name: "Slow-Simmered Tomato Basil Risotto",
        time: "45 mins",
        difficulty: "Hard",
        prepSteps: [
          "Warm 4 cups of vegetable stock in a pot.",
          "Finely dice 1 shallot and 2 cloves of garlic.",
          "Chop a handful of fresh basil."
        ],
        cookingSteps: [
          "Sauté shallot and garlic in olive oil in a deep pan. Add 1 cup of Arborio rice, stirring until translucent.",
          "Add 1/2 cup of dry white wine, letting it absorb completely.",
          "Add warm stock, one ladle at a time, stirring constantly until absorbed. Continue for 20 minutes until rice is creamy and al dente.",
          "Stir in canned crushed tomatoes, butter, grated parmesan, and basil. Let rest for 2 minutes."
        ],
        tips: "Risotto requires your full attention and constant stirring, which is a wonderful therapeutic exercise when you have the time and energy."
      }
    ],
    groceryList: [
      {
        category: "Produce",
        items: [
          { name: "Fresh herbs (parsley, chives)", amount: "1 bunch" },
          { name: "Mixed greens", amount: "1 bag" },
          { name: "Green onions & carrots", amount: "1 bunch each" },
          { name: "Shallot & Garlic", amount: "1 bag" },
          { name: "Fresh basil", amount: "1 bunch" }
        ]
      },
      {
        category: "Proteins",
        items: [
          { name: "Eggs", amount: "1 dozen" },
          { name: "Extra-firm tofu", amount: "1 block" }
        ]
      },
      {
        category: "Pantry",
        items: [
          { name: "Soba noodles", amount: "1 pack" },
          { name: "Peanut butter", amount: "1 jar" },
          { name: "Arborio rice", amount: "1 bag" },
          { name: "Vegetable stock", amount: "1 carton" },
          { name: "Dry white wine", amount: "1 bottle" },
          { name: "Canned crushed tomatoes", amount: "1 can" }
        ]
      },
      {
        category: "Dairy",
        items: [
          { name: "Parmesan cheese", amount: "1 wedge" },
          { name: "Butter", amount: "On hand" }
        ]
      }
    ],
    timeline: [
      { time: "08:00 AM", action: "Chop herbs. Whisk eggs, cook the French omelette, and toss the morning salad. (15 mins)" },
      { time: "12:00 PM", action: "Press tofu to drain. While it drains, whisk the peanut butter sauce. (10 mins)" },
      { time: "12:10 PM", action: "Boil water for soba noodles. Cook noodles. Pan-fry tofu until crispy. (15 mins)" },
      { time: "12:25 PM", action: "Drain noodles, toss with sauce, plate with veggies and tofu. (5 mins)" },
      { time: "06:00 PM", action: "Heat stock on the stove. Dice shallot and garlic. Gather risotto ingredients. (10 mins)" },
      { time: "06:10 PM", action: "Sauté aromatics, toast Arborio rice, and add wine. (5 mins)" },
      { time: "06:15 PM", action: "Stir risotto continuously, adding stock ladle-by-ladle for 20 minutes. (20 mins)" },
      { time: "06:35 PM", action: "Fold in crushed tomatoes, butter, parmesan, and basil. Let rest and plate. (10 mins)" }
    ],
    wasteTips: [
      { text: "Use the leftover white wine from dinner to drink alongside the risotto." },
      { text: "Tofu water pressed out can be composted. Soba noodle cooking water can be used to thin the peanut sauce if it gets too thick." }
    ],
    energyExplanation: "This plan is designed for culinary enthusiasts with high energy. You'll practice advanced techniques: temperature-controlled omelette rolling, cornstarch pan-frying, and hot-stock risotto absorption."
  }
};

/**
 * Generate a cooking plan based on the inputs.
 * Uses either local mock database or fetches from Gemini API.
 */
export async function generateCookingPlan(apiKey, inputData, useMockMode) {
  // If mock mode is forced, or no key is present, use our mock system
  if (useMockMode || !apiKey) {
    // Artificial delay to simulate processing and show the loading animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Choose mock based on energy level
    const energy = inputData.energy || 'medium';
    const plan = JSON.parse(JSON.stringify(MOCK_PLANS[energy] || MOCK_PLANS.medium));
    
    // Customize portion sizes and diets in the mock responses to feel responsive
    if (inputData.portions) {
      plan.planTitle += ` (${inputData.portions})`;
    }
    if (inputData.diet && inputData.diet !== 'none') {
      plan.planTitle = `${inputData.diet.toUpperCase()} - ${plan.planTitle}`;
    }
    return plan;
  }

  // Live API Mode
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are PrepDay AI, an expert chef and schedule strategist. Generate a daily cooking to-do plan based on the user's details:
Schedule/Vibe: ${inputData.dayDescription}
Energy Level: ${inputData.energy}
Dietary Preference: ${inputData.diet}
Portions: ${inputData.portions}
Ingredients to use up: ${inputData.fridgeIngredients || 'None'}

Provide structured, realistic recipes that can be completed within the schedule. Create a comprehensive response strictly following the JSON schema constraints.`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              planTitle: { type: "STRING" },
              meals: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    type: { type: "STRING", enum: ["breakfast", "lunch", "dinner"] },
                    name: { type: "STRING" },
                    time: { type: "STRING" },
                    difficulty: { type: "STRING", enum: ["Easy", "Medium", "Hard"] },
                    prepSteps: { type: "ARRAY", items: { type: "STRING" } },
                    cookingSteps: { type: "ARRAY", items: { type: "STRING" } },
                    tips: { type: "STRING" }
                  },
                  required: ["type", "name", "time", "difficulty", "prepSteps", "cookingSteps", "tips"]
                }
              },
              groceryList: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    category: { type: "STRING" },
                    items: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          amount: { type: "STRING" }
                        },
                        required: ["name", "amount"]
                      }
                    }
                  },
                  required: ["category", "items"]
                }
              },
              timeline: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    time: { type: "STRING" },
                    action: { type: "STRING" }
                  },
                  required: ["time", "action"]
                }
              },
              wasteTips: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    text: { type: "STRING" }
                  },
                  required: ["text"]
                }
              },
              energyExplanation: { type: "STRING" }
            },
            required: ["planTitle", "meals", "groceryList", "timeline", "wasteTips", "energyExplanation"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the generated text inside candidates
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const jsonText = data.candidates[0].content.parts[0].text;
      return JSON.parse(jsonText);
    } else {
      throw new Error("Invalid response format received from Gemini API.");
    }
  } catch (error) {
    console.error("API Error details:", error);
    throw error;
  }
}
