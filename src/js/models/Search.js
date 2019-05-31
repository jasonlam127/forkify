import axios from 'axios';
import {key2,proxy} from '../config';

export default class Search{
	constructor(query) {
		this.query = query;
	}

	async getResults ()  {
		
		try{
			const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key2}&q=${this.query}`);
			if(res.data.recipes)
				this.result = res.data.recipes;
			else
				if(res.data.error ==='limit'){
					console.log('daily api limit reached');
					alert('daily api limit reached');
				}
		}catch(error){
			console.log(error);
			alert('something went wrong');
		}
		
	}

}

