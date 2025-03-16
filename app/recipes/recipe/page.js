'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import '../recipes.css';
import TypewriterEffect from '../TypewriterEffect.js';
import { setCache, getCache } from '../cache'; // Import cache utility
import BlueskyIcon from '../../../public/icons/bluesky.svg';
import CopyIcon from '../../../public/icons/copy.svg';
import DiscordIcon from '../../../public/icons/discord.svg';
import FacebookIcon from '../../../public/icons/facebook.svg';
import GithubIcon from '../../../public/icons/github.svg';
import WebsiteIcon from '../../../public/icons/website.svg';
import WhatsappIcon from '../../../public/icons/whatsapp.svg';
import YoutubeIcon from '../../../public/icons/youtube.svg';

// Create a cache object
const recipeCache = {};

async function fetchRecipe(query) {
  // Check if the recipe is already in the cache
  const cachedData = getCache(query);
  if (cachedData) {
    return cachedData;
  }

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
    
    // Store the fetched data in the cache
    setCache(query, data);
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
          "content": "The user is asking for instructions for the recipe. Please provide the instructions. STEP PER STEP. Use simple language. Please always mark the steps with numbers. Format: Step 1:..... \n\n Step 2:.... etc. ONLY THE INSTRUCTIONS! DO NOT INCLUDE THE INGREDIENTS OR YOUR OWN COMMENTS!"
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

function RecipeContent() {
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

  if (loading) return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-950 p-4">

    <div>
    <p className="text-white text-xl">Cooking up the ingredients...</p>
    <Image src="https://media3.giphy.com/media/YoKaNSoTHog8Y3550r/source.gif" alt="Cooking" width={300} height={300} />
    </div>
  <p className="text-white text-xl">Loading...</p>
  </main>);
  if (!recipe) return <p className="text-white text-xl">Recipe not found.</p>;

  const ytURL = "https://www.youtube.com/results?search_query="+recipe.label;

  const shareTexts = [
    `Check out this recipe for ${recipe.label} on ReciMaster!`,
    `I found this awesome recipe for ${recipe.label} on ReciMaster!`,
    `Want to cook ${recipe.label}? Check out the recipe on ReciMaster!`,
    `I'm making ${recipe.label} for dinner. Check out the recipe on ReciMaster!`,
    `What do you think of this recipe for ${recipe.label}? Check it out on ReciMaster!`,
  ]

  const shareTextPerSocial = {
    twitter: shareTexts[Math.floor(Math.random() * shareTexts.length)],
    facebook: shareTexts[Math.floor(Math.random() * shareTexts.length)],
    whatsapp: shareTexts[Math.floor(Math.random() * shareTexts.length)],
  };

  console.log(recipe)

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-950 p-4">
              <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">

      <h1 className="text-4xl text-white font-bold mb-8 text-left">{recipe.label} - ReciMaster</h1>
      </div>
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Image
            src={recipe.image}
            alt={recipe.label}
            width={400}
            height={400}
            className="w-full rounded-lg mb-4"
          />
          <div className="bg-slate-900 p-4 rounded-lg mb-4 recipe-card frosted-glass" style={{animationDelay: `${ 0.1}s`}}          >
            <p className="text-gray-400 text-sm italic">{recipe.totalTime} Minutes ・{recipe.mealType.join(" ")}・{Math.round(recipe.calories)} kcal</p>         
            <h2 className="text-2xl text-white font-bold mb-2 mt-4">Ingredients</h2>
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
          <div className="bg-slate-900 p-4 rounded-lg recipe-card frosted-glass" style={{animationDelay: `${ 0.1}s`}}          >
          <button
                  onClick={() => window.history.back()}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Back to List
            </button>
            <a
              href={ytURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-700 transition-colors m-2"
            >
              <Image src={YoutubeIcon} alt="YouTube" width={24} height={24} className="inline-block" />
            </a>
            </div>

            <div className="bg-slate-900 mt-4 p-4 rounded-lg recipe-card frosted-glass" style={{animationDelay: `${ 0.1}s`}}          >
            <h2 className="text-2xl text-white font-bold mb-2">Share this recipe</h2>
            <div className="flex space-x-2">
              <a
                href={`https://bsky.com/intent/compose?text=${encodeURIComponent(shareTextPerSocial.twitter)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-400 text-white p-2 rounded-lg hover:bg-blue-500 transition-colors flex items-center"
              >
                <Image src={BlueskyIcon} alt="Bluesky" width={24} height={24} />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipe.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Image src={FacebookIcon} alt="Facebook" width={24} height={24} />
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(recipe.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-400 text-white p-2 rounded-lg hover:bg-green-500 transition-colors flex items-center"
              >
                <Image src={WhatsappIcon} alt="WhatsApp" width={24} height={24}  />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareTextPerSocial.twitter + ' ' + window.location.href);
                  alert("Copied to clipboard!");
                  
                }}
                className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center"
              >
                <Image src={CopyIcon} alt="Copy" width={24} height={24} className="mr-2" />
                Copy
              </button>
            </div>
        </div>
        <div className="bg-slate-900 mt-4 p-4 rounded-lg recipe-card frosted-glass" style={{animationDelay: `${ 0.1}s`}}          >
            <h2 className="text-2xl text-white font-bold mb-2">Useful Links</h2>
            <div className="flex space-x-2">
              <a
                  href="https://discord.gg/C2bAXnYXzm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
              >
                  <Image src={DiscordIcon} alt="Discord" width={24} height={24} className="" />
              </a>
              <a
                  href="https://github.com/taynotfound/recimaster"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
              >
                  <Image src={GithubIcon} alt="GitHub" width={24} height={24} className="" />
              </a>
              <a
                  href="https://taynotfound.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
              >
                  <Image src={WebsiteIcon} alt="Website" width={24} height={24} className="" />
              </a>
              </div>
            </div>
        </div>

        <div className="md:w-2/3">
          <div className="bg-slate-900 p-4 rounded-lg recipe-card frosted-glass"  style={{animationDelay: `${ 0.1}s`}}          >
            <h2 className="text-2xl text-white font-bold mb-2">Instructions</h2>
            {recipe.instructions ? (
              <ol className="list-decimal list-inside text-white text-lg">
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
AI generated instructions may be inaccurate. Use with caution.              </p>
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
      <div className="w-xl h-md rounded-xl shadow-lg p-8 mt-24">
      
     
          
        <div className="container mx-auto flex justify-center space-x-4 rounded-lg">
        <p className="justify-center text-gray-800">Copyright 2025 Tay März</p>
        </div>
      </div>
      
    </main>
  );
}

export default function RecipePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipeContent />
    </Suspense>
  );
}