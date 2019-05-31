import uniqid from 'uniqid';

export default class List {
	constructor(){
		this.items =[];
	}

	addItem (count, unit, ingredient) {
		const item = {
			id:uniqid(),
			count,
			unit,
			ingredient
		}
		this.items.push(item);
		
		// Perist data in localStorage
        this.persistData();

		return item;
	}

	deleteItem(id) {
		const index = this.items.findIndex(el => el.id ===id);
		this.items.splice(index, 1);

		// Perist data in localStorage
        this.persistData();
	}

	persistData() {
        localStorage.setItem('list', JSON.stringify(this.items));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('list'));
        
        // Restoring likes from the localStorage
        if (storage) this.items = storage;
    }

}