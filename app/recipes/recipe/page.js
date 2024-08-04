'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import '../recipes.css';
import TypewriterEffect from '../TypewriterEffect.js';

async function fetchRecipe(query) {
  const appId = process.env.NEXT_PUBLIC_EDAMAM_ID;
  const appKey = process.env.NEXT_PUBLIC_EDAMAM_KEY;

  if (!appId || !appKey) {
    console.error('Edamam API credentials are not set');
    return { hits: [
        {
            recipe: {
            label: 'No API credentials',
            source: 'ReciMaster',
            calories: 0,
            totalTime: 0,
            url: 'https://recimaster.com',
            images: {
                REGULAR: {
                url: '/no-recipe.jpg',
                },
            },
            },
        },
    ] };
  }
  const url = `https://api.edamam.com/api/recipes/v2/${encodeURIComponent(query)}?type=public&app_id=${appId}&app_key=${appKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return { hits: [
        {
            recipe: {
            label: 'Failed to fetch recipes',
            source: 'ReciMaster',
            calories: 0,
            totalTime: 0,
            url: 'https://recimaster.com',
            images: {
                REGULAR: {
                url: '/no-recipe.jpg',
                },
            },
            },
        },
    ] };
  }
}

async function loadAIInstructions(recipeName, ingredients, servings) {
  const response = await fetch(`https://api.webraft.in/v2/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization" : `Bearer ${process.env.NEXT_PUBLIC_WEBRAFT_API_KEY}`
    },
    body: JSON.stringify({
      "model":"gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "The user is asking for instructions for the recipe. Please provide the instructions. STEP PER STEP. Use simple language. Please always mark the steps with numbers."
        },
        {
          "role": "user",
          "content": `What's the recipe for ${recipeName} with ${servings} servings and ${ingredients.map(i => i.food).join(', ')} ingredients?`
        }
      ]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

export default function RecipePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(2);
  const [aiInstructions, setAiInstructions] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);

  const loadRecipe = useCallback(async () => {
    setLoading(true);
    const data = await fetchRecipe(query);
    setRecipe(data.recipe);
    setServings(data.recipe.yield);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const adjustIngredientAmount = (amount) => {
    if (!amount || isNaN(amount)) return '';
    const factor = servings / recipe.yield;
    return (parseFloat(amount) * factor).toFixed(2);
  };

  const handleGetAIInstructions = async () => {
    setIsLoadingInstructions(true);
    try {
      const instructions = await loadAIInstructions(recipe.label, recipe.ingredients, servings);
      setAiInstructions(instructions);
    } catch (error) {
      console.error('Error fetching AI instructions:', error);
      setAiInstructions('Failed to fetch AI instructions. Please try again.');
    }
    setIsLoadingInstructions(false);
  };

  if (loading) return <p className="text-white text-xl">Loading...</p>;
  if (!recipe) return <p className="text-white text-xl">Recipe not found.</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-950 p-4">
      <h1 className="text-4xl text-white font-bold mb-8">{recipe.label}</h1>
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Image
            src={recipe.image}
            alt={recipe.label}
            width={400}
            height={400}
            className="w-full rounded-lg mb-4"
          />
          <div className="bg-slate-900 p-4 rounded-lg mb-4 recipe-card" style={{animationDelay: `${ 0.1}s`}}          >
            <h2 className="text-2xl text-white font-bold mb-2">Ingredients</h2>
            <div className="flex items-center mb-4">
              <label className="text-white mr-2">Servings:</label>
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-slate-800 text-white p-1 w-16 rounded"
              />
            </div>
            
                 <ul className="list-disc list-inside text-white">
  {recipe.ingredients.map((ingredient, index) => (
    <li key={index}>
      {ingredient.quantity ? adjustIngredientAmount(ingredient.quantity + " ") : ''}
      {ingredient.measure ? " " +ingredient.measure.replace("<unit>", " ")+ " " : ''} 
      {ingredient.food}
    </li>
  ))}
</ul>

          </div>
        </div>
        <div className="md:w-2/3">
          <div className="bg-slate-900 p-4 rounded-lg recipe-card"  style={{animationDelay: `${ 0.1}s`}}          >
            <h2 className="text-2xl text-white font-bold mb-2">Instructions</h2>
            {recipe.instructions ? (
              <ol className="list-decimal list-inside text-white">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="mb-2">{step}</li>
                ))}
              </ol>
            ) : aiInstructions ? (
              <TypewriterEffect text={aiInstructions} />
            ) : (
              <div>
                <p className="text-white mb-4">No instructions available. Would you like AI-generated instructions?</p>
                <button
                  onClick={handleGetAIInstructions}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                  disabled={isLoadingInstructions}
                >
                  {isLoadingInstructions ? 'Generating...' : 'Get AI Instructions'}
                </button>
              </div>
            )}
            {aiInstructions && (
              <p className="text-red-500 mt-4">
                Instructions generated by AI may not be accurate. Please use with caution.
              </p>
            )}
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors "
            >
              View Original Recipe
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}