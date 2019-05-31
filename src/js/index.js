import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements,renderLoader,clearLoader } from './views/base';

//global state of the app
const state = {};

const controlSearch = async () => {
	const query = searchView.getInput();

	if(query){
		state.search = new Search(query);

		//prepare UI for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);

		try{
			await state.search.getResults();
			//render result on UI
			clearLoader();
			searchView.renderResults(state.search.result);
		}catch{
			clearLoader();
			alert('something went wrong getting data');
		}
		
	}
};

const controlRecipe = async() => {

	const id = window.location.hash.replace("#","");
	
	if(id) {

		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		if (state.search) searchView.highlightSelected(id);

		state.recipe = new Recipe(id);

		try{
			await state.recipe.getRecipe();

			state.recipe.calcTime();
			state.recipe.calcServings();
			state.recipe.parseIngredients();
			//console.log(state.recipe);

			//render recipe
			clearLoader();
			recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
		}catch(error){
			clearLoader();
			console.log(error);
			alert('something went wrong getting data');
		}
		
	}
};

const controlList = () => {
	//create a new list if there is none yet
	if(!state.list) state.list = new List();

	//add each ingredient to the list
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count,el.unit,el.ingredient);
		if(item)
			listView.renderItem(item);
	})
};

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//submit button click event
elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});



//page button click event
elements.searchResPages.addEventListener('click',e => {
	const btn = e.target.closest('.btn-inline');
	if(btn){
		const goToPage = parseInt(btn.dataset.goto,10);
		searchView.clearResults();
		searchView.renderResults(state.search.result,goToPage);
	}
});



//recipe controller
window.addEventListener('hashchange',controlRecipe);
window.addEventListener('load',controlRecipe);


//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
	const id = e.target.closest('.shopping__item').dataset.itemid;

	if(e.target.matches('.shopping__delete, .shopping__delete *')){
		//delete from state
		state.list.deleteItem(id);
		//delete from view
		listView.deleteItem(id);
	}else if(e.target.matches('.shopping__count-value')){
		//update value
		const val = parseFloat(e.target.value,10);
		if(val > 0)
			state.list.updateCount(id,val);
	}
})

// Restore liked recipes on page load and restore stored list item
window.addEventListener('load', () => {
    state.likes = new Likes();
    // Restore likes
    state.likes.readStorage();
    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));

    // get new List
    state.list = new List();
    // Restore list
    state.list.readStorage();
    //render shopping list
    state.list.items.forEach(e => {
    	listView.renderItem(e);
    })
    
});

//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
	if(e.target.matches('.btn-decrease, .btn-decrease *')){
		if(state.recipe.servings >1){
			state.recipe.updateServings('dec');
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if(e.target.matches('.btn-increase, .btn-increase *')){
		state.recipe.updateServings('inc');
		recipeView.updateServingsIngredients(state.recipe);
		
	}else if (e.target.matches('.recipe__btn--add, .recipe__btn *')){
		controlList();
	}else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
})


