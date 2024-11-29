import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSwipeable } from 'react-swipeable';
import { useSpring, animated } from 'react-spring';
import axios from 'axios';
import { useRecipeMutation } from '~/hooks/recipes';
import { formatMealData } from './explore';
import { fetchRecipes } from './recipes';

const fetchRandomMeal = async () => {
    const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
    return response.data.meals[0];
};


export default function Index() {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [swiped, setSwiped] = useState(false);

    const { data: meal, refetch } = useQuery('randomMeal', fetchRandomMeal, {
        enabled: true,
    });
    

    // Fetch recipes data using react-query
    const { data: recipesData, isLoading: loadingRecipes, error: recipesError } = useQuery(
        ["recipes"],
        fetchRecipes
    );

    const { addOrUpdateMutation } = useRecipeMutation();

    const handleAddRecipe = (recipe) => {
        const data = { name: recipe.name, ingredients: recipe.ingredients, instructions: recipe.instructions, active: true }
        addOrUpdateMutation.mutate(data)
    }
    // Handle when recipes data is not available or not an array
    const recipes = Array.isArray(recipesData) ? recipesData : []; // Ensure 'recipes' is always an array

    // Swipeable props without preventDefaultTouchmoveEvent
    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('left'),
        onSwipedRight: () => handleSwipe('right'),
        trackMouse: true, // Allows mouse tracking for desktop devices
    });

    // Card animation
    const props = useSpring({
        transform: swiped ? 'rotate(15deg)' : 'rotate(0deg)',
        opacity: swiped ? 0 : 1,
    });

    // Handle swipe action (like or dislike)
    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            const formatted = formatMealData(meal); 
            setLiked(true);
            handleAddRecipe(formatted)
            console.log(formatted)
        } else if (direction === 'left') {
            setDisliked(true);
        }
        setSwiped(true);
        setTimeout(() => {
            setLiked(false);
            setDisliked(false);
            setSwiped(false);
            refetch(); 
        }, 500);
    };

    // If meal is fetched, display it
    const renderMealCard = () => {
        if (!meal) return null;
        return (
            <animated.div
                {...handlers}
                style={{
                    ...props,
                    backgroundColor: 'white',
                    borderRadius: '6x',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    overflow: "hidden",
                }}
                className="w-full h-full"
            >
                <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                <div className="z-[5] p-4 bottom-0 absolute w-full flex flex-col bg-gradient-to-b from-transparent to-black">
                    <h1 className="text-xl font-bold truncate">{meal.strMeal}</h1>
                    <p className="text-sm">{meal.strCategory}</p>
                    <p className="text-sm">{meal.strArea}</p>
                </div>
            </animated.div>
        );
    };

    return (
        <div className="relative flex-grow flex flex-col p-2 justify-between ">
            <div className="relative w-full flex-grow ">
                {renderMealCard()}

                {swiped && (
                    <div className={`absolute top-0 left-0 w-full h-full flex items-center justify-center`}>
                        <div className={`text-4xl font-bold ${liked ? 'text-green-500' : 'text-red-500'}`}>
                            {liked ? 'Added+' : 'Skipped'}
                        </div>
                    </div>
                )}
            </div>

            {JSON.stringify(recipes.length)}

            <div className="flex justify-between w-full px-4 py-2">
                <button
                    onClick={() => handleSwipe('left')}
                    className="bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-400 w-1/3"
                >
                    Skip
                </button>
                <button
                    onClick={() => handleSwipe('right')}
                    className="bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-400 w-1/3"
                >
                    Save
                </button>
            </div>
        </div>
    );
};