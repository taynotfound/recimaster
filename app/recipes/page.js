'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import './recipes.css';

async function fetchRecipes(query) {
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

  const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&diet=balanced&app_id=${appId}&app_key=${appKey}`;

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

function RecipesContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleRecipes, setVisibleRecipes] = useState(6);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    const data = await fetchRecipes(query);
    const sortedRecipes = data.hits
      .map(hit => hit.recipe)
      .sort((a, b) => {
        if (a.totalTime && b.totalTime) return a.totalTime - b.totalTime;
        if (a.totalTime) return -1;
        if (b.totalTime) return 1;
        return 0;
      });
    setRecipes(sortedRecipes);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 300;
      setShowScrollTop(shouldShow);
      
      const button = document.querySelector('.scroll-to-top-btn');
      if (button) {
        if (shouldShow) {
          button.classList.add('visible');
        } else {
          button.classList.remove('visible');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMore = () => {
    const currentVisible = visibleRecipes;
    setVisibleRecipes(prev => prev + 6);
    
    // Add a small delay to allow React to render the new cards
    setTimeout(() => {
      const newCards = document.querySelectorAll(`.recipe-card:nth-child(n+${currentVisible + 1})`);
      newCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'none';
        card.offsetHeight; // Trigger reflow
        card.style.animation = null;
      });
    }, 0);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-950 p-4">
      <h1 className="text-4xl text-white font-bold mb-8">Search Results for "{query || "All"}"</h1>
            <form action="/recipes" method="get" className="flex space-x-2 pb-12">
  <input
    type="text"
    name="q"
    className="p-2 w-64 rounded-lg bg-slate-700 text-white"
    placeholder="Search for other recipes..."
  />
  <button type="submit" className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
    Search
  </button>
  </form>
      
      {loading ? (
        <div>
        <p className="text-white text-xl">Cooking up some recipes...</p>
        <Image src="https://media3.giphy.com/media/YoKaNSoTHog8Y3550r/source.gif" alt="Cooking" width={300} height={300} />
        </div>
      ) : recipes.length === 0 ? (
        <p className="text-white text-xl">No recipes found for "{query}". Try a different search term.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.slice(0, visibleRecipes).map((recipe, index) => (
                
              <div 
                key={index} 
                className="bg-slate-900 rounded-xl shadow-lg p-6 space-y-4 recipe-card"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <Image
                  src={recipe.images.REGULAR.url || recipe.images}
                  alt={recipe.label}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h2 className="text-2xl text-white font-bold">{recipe.label}</h2>
                <p className="text-slate-400">Source: {recipe.source}</p>
                <p className="text-slate-400">Calories: {Math.round(recipe.calories / recipe.yield)} kcal</p>
                <p className="text-slate-400">Time: {recipe.totalTime ? `${recipe.totalTime} minutes` : <span className='text-red-200'>N/A</span>}</p>
               
                <a
href={`/recipes/recipe?q=${recipe.uri.split('_').pop()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  View Recipe
                </a>
              </div>
            ))}
          </div>
          {visibleRecipes < recipes.length ? (
            <button
              onClick={loadMore}
              className="mt-8 bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Load More
            </button>
          ) : recipes.length > visibleRecipes && (
            <p className="mt-8 text-white text-xl">There is literally nothing to load anymore lol</p>
          )}
            
        </>
      )}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-slate-800 text-white p-4 rounded-full hover:bg-slate-700 transition-colors opacity-0 translate-y-4 scroll-to-top-btn"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
       <div className="w-full max-w-4xl bg-slate-900 rounded-xl shadow-lg p-8 mt-24">
        
        <div className="container mx-auto flex justify-center space-x-4 p-5 rounded-lg">
          <a
            href="https://discord.gg/C2bAXnYXzm"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Discord Server
          </a>
          <a
            href="https://github.com/taynotfound/recimaster"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            GitHub Repo
          </a>
          <a
            href="https://taynotfound.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            My Website
          </a>
        </div>
        <div className="container mx-auto flex justify-center space-x-4 rounded-lg">
        <p className="justify-center">Copyright 2024 Tay März</p>
        </div>
      </div>
      
    </main>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipesContent />
    </Suspense>
  );
}