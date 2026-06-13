// Local AI Agent Integration Service
// Handles generation for Recipes, DIY Projects, and Chat Assistant via Ollama or Mock Fallback.

const CHAT_MODEL_HINTS = ['llama', 'mistral', 'phi', 'gemma', 'qwen', 'deepseek', 'vicuna', 'neural', 'openchat', 'dolphin', 'tinyllama'];

export const aiService = {
  selectedModel: 'llama3.1:70b',
  ollamaUrl: '/api/ollama',
  availableModels: [],
  isConnected: false,

  setSelectedModel(model) {
    this.selectedModel = model;
  },

  setOllamaUrl(url) {
    this.ollamaUrl = url;
  },

  pickBestChatModel(models = []) {
    if (!models.length) return 'llama3.1:70b';

    const scored = models.map((name) => {
      const lower = name.toLowerCase();
      let score = 0;

      if (CHAT_MODEL_HINTS.some((hint) => lower.includes(hint))) score += 30;
      if (/llama3\.3|llama3\.2|llama3\.1|qwen3|qwen2\.5|deepseek|mistral|gemma3/.test(lower)) score += 20;
      if (/70b|72b/.test(lower)) score += 40;
      else if (/32b|34b/.test(lower)) score += 34;
      else if (/14b|13b/.test(lower)) score += 26;
      else if (/8b|9b|7b/.test(lower)) score += 20;
      else if (/3b|1b|tiny|mini/.test(lower)) score -= 10;
      if (/embed|embedding|clip|vision|moondream/.test(lower)) score -= 100;

      return { name, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.name || models[0] || 'llama3.1:70b';
  },

  getChatModel() {
    if (this.selectedModel) {
      return this.selectedModel;
    }
    return this.pickBestChatModel(this.availableModels);
  },

  getLanguagePrompt() {
    const lang = localStorage.getItem('appLanguage') || 'en';
    const names = { en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil' };
    const langName = names[lang] || 'English';
    if (lang === 'en') return '';
    return `\n\n[CRITICAL LANGUAGE INSTRUCTION] You MUST respond entirely in ${langName}. Every word, label, list item, and JSON string value MUST be in ${langName}. Do NOT use English anywhere in your response. Translate all content completely into ${langName} before responding.`;
  },

  async checkOllamaStatus() {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API tags returned status ${response.status}`);
      }
      const data = await response.json();

      this.isConnected = true;
      this.availableModels = data.models ? data.models.map((m) => m.name) : [];

      this.selectedModel = this.pickBestChatModel(this.availableModels);

      return { isConnected: true, models: this.availableModels, selectedModel: this.selectedModel };
    } catch (error) {
      console.warn('Local Ollama connection failed. Falling back to mock AI service.', error);
      this.isConnected = false;
      this.availableModels = [];
      return { isConnected: false, models: [], selectedModel: this.selectedModel };
    }
  },

  // Vision models removed as per user request to optimize for local performance

  /**
   * Recipe generator from ingredients.
   */
  async generateRecipe(ingredientsText) {
    if (!this.isConnected) {
      return this._generateRecipeMock(ingredientsText);
    }
    return this._callRecipeGeneration(`Ingredients available: ${ingredientsText}\n\nCreate the best possible recipe using these ingredients. Be creative and add chef-level techniques.`);
  },

  /**
   * Recipe generator from dish name only — AI infers everything.
   */
  async generateRecipeByName(dishName) {
    if (!this.isConnected) {
      return this._generateRecipeMock(dishName);
    }
    return this._callRecipeGeneration(`The user wants to make: "${dishName}"\n\nGenerate a complete, authentic, restaurant-quality recipe for this dish. Infer all the necessary ingredients with precise quantities. Be creative and thorough.`);
  },

  async _callRecipeGeneration(userPrompt) {
    try {
      const systemPrompt = `You are a world-class chef AI assistant named "Creaforge Chef". You create EXCEPTIONAL, restaurant-quality recipes that are detailed, creative, and practical.

For each recipe, provide ultra-detailed instructions. Each instruction step must:
- Start with a bold action verb (e.g., **Prep:**, **Sauté:**, **Plate:**)
- Include precise temperatures (°C and °F) and exact timing
- On a new line, include a *Pro Tip:* or *Science behind it:* or *Chef's Note:* with insider knowledge
- Be written for both beginners (clear) and experienced cooks (depth)

You must respond with a JSON object strictly matching this schema:
{
  "title": "Creative Recipe Name",
  "prepTime": "e.g. 15 mins",
  "cookTime": "e.g. 25 mins",
  "totalTime": "e.g. 40 mins",
  "servings": 4,
  "ingredients": ["**200g** ingredient — why this quantity and what it contributes", "**2 tbsp** ingredient"],
  "instructions": ["**Prep:** Full detailed step.\n\n*Pro Tip:* Insider advice here.", "**Sauté:** Next step details.\n\n*Chef's Note:* Note here."],
  "nutrition": {
    "carbs": "Xg",
    "protein": "Xg",
    "fats": "Xg",
    "healthScore": 85
  },
  "healthClassification": "Healthy or Indulgent or Balanced",
  "youtubeSearchQuery": "specific dish name recipe tutorial step by step"
}
Ensure the JSON is perfectly valid. Provide 5–8 detailed instruction steps minimum. Output ONLY the JSON, no explanation.${this.getLanguagePrompt()}`;

      const payload = {
        model: this.selectedModel,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        format: 'json'
      };

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Ollama returned status ${response.status}`);
      const data = await response.json();
      return this._parseOllamaJson(data.response);
    } catch (e) {
      console.error('Ollama generateRecipe failed, falling back to mock:', e);
      return this._generateRecipeMock(userPrompt);
    }
  },

  /**
   * DIY project generator from materials & tools.
   */
  async generateDIYProject(materialsText, toolsArray) {
    if (!this.isConnected) {
      return this._generateDIYProjectMock(materialsText, toolsArray);
    }
    const prompt = `Materials available: ${materialsText}\nTools available: ${toolsArray.join(', ')}\n\nDesign the most creative, functional project possible using ONLY these materials and tools. Include precise pro-level instructions.`;
    return this._callDIYGeneration(prompt);
  },

  /**
   * DIY project generator from project name only — AI infers everything.
   */
  async generateDIYProjectByName(projectName) {
    if (!this.isConnected) {
      return this._generateDIYProjectMock(projectName, []);
    }
    const prompt = `The user wants to build: "${projectName}"\n\nGenerate a complete, detailed DIY project blueprint for this. Infer all necessary materials with quantities and recommend appropriate tools. Assume a home workshop setting. Make it practical and achievable.`;
    return this._callDIYGeneration(prompt);
  },

  async _callDIYGeneration(userPrompt) {
    try {
      const systemPrompt = `You are an expert DIY engineer and creative upcycling specialist named "Creaforge Builder". You design BRILLIANT, practical, professional-grade projects.

For each project, provide ultra-detailed instructions. Each instruction step must:
- Start with a bold action verb (e.g., **Plan:**, **Cut:**, **Assemble:**, **Finish:**)
- Include precise measurements, angles, and timings
- On a new line, include a *Pro Tip:* or *Why this matters:* or *Common mistake:* with expert knowledge
- Be written for both beginners (clear safety notes) and experienced makers (depth of technique)

You must respond with a JSON object strictly matching this schema:
{
  "title": "Specific Creative Project Name",
  "difficulty": "Easy, Intermediate, or Advanced",
  "estimatedTime": "e.g. 2–3 Hours",
  "dimensions": "e.g. 30cm × 20cm × 15cm",
  "materialsRequired": ["**Material name:** Quantity and specifications — why it is used"],
  "toolsUsed": ["Tool name"],
  "instructions": ["**Step Title:** Full detailed explanation with measurements and timing.\n\n*Pro Tip:* Expert insight here.", "**Next Step:** Details.\n\n*Why this matters:* Explanation."],
  "safetyGuidelines": ["**Hazard type:** Specific risk and mitigation strategy."],
  "youtubeSearchQuery": "specific project name DIY build tutorial step by step"
}
Ensure the JSON is perfectly valid. Provide 5–7 detailed instruction steps minimum. Output ONLY the JSON, no explanation.${this.getLanguagePrompt()}`;

      const payload = {
        model: this.selectedModel,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        format: 'json'
      };

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Ollama returned status ${response.status}`);
      const data = await response.json();
      return this._parseOllamaJson(data.response);
    } catch (e) {
      console.error('Ollama generateDIYProject failed, falling back to mock:', e);
      return this._generateDIYProjectMock(userPrompt, []);
    }
  },

  /**
   * Contextual chatbot assistant handler.
   */
  async getChatResponse(userMessage, chatHistory, activeModule, currentContext) {
    if (!this.isConnected) {
      return this._getChatResponseMock(userMessage, chatHistory, activeModule, currentContext);
    }

    try {
      const messages = [];

      const basePersonality = `You are Creaforge Assistant — a brilliant, warm, and knowledgeable AI companion. You have deep expertise spanning culinary arts, engineering, science, history, technology, creative arts, and everyday life. You are the user's go-to for ANYTHING they want to know.

Core principles:
- Give RICH, detailed, genuinely helpful answers — never surface-level one-liners
- Be conversational, warm, and match the user's energy (casual banter or deep technical discussion)
- For cooking: think like a Michelin-star chef — exact temperatures, precise timing, the science of why things work
- For DIY/making: think like a professional engineer — precise measurements, material science, safety protocols
- For any other topic: be like a knowledgeable friend — informative, engaging, accurate
- Format beautifully: use **bold** for key terms, numbered lists for steps, clear paragraphs for explanations
- Always add one unexpected insight that makes the user think "I never knew that!"
- When someone asks HOW to make/do something, give the FULL step-by-step process with all details
- Be honest about uncertainty — then give your best reasoning
- When describing a recipe or project process, end with a line: [SUGGEST_VIDEOS: topic] so the UI can show a video suggestion button`;

      const qualityProtocol = `

Response quality protocol:
- For simple greetings or normal casual inputs, reply naturally and briefly.
- For factual questions, answer the question first, then add useful context. Do not force DIY or cooking framing unless the user asks for it.
- For how-to requests, provide a complete practical sequence with tools, checks, common mistakes, and a concise next step.
- For code requests, give the likely cause, the fix, and a small example when useful.
- If you are not sure, say what is uncertain and give the safest useful answer.
- Never invent exact current events, prices, laws, live schedules, or medical/legal/financial certainty. Tell the user when live verification would be needed.
- Keep the tone premium, organized, and confident: clear headings, short paragraphs, and no filler.`;

      let systemPrompt = '';
      if (activeModule === 'recipe') {
        systemPrompt = `${basePersonality}

You are currently in Creaforge's Recipe Maker context.
Current pantry ingredients: ${currentContext.ingredientsText || 'Not yet specified — ask what they have available'}.
Active recipe being cooked: ${currentContext.activeRecipe ? currentContext.activeRecipe.title : 'None started yet'}.

For cooking questions: provide precise temperatures (°C/°F), timings, and chef-level technique. When suggesting substitutions, explain WHY the swap works chemically or texturally. For nutrition questions, give specific numbers. Always offer a follow-up suggestion.`;
      } else if (activeModule === 'thing') {
        systemPrompt = `${basePersonality}

You are currently in Creaforge's Thing Maker workshop context.
Available materials: ${currentContext.materialsText || 'Not yet specified — ask what they have'}.
Active project: ${currentContext.activeProject ? currentContext.activeProject.title : 'None started yet'}.

For building questions: provide specific measurements, joint techniques, adhesive curing times, and finishing methods. When addressing safety, be specific about the exact risk and mitigation.`;
      } else {
        systemPrompt = `${basePersonality}

You have NO restrictions on topic. The user can ask you ANYTHING — recipes, DIY projects, science, math, history, coding, philosophy, entertainment, health, travel, or casual conversation. Be the most helpful, engaging, and knowledgeable assistant possible. Never refuse a reasonable question. If someone asks how to make something (food, a device, art), give them the complete process. If they want to chat, be charming and fun.`;
      }

      systemPrompt += qualityProtocol;
      systemPrompt += this.getLanguagePrompt();

      messages.push({ role: 'system', content: systemPrompt });

      const recentHistory = chatHistory.filter(m => m.id !== 'welcome').slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      messages.push({ role: 'user', content: userMessage });

      const payload = {
        model: this.getChatModel(),
        messages: messages,
        stream: false,
        options: { temperature: 0.45, num_ctx: 8192, num_predict: 3072, top_p: 0.9, repeat_penalty: 1.08 },
      };

      const response = await fetch(`${this.ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Ollama chat returned status ${response.status}`);
      }

      const data = await response.json();
      return data.message.content.trim();
    } catch (e) {
      console.error("Ollama chat failed, falling back to mock:", e);
      return this._getChatResponseMock(userMessage, chatHistory, activeModule, currentContext);
    }
  },

  _parseOllamaJson(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn("Direct JSON parsing failed, attempting extraction:", e);
    }

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const cleaned = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        console.warn("Extracted JSON parsing failed:", e);
      }
    }

    throw new Error("Invalid response structure from local AI model");
  },

  // Private Mock Fallbacks

  async _generateRecipeMock(ingredientsText) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = ingredientsText.split(',').map(s => s.trim()).filter(Boolean);
        const mainIng = list[0] || 'Mixed Veggies';
        const capMain = mainIng.charAt(0).toUpperCase() + mainIng.slice(1);
        
        let title = `Sautéed Garlic & Herb ${capMain}`;
        let healthClassification = 'Healthy';
        let healthScore = 85;
        let prepTime = '10 mins';
        let cookTime = '15 mins';

        const lowerMain = mainIng.toLowerCase();
        if (lowerMain.includes('pasta') || lowerMain.includes('spaghetti') || lowerMain.includes('noodle')) {
          title = `Gourmet Rustic Garlic ${capMain}`;
          healthClassification = 'Indulgent';
          healthScore = 72;
        } else if (lowerMain.includes('egg') || lowerMain.includes('omelet')) {
          title = `Fluffy Farmhouse ${capMain} Scramble`;
          prepTime = '5 mins';
          cookTime = '8 mins';
        } else if (lowerMain.includes('broccoli') || lowerMain.includes('salad') || lowerMain.includes('tofu')) {
          title = `Sesame-Glazed Crisp ${capMain} Stir-Fry`;
          healthScore = 95;
        } else if (lowerMain.includes('chicken') || lowerMain.includes('beef') || lowerMain.includes('meat')) {
          title = `Pan-Seared Savory ${capMain} Skillet`;
          cookTime = '20 mins';
          healthClassification = 'Healthy';
          healthScore = 80;
        }

        const ingredients = [
          ...list.map(i => `1-2 cups of ${i}`),
          "2 tbsp Olive oil or butter",
          "3 cloves Garlic (finced or minced)",
          "1/2 tsp Salt & Pepper to taste",
          "Fresh herbs (parsley or basil) for garnish"
        ];

        const instructions = [
          `**Prep:** Thoroughly rinse and prep your ${list.join(', ') || 'ingredients'}. Pat them dry — excess moisture steams rather than sautés. Cut into uniform pieces so everything cooks evenly.`,
          `**Aromatics:** Heat olive oil in a heavy-bottomed skillet over medium heat. Add minced garlic and cook for exactly 60 seconds, stirring constantly, until golden (not brown — bitterness alert!).`,
          `**Main cook:** Add ${list.slice(0, 3).join(', ') || 'the prepared ingredients'} to the pan. Season immediately with salt. Cook ${list.some(i => i.match(/chicken|meat|beef/i)) ? '8–12 minutes' : '5–8 minutes'}, tossing every 2 minutes for even caramelisation.`,
          `**Season:** Taste and adjust — add a squeeze of lemon juice for brightness, extra salt, or a pinch of chilli flakes for heat. Professional chefs always taste before plating.`,
          `**Plate:** Arrange on a warmed plate, drizzle with extra-virgin olive oil, scatter fresh herbs, and serve immediately. Enjoy!`
        ];

        resolve({
          title,
          prepTime,
          cookTime,
          totalTime: `${parseInt(prepTime) + parseInt(cookTime)} mins`,
          servings: 2,
          ingredients,
          instructions,
          nutrition: {
            carbs: healthClassification === 'Indulgent' ? '45g' : '15g',
            protein: lowerMain.includes('chicken') || lowerMain.includes('beef') || lowerMain.includes('egg') || lowerMain.includes('tofu') ? '24g' : '6g',
            fats: '9g',
            healthScore
          },
          healthClassification,
          youtubeSearchQuery: `how to cook ${mainIng} easy delicious recipe`
        });
      }, 1500);
    });
  },

  async _generateDIYProjectMock(materialsText, toolsArray) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mats = materialsText.split(',').map(s => s.trim()).filter(Boolean);
        const mainMat = mats[0] || 'Cardboard Scrap';
        const capMat = mainMat.charAt(0).toUpperCase() + mainMat.slice(1);
        const toolsUsed = toolsArray.length > 0 ? toolsArray.slice(0, 4) : ["Scissors", "Glue or Tape"];

        let title = `Upcycled ${capMat} Organizer`;
        let difficulty = 'Easy';
        let estimatedTime = '45 mins';
        let dimensions = '20cm x 15cm x 10cm';

        const lowerMat = mainMat.toLowerCase();
        if (lowerMat.includes('box') || lowerMat.includes('cardboard')) {
          title = `Multipurpose ${capMat} Desk Organizer`;
          estimatedTime = '1 hour';
          dimensions = '25cm x 18cm x 12cm';
        } else if (lowerMat.includes('bottle') || lowerMat.includes('plastic')) {
          title = `Self-Watering ${capMat} Planter`;
          difficulty = 'Easy';
          dimensions = '12cm diameter x 20cm height';
        } else if (lowerMat.includes('wood') || lowerMat.includes('pallet')) {
          title = `Rustic Upcycled ${capMat} Wall Shelf`;
          difficulty = toolsArray.includes('Handsaw') || toolsArray.includes('Hammer') ? 'Medium' : 'Easy';
          estimatedTime = '2 hours';
          dimensions = '40cm x 15cm x 15cm';
        }

        const materialsRequired = [
          ...mats.map(m => `Used ${m}`),
          "Adhesive or joining agent (glue/tape as selected)",
          "Decorative paper, paints, or markers"
        ];

        const safetyGuidelines = [
          "Always work on a stable, flat surface.",
          toolsArray.includes('Utility Knife') || toolsArray.includes('Scissors') ? "Be careful when cutting tough materials; always slice away from your body." : null,
          toolsArray.includes('Glue Gun') ? "Avoid touching the hot nozzle of the glue gun to prevent skin burns." : null
        ].filter(Boolean);

        const instructions = [
          `**Plan & Prep:** Gather all your ${mats.join(', ')}. Clean off any labels, dirt, or residue. Sketch a quick plan on paper — measure twice, cut once. Arrange your workspace with a cutting mat or old newspaper as protection.`,
          `**Measure & Mark:** Using a ruler, mark all cut lines clearly with a pencil. For ${mainMat}, measure to the nearest mm for clean results. Label each piece (A, B, C) to avoid confusion during assembly.`,
          toolsArray.includes('Scissors') || toolsArray.includes('Utility Knife') || toolsArray.includes('Handsaw')
            ? `**Cut:** Using your ${toolsArray.find(t => ['Scissors','Utility Knife','Handsaw'].includes(t)) || 'cutting tool'}, cut along the marked lines with steady, controlled strokes. For straight cuts, clamp a ruler as a guide. Always cut away from your body.`
            : `**Shape:** Carefully fold or score the ${mainMat} along the lines. Score lightly first, then fold — this gives a precise, professional edge.`,
          toolsArray.includes('Glue Gun') || toolsArray.includes('Wood Glue') || toolsArray.includes('Duct Tape')
            ? `**Assemble:** Apply ${toolsArray.find(t => ['Glue Gun','Wood Glue','Duct Tape'].includes(t)) || 'adhesive'} to the joining surfaces. Hold each joint for 30 seconds of firm pressure. Let fully cure before stressing the joint (glue gun: 5 min, wood glue: 30 min).`
            : `**Assemble:** Interlock the pieces using your structural method. Test the fit dry first before committing with any adhesive.`,
          `**Finish:** Sand any rough edges with fine-grit sandpaper for a professional feel. Apply 2 coats of acrylic paint or decorative paper to the exterior, letting each coat dry fully. Display your creation with pride!`
        ];

        resolve({
          title,
          difficulty,
          estimatedTime,
          dimensions,
          materialsRequired,
          toolsUsed,
          instructions,
          safetyGuidelines,
          youtubeSearchQuery: `how to build upcycled ${mainMat} desk organizer craft tutorial`
        });
      }, 1500);
    });
  },

  _casualChatResponse(msg) {
    const lower = msg.toLowerCase().trim();

    if (/^(hi|hello|hey|yo|sup|good morning|good evening|good afternoon)\b/.test(lower)) {
      return "Hey there! Great to see you. I'm here to help with recipes, DIY projects, or just a good chat. What's on your mind today?";
    }
    if (/how are you|how's it going|what's up/.test(lower)) {
      return "I'm doing great, thanks for asking! My gears are well-oiled and I'm ready to help. How are you doing? Working on anything fun — a recipe, a build, or just exploring ideas?";
    }
    if (/^(thanks|thank you|thx|ty)\b/.test(lower)) {
      return "You're very welcome! Happy to help anytime. Let me know if there's anything else you'd like to explore.";
    }
    if (/joke|funny|make me laugh/.test(lower)) {
      return "Why did the inventor bring a ladder to the kitchen? They heard the recipe called for high spirits! 😄\n\nWant another one, or shall we get back to creating something?";
    }
    if (/who are you|what are you|what can you do/.test(lower)) {
      return "I'm Creaforge Assistant — your creative sidekick for DIY projects, cooking, and brainstorming. I can help you design upcycling projects, craft recipes from ingredients, swap substitutions, explain techniques, or just chat. What would you like to try?";
    }
    if (/bye|goodbye|see you|later/.test(lower)) {
      return "Take care! Come back anytime you're ready to create something amazing. Happy making! 👋";
    }
    if (/surprise me/.test(lower)) {
      return "Here's a fun idea: turn an old glass jar into a self-watering herb planter — punch a hole in the lid, thread a cotton wick through, and nest it upside-down in a water reservoir. For the kitchen side, try a 15-minute garlic-butter pasta with whatever veggies you have on hand!\n\nWant me to flesh out either of those?";
    }
    return null;
  },

  async _legacyChatResponseMock(userMessage, chatHistory, activeModule, currentContext) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowercaseMsg = userMessage.toLowerCase();

        const casual = this._casualChatResponse(userMessage);
        if (casual && activeModule !== 'recipe' && activeModule !== 'thing') {
          resolve(casual);
          return;
        }
        if (casual && !lowercaseMsg.includes('substitute') && !lowercaseMsg.includes('safety') && !lowercaseMsg.includes('glue')) {
          resolve(casual);
          return;
        }

        if (activeModule === 'recipe') {
          if (lowercaseMsg.includes('substitute') || lowercaseMsg.includes('replace') || lowercaseMsg.includes('instead') || lowercaseMsg.includes('swap')) {
            resolve(`Here are some useful kitchen substitutions for common ingredients:
• Eggs: Use 1/4 cup of unsweetened applesauce, mashed banana, or yogurt.
• Butter: Swap with coconut oil, olive oil, or avocado oil (1:1 ratio).
• Milk: Replace with almond milk, oat milk, or soy milk.
• Soy Sauce: Use tamari, coconut aminos, or Worcester sauce.
Let me know if you need a specific replacement!`);
            return;
          }
          if (lowercaseMsg.includes('gluten') || lowercaseMsg.includes('celiac') || lowercaseMsg.includes('wheat') || lowercaseMsg.includes('allergy')) {
            resolve(`To make this dish 100% gluten-free:
• Replace any wheat-based pasta with brown rice pasta, chickpea pasta, or zucchini noodles.
• Double-check that your soy sauce is swapped with certified Gluten-Free Tamari or Coconut Aminos.
• Ensure any thickening agents (like flour) are substituted with cornstarch or arrowroot powder.`);
            return;
          }
          if (lowercaseMsg.includes('vegan') || lowercaseMsg.includes('vegetarian') || lowercaseMsg.includes('meatless') || lowercaseMsg.includes('dairy')) {
            resolve(`Adapting this recipe for a plant-based diet:
• Swap butter with olive oil or plant-based vegan butter.
• Swap milk or cream with coconut cream or cashew milk.
• Replace animal proteins with extra firm tofu, tempeh, canned chickpeas, or mushrooms.
Let me know if you want detailed seasoning tips for tofu!`);
            return;
          }
          
          const ingList = currentContext.ingredientsText || 'your ingredients';
          resolve(`That's a great question! When preparing meals with ${ingList}, remember that controlling heat is key. For example, sautéing garlic on medium-low heat keeps it sweet, whereas high heat will burn it and make it bitter. 

What other kitchen techniques or cooking times can I clarify for you?`);
        } else {
          if (lowercaseMsg.includes('safety') || lowercaseMsg.includes('protect') || lowercaseMsg.includes('harm') || lowercaseMsg.includes('danger')) {
            resolve(`Safety first! Here are essential guidelines:
• Scissors / Utility Knives: Always slice away from your body and keep fingers clear of the cutting line.
• Hot Glue Guns: Never touch the nozzle. Keep a cup of cold water nearby in case of accidental skin contact.
• Wood dust: Work in a well-ventilated area or wear a dust mask if sanding down pallet wood.`);
            return;
          }
          if (lowercaseMsg.includes('glue') || lowercaseMsg.includes('adhes') || lowercaseMsg.includes('stick') || lowercaseMsg.includes('tape')) {
            resolve(`Adhesive Guide for DIY Upcycling:
• Cardboard & Paper: Hot Glue (fast, strong) or School PVA Glue (slower but clean).
• Plastics & Cans: Hot Glue or heavy-duty mounting tape.
• Wood pallets: Wood Glue (requires clamping for 30 mins to cure).
• Quick assembly: Duct Tape or double-sided carpet tape.`);
            return;
          }
          if (lowercaseMsg.includes('paint') || lowercaseMsg.includes('color') || lowercaseMsg.includes('decor')) {
            resolve(`Finishing tips for scraps:
• Cardboard: Use acrylic paint with minimal water to prevent warping, or wrap with wrapping paper.
• Plastics: Sand the plastic surface slightly with fine sandpaper first so that paint adheres better.
• Wood: Acrylic paint works well, or rub with vegetable oil/beeswax for a natural polished look.`);
            return;
          }

          const matList = currentContext.materialsText || 'your materials';
          resolve(`Happy to help you build with ${matList}! A few quick tips that make a big difference:

• Sketch your design on paper before cutting — measure twice, cut once.
• Sand rough edges for a cleaner finish and safer handling.
• Test your joints with tape before committing with glue.

What would you like to dive into — cutting, assembly, decorating, or a full project idea?`);
        }
      }, 600);
    });
  },

  _hasAny(text, terms) {
    return terms.some((term) => text.includes(term));
  },

  _topicFromMessage(message) {
    const cleaned = message
      .toLowerCase()
      .replace(/^(please\s+)?(can you|could you|would you|tell me|explain|what is|what are|how do i|how to|give me|make me|write|draft)\s+/i, '')
      .replace(/[?!.,;:]+$/g, '')
      .trim();

    return cleaned || 'that topic';
  },

  _knownFactResponse(lowercaseMsg) {
    if (/capital\s+of\s+france/.test(lowercaseMsg)) {
      return "**Paris** is the capital of France.\n\nA useful extra detail: Paris is also France's largest city and a major center for art, fashion, food, and government.";
    }

    if (/capital\s+of\s+india/.test(lowercaseMsg)) {
      return "**New Delhi** is the capital of India.\n\nIt sits inside the larger National Capital Territory of Delhi, which is why people sometimes casually say \"Delhi\" when they mean the capital region.";
    }

    if (/current\s+time|what\s+time\s+is\s+it|today'?s?\s+date|what\s+date\s+is\s+it/.test(lowercaseMsg)) {
      const now = new Date();
      return `Your device reports **${now.toLocaleString()}**.\n\nIf you need an exact time for another city or timezone, tell me the place and I will format it clearly.`;
    }

    return null;
  },

  _conceptResponse(message, lowercaseMsg) {
    const concepts = [
      {
        pattern: /quantum\s+comput/,
        title: 'Quantum computing',
        plain: 'Quantum computing uses quantum bits, or qubits, which can represent more than one state while a calculation is being prepared. That lets certain algorithms explore patterns differently from ordinary computers.',
        analogy: 'A normal computer is like checking one path at a time. A quantum computer is more like setting up a wave pattern where wrong paths cancel out and useful paths become easier to measure.',
        matters: 'It could help with chemistry simulation, material design, optimization, and some cryptography problems.',
        caveat: 'It is not simply a faster laptop. Most everyday tasks are still better on classical computers.'
      },
      {
        pattern: /\b(ai|artificial intelligence|machine learning|ml)\b/,
        title: 'Artificial intelligence',
        plain: 'AI is software that learns patterns from data so it can classify, predict, generate, or recommend things without every rule being hand-coded.',
        analogy: 'Think of it like training an assistant with thousands or millions of examples until it learns the shape of good answers.',
        matters: 'It powers chatbots, search, image tools, recommendations, translation, fraud detection, and automation.',
        caveat: 'AI can still be wrong, biased, or outdated, so important answers should be checked.'
      },
      {
        pattern: /blockchain|crypto\b|bitcoin/,
        title: 'Blockchain',
        plain: 'A blockchain is a shared ledger where transactions are grouped into blocks and linked together using cryptography.',
        analogy: 'It is like a notebook copied across many computers, where everyone can verify whether a page was changed.',
        matters: 'It is useful when people need a shared record without trusting one central owner.',
        caveat: 'It is not automatically cheaper, faster, or better than a normal database.'
      },
      {
        pattern: /photosynthesis/,
        title: 'Photosynthesis',
        plain: 'Photosynthesis is how plants use sunlight to turn carbon dioxide and water into sugar, releasing oxygen as a byproduct.',
        analogy: 'Leaves act like tiny solar-powered food factories.',
        matters: 'It feeds the plant, supports food chains, and produces much of the oxygen life depends on.',
        caveat: 'Plants still need nutrients, water, and the right temperature. Sunlight alone is not enough.'
      },
      {
        pattern: /gravity/,
        title: 'Gravity',
        plain: 'Gravity is the attraction between objects with mass. On Earth, it pulls objects toward the planet and gives them weight.',
        analogy: 'Imagine a stretched sheet dipping under a heavy ball. Smaller balls roll toward the dip. That picture is not perfect, but it helps explain how mass shapes motion.',
        matters: 'Gravity keeps planets in orbit, gives structure to galaxies, and affects time at very high precision.',
        caveat: `For everyday life Newton's laws work well; for extreme cases, Einstein's relativity is more accurate.`
      }
    ];

    const match = concepts.find((item) => item.pattern.test(lowercaseMsg));
    if (!match) return null;

    return `**${match.title}, simply**\n\n${match.plain}\n\n**Easy analogy:** ${match.analogy}\n\n**Why it matters:** ${match.matters}\n\n**Important nuance:** ${match.caveat}`;
  },

  _recipeFallback(message, lowercaseMsg, currentContext = {}) {
    if (this._hasAny(lowercaseMsg, ['substitute', 'replace', 'instead', 'swap'])) {
      return `**Smart substitution guide**\n\n1. **Eggs:** Use 1/4 cup yogurt, mashed banana, applesauce, or a flax egg per egg. Yogurt keeps things tender; flax adds binding.\n2. **Butter:** Use olive oil for savory dishes, coconut oil for rich bakes, or plant butter for a direct 1:1 swap.\n3. **Milk:** Use oat milk for body, soy milk for protein, or coconut milk for richness.\n4. **Cream:** Use cashew cream or coconut cream when you need thickness.\n\nTell me the exact ingredient and dish, and I can give the cleanest swap ratio.`;
    }

    if (this._hasAny(lowercaseMsg, ['gluten', 'celiac', 'wheat', 'allergy'])) {
      return `**Gluten-free adjustment**\n\n1. Replace wheat pasta or noodles with rice, corn, chickpea, millet, or zucchini noodles.\n2. Use tamari instead of soy sauce, and check spice blends for hidden wheat starch.\n3. Thicken sauces with cornstarch, arrowroot, or rice flour instead of wheat flour.\n4. Avoid cross-contact by using clean pans, boards, and strainers.\n\nFor medical allergies or celiac disease, use certified gluten-free ingredients.`;
    }

    if (this._hasAny(lowercaseMsg, ['vegan', 'vegetarian', 'meatless', 'dairy'])) {
      return `**Plant-based version**\n\n1. Swap dairy butter with olive oil or vegan butter.\n2. Replace cream with cashew cream, coconut cream, or blended silken tofu.\n3. Replace meat with tofu, tempeh, chickpeas, mushrooms, paneer-style tofu, or lentils.\n4. Add umami with soy sauce, miso, nutritional yeast, roasted garlic, or browned mushrooms.\n\nThe trick is not just replacing protein. You also need fat, salt, acidity, and browning for a full flavor profile.`;
    }

    const topic = this._topicFromMessage(message).replace(/^make\s+/, '');
    const pantry = currentContext.ingredientsText || topic || 'your ingredients';
    return `**Kitchen answer**\n\nFor **${pantry}**, start by controlling heat and moisture. Most home cooking improves immediately when you dry ingredients well, salt in stages, and avoid overcrowding the pan.\n\n1. **Prep:** Cut ingredients evenly so they cook at the same speed.\n2. **Heat:** Preheat the pan for 2-3 minutes. Add oil only after the pan is hot.\n3. **Cook:** Add ingredients in batches if needed. Let them brown before stirring too much.\n4. **Balance:** Finish with acidity, herbs, or a small knob of butter to round the flavor.\n5. **Taste:** Adjust salt at the end. This is where good food becomes great food.\n\n**Pro move:** If something tastes flat, it usually needs salt, acid, or aroma - not more spice.\n\n[SUGGEST_VIDEOS: ${topic} cooking technique]`;
  },

  _thingFallback(message, lowercaseMsg, currentContext = {}) {
    if (this._hasAny(lowercaseMsg, ['safety', 'protect', 'harm', 'danger'])) {
      return `**Workshop safety checklist**\n\n1. **Cutting:** Keep fingers outside the cut line and cut away from your body.\n2. **Dust:** Sand in ventilation and use a mask for wood, plastic, or painted surfaces.\n3. **Heat:** Keep glue-gun nozzles away from skin and let joints cool before loading them.\n4. **Stability:** Clamp pieces before drilling, sawing, or gluing.\n5. **Finish:** Let paint, glue, and sealers cure fully before indoor use.\n\nA safe build is not slower. It just has fewer expensive surprises.`;
    }

    if (this._hasAny(lowercaseMsg, ['glue', 'adhes', 'stick', 'tape', 'join'])) {
      return `**Adhesive guide**\n\n1. **Cardboard and paper:** PVA glue for clean work, hot glue for speed.\n2. **Plastic:** Roughen the surface first. Use epoxy, hot glue, or mounting tape depending on load.\n3. **Wood:** Wood glue is strongest when clamped for 30-60 minutes and cured overnight.\n4. **Metal:** Use two-part epoxy or mechanical fasteners.\n5. **Temporary layouts:** Painter's tape is excellent for testing before permanent joining.\n\n**Rule of thumb:** If the surface is glossy, roughen it before gluing. Adhesives need grip.`;
    }

    if (this._hasAny(lowercaseMsg, ['paint', 'color', 'decor', 'finish'])) {
      return `**Finishing plan**\n\n1. Clean the surface so dust and oil do not block adhesion.\n2. Lightly sand glossy plastic or rough wood.\n3. Use primer on plastic, metal, or dark surfaces.\n4. Apply 2-3 thin coats instead of one heavy coat.\n5. Seal with matte or satin clear coat if the piece will be handled often.\n\nThin coats look more premium because they preserve edges and texture.`;
    }

    const materials = currentContext.materialsText || this._topicFromMessage(message);
    return `**Build plan for ${materials}**\n\n1. **Define the purpose:** Decide what the object must hold, display, organize, or protect.\n2. **Sketch the shape:** Draw front, side, and top views before cutting anything.\n3. **Measure:** Mark every piece with a ruler and label matching parts.\n4. **Prototype:** Tape pieces together first. Fix proportions before glue or screws.\n5. **Assemble:** Join from the strongest structural points, then add decorative layers.\n6. **Finish:** Sand, paint, seal, and test weight before daily use.\n\n**Maker insight:** A simple object looks premium when its edges are straight, joins are hidden, and the finish is consistent.\n\n[SUGGEST_VIDEOS: DIY ${materials} project]`;
  },

  _codingFallback(message, lowercaseMsg) {
    const topic = this._topicFromMessage(message);
    if (this._hasAny(lowercaseMsg, ['error', 'bug', 'not working', 'fix'])) {
      return `**Debugging approach**\n\nFor **${topic}**, start with the smallest failing case.\n\n1. Reproduce the issue with one clear input.\n2. Read the exact error message and note the file/line.\n3. Check recent changes around that line.\n4. Add a log or breakpoint before the failure.\n5. Fix one cause, then rerun the same test.\n\nPaste the error text or the relevant code and I can help trace it directly.`;
    }

    return `**Coding help**\n\nI can help with **${topic}**. A clean solution usually needs three pieces:\n\n1. **Goal:** What should the code do?\n2. **Inputs and outputs:** What data comes in, and what should come out?\n3. **Constraints:** Browser, Node, database, framework, performance, or styling rules.\n\nSend the code or describe the feature, and I will turn it into a concrete implementation.`;
  },

  _healthFallback(lowercaseMsg) {
    if (this._hasAny(lowercaseMsg, ['breakfast', 'healthy breakfast'])) {
      return `**Healthy breakfast options**\n\n1. **Oats with fruit and nuts:** Slow carbs, fiber, and healthy fats.\n2. **Greek yogurt or curd bowl:** Add fruit, seeds, and a little honey for protein and probiotics.\n3. **Eggs with vegetables:** High protein, filling, and quick.\n4. **Besan chilla or moong dal chilla:** Great savory option with protein and fiber.\n5. **Idli with sambar:** Light, fermented, and balanced when paired with lentils.\n\nBest formula: **protein + fiber + color + water**. That keeps energy steadier than a sugar-heavy breakfast.`;
    }

    return `**General wellness guidance**\n\nAim for meals with protein, fiber-rich carbs, colorful vegetables or fruit, and a small amount of healthy fat. Sleep, hydration, and daily movement matter as much as the exact food list.\n\nFor medical conditions, medication, allergies, pregnancy, or symptoms, check with a qualified clinician.`;
  },

  _writingFallback(message) {
    const topic = this._topicFromMessage(message);
    return `**Draft structure for ${topic}**\n\n**Opening:** State the purpose clearly in one sentence.\n\n**Middle:** Add the key details: who, what, when, why, and what action is needed.\n\n**Close:** End with a simple next step or polite sign-off.\n\nIf you tell me the audience and tone - formal, friendly, premium, short, persuasive - I can write the finished version.`;
  },

  _generalFallback(message, lowercaseMsg) {
    const knownFact = this._knownFactResponse(lowercaseMsg);
    if (knownFact) return knownFact;

    const concept = this._conceptResponse(message, lowercaseMsg);
    if (concept) return concept;

    if (this._hasAny(lowercaseMsg, ['cook', 'recipe', 'food', 'meal', 'dish', 'breakfast', 'lunch', 'dinner', 'ramen', 'pasta'])) {
      if (this._hasAny(lowercaseMsg, ['healthy', 'healthiest', 'diet', 'nutrition'])) {
        return this._healthFallback(lowercaseMsg);
      }
      return this._recipeFallback(message, lowercaseMsg, {});
    }

    if (this._hasAny(lowercaseMsg, ['diy', 'build', 'make a', 'make an', 'craft', 'repair', 'fix', 'wood', 'paint', 'faucet', 'leaky'])) {
      return this._thingFallback(message, lowercaseMsg, {});
    }

    if (this._hasAny(lowercaseMsg, ['code', 'javascript', 'react', 'python', 'html', 'css', 'bug', 'error', 'api'])) {
      return this._codingFallback(message, lowercaseMsg);
    }

    if (this._hasAny(lowercaseMsg, ['healthy', 'healthiest', 'fitness', 'workout', 'diet', 'sleep'])) {
      return this._healthFallback(lowercaseMsg);
    }

    if (this._hasAny(lowercaseMsg, ['write', 'draft', 'email', 'caption', 'message', 'letter', 'bio'])) {
      return this._writingFallback(message);
    }

    if (this._hasAny(lowercaseMsg, ['plan', 'schedule', 'roadmap', 'organize', 'routine'])) {
      const topic = this._topicFromMessage(message);
      return `**Plan for ${topic}**\n\n1. **Define the outcome:** Write the exact result you want.\n2. **Break it down:** Split the work into small visible steps.\n3. **Sequence:** Do the highest-risk or most unclear step first.\n4. **Timebox:** Give each step a realistic time limit.\n5. **Review:** At the end, keep what worked and remove what felt heavy.\n\nA strong plan is not longer. It is easier to start.`;
    }

    const topic = this._topicFromMessage(message);
    return `I can help with **${topic}**.\n\nHere is the best way to approach it:\n\n1. **Clarify the goal:** What result do you want at the end?\n2. **Share the context:** What do you already have, and what is blocking you?\n3. **Pick a direction:** Explanation, step-by-step guide, idea list, rewrite, troubleshooting, or comparison.\n\nGive me one more detail and I will turn it into a concrete answer.`;
  },

  async _getChatResponseMock(userMessage, chatHistory, activeModule, currentContext) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowercaseMsg = userMessage.toLowerCase().trim();
        const casual = this._casualChatResponse(userMessage);

        if (casual) {
          resolve(casual);
          return;
        }

        if (activeModule === 'recipe') {
          resolve(this._recipeFallback(userMessage, lowercaseMsg, currentContext));
          return;
        }

        if (activeModule === 'thing') {
          resolve(this._thingFallback(userMessage, lowercaseMsg, currentContext));
          return;
        }

        resolve(this._generalFallback(userMessage, lowercaseMsg, chatHistory));
      }, 450);
    });
  }
};
