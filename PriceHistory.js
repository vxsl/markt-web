class LinkedListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
} 

class LinkedList {

    constructor(data) {
    	this.head = new LinkedListNode(data)
    }

    prepend(data) {
		
    	const newNode = new LinkedListNode(data)

    	if (this.head === null) {
    		this.head = newNode
    	}
    	else {    		
	    	let tmp = this.head
	    	this.head = newNode
	    	this.head.next = tmp
		}
    }
}

class PriceHistory extends LinkedList{

	constructor(initPrice) {
		super(initPrice)
	}

	display() {
		let cur = this.head
		let result = ''
		while (cur !== null) {
			result += ("[" + cur.data + "]")
			cur = cur.next
			if (cur !== null) result += " <- "
		}
		console.log(result + "\n")
	}

	logUpdate(newPrice) {
		super.prepend(newPrice)
	}

	getCurrent() {
		return this.head.data.toFixed(2)
	}

	
}

module.exports = {

	PriceHistory
}
