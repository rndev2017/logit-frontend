import React, { useState, useEffect } from "react";
import { example } from "../exampleRecipe";
import { UilClock } from '@iconscout/react-unicons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Recipe({ data, onExport }) {
  if (data == null) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className="text-xl font-semibold text-center mx-3">
          Sorry, we were unable to parse this recipe 😢
        </p>
        <p className="text-lg text-center text-gray-600 mx-3">
          We weren't able to extract nutritional information, 
          please try again with a new recipe
        </p>
      </div>
    )
  }
  else {
    return (
      <div className="h-screen flex flex-col justify-center items-center py-16">
        {/* Recipe Card */}
        <div className="overflow-y-scroll shadow-xl rounded-xl w-3/4 md:w-1/2 flex flex-col justify-start p-6 border-2 border-gray-100 my-10">
          {/* Name and Total time  */}
          <div className="flex flex-row justify-between items-center">
            <p className="text-xl font-bold tracking-tight w-1/2">
              {data.name}
            </p>
            <div className="flex flex-row items-center space-x-2">
              <UilClock size="24" color="#94a3b8" />
              <p className="text-slate-400">{data.totalTime/60} min.</p>
            </div>
          </div>
          {/* Description  */}
          <p 
            dangerouslySetInnerHTML={{__html: data.description}}
            className="text-gray-500 leading-relaxed my-1" />
          {/* Ingredients */}
          <div className="my-3">
            <p className="text-lg font-semibold tracking-tight">Ingredients</p>
            <ul role="list" className="marker:text-cyan-400 list-disc pl-5 space-y-2 text-slate-500">
              {data.recipeIngredient.map((ingredient, index) => {
                return (<li key={index} dangerouslySetInnerHTML={{__html: ingredient}}/>)
              })}
            </ul>
          </div>
          {/* Nutrition Facts */}
          <div className="my-3">
            <p className="text-lg font-semibold tracking-tight">
              Nutrition Facts{' '}
              <span className="text-slate-400 text-sm">(per serving)</span>
            </p>
            {Object.entries(data.nutrition).map(([key, value], index) => {
              if (key !== "servingSize") {
                return (
                  <div key={index} className="flex flex-row justify-between">
                    <p className="text-semibold">{value.displayName}</p>
                    <p className="text-slate-500">{value.value} {value.unit}</p>
                  </div>
                )
              }
            })}
           </div>
        </div>
        {/* Export to fitbit button */}
        <button
          onClick={onExport}
          disabled={data.example}
          className={`w-1/2 text-white font-semibold py-3 bg-cyan-500 rounded-md mb-5 flex flex-row justify-center
            ${data.example ? "cursor-not-allowed" : "hover:bg-cyan-600"}`}
        >
          Export to FitBit
        </button>
      </div>
    )
  }
}

export default function App({ userId, accessToken }) {
  const [isInvalid, setInvalid] = useState(false)
  const [link, setLink] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState(example)

  async function handleCreateFood() {
    // constants
    const defaultMeasurementId = 304
    const formType = "DRY"

    var requiredNutrition = {
      "fat": "totalFat", 
      "transFat": "transFat", 
      "saturatedFat": "saturatedFat",
      "cholesterol": "cholesterol", 
      "sodium": "sodium", 
      "carbohydrates": "totalCarbohydrate",
      "fiber": "dietaryFiber", 
      "sugar": "sugars",
      "protein": "protein"
    }
    var filtered = Object.entries(requiredNutrition)
      .filter(([key, _]) => key in recipe?.nutrition)
    requiredNutrition = Object.fromEntries(filtered)

    var queries = Object.entries(requiredNutrition)
      .map(([key, value]) => `${value}=${recipe?.nutrition[key].value}`)
    var queryString = queries.join("&")

    let endpoint = `https://api.fitbit.com/1/user/${userId}/foods.json?name=${recipe?.name}&defaultFoodMeasurementUnitId=${defaultMeasurementId}&defaultServingSize=${1}&calories=${recipe?.nutrition?.calories.value}&description=${recipe?.description}&formType=${formType}&${queryString}`
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}` 
      }
    })
      .then((res) => {
        if (res.ok && res.status === 201) {
          toast.success("Added food! 🎉", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
          });
          return res.json()
        } else {
          toast.error("Couldn't add food. 😢", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
          });
          return null;
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  /**
   * Make a request to my recipe parsing service to read the link
   */
  async function handleParse () {
    if (link === "" || link === null) {
      setInvalid(true);
      return;
    }
  
    setLoading(true)
    fetch(`https://fitbit-recipe-importer.herokuapp.com/parse?link=${link}`, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then((response) => response.json())
      .then((body) => {
        if (body.status === 200) {
          // show toast
          toast.success(body.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
          })
        } else {
          // error toast
          toast.error(body.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
          });
        }
        // update state
        setRecipe(body.data);
        setLoading(false)
        setLink('')
      })
      .catch((_) => {
        setLoading(false)
        setLink('')
      })

  }

  return (
    <>
      <div className="h-screen w-screen grid md:grid-row-1 md:grid-cols-2">
        <div className="h-full sticky flex flex-col justify-center items-center my-5 md:m-0">
          <p className="text-3xl font-bold tracking-tight">
            FitBit Recipe Importer
          </p>
          <p className="text-lg text-gray-400 text-center mx-2">
            Paste a recipe link, get nutrition facts, and export it to FitBit
          </p>
          {/* Form  */}
          <div className="w-3/4 md:w-2/3">
            <input
              className={`w-full p-1 mt-4 rounded-md 
                focus:ring-4 focus:ring-cyan-500/50 focus:outline-none 
                ${isInvalid ? "border-2 border-red-500 focus:ring-4 focus:ring-red-500/50" 
                  : "border-2 border-gray-400"
                }`
              }
              type="text" 
              value={link}
              placeholder="www.recipe.com"
              onChange={(e) => {
                if (e.target.value == null || e.target.value == '') {
                  setInvalid(true)
                }
                setLink(e.target.value)
                setInvalid(false)
              }}
            >
            </input>
            <p className={`${isInvalid ? "visible" : "hidden"} py-px text-red-500`}>Enter a valid link</p>
            <button
              onClick={handleParse} 
              disabled={isLoading}            
              className={`mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold w-full py-2 rounded-md
                ${isLoading ? "opacity-50": null}`}>
              {isLoading ? 'Parsing...' : 'Parse'}
            </button>
          </div>
        </div>
        <Recipe data={recipe} onExport={handleCreateFood}/>
      </div>
      <ToastContainer />
    </>
  )
}
