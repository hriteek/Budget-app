let budgetController = (function(){//IIFE 
    //this is how we create object using function constructor and prototype
    let Expense = function(id , description, value){
        this.id =id;
        this.description = description;
        this.value = value
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        (totalIncome>0)
        ?this.percentage = Math.round((this.value/totalIncome)*100)
        :this.percentage = -1
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let Income = function(id , description, value){
        this.id =id;
        this.description = description;
        this.value = value
    }

    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach((current)=>{
            sum +=current.value;
        })
        data.totals[type] = sum;
    }
    //datastructure
    let data = {
        allItems :{
            exp:[],
            inc:[]
        },
        totals:{
            exp :0, 
            inc :0
        },
        budget:0,
        percentage:-1
    };

    return {
        addItem: function(type, des, val){
            let newItem, ID;
            // create an id
            (data.allItems[type].length>0)?
            ID = data.allItems[type][data.allItems[type].length -1].id + 1
            :ID =0;
            //create a new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //Push the new item into the datastructure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },

        calculateBudget : function(){
            //calculate the total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we get
            data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
        },

        calculatePercentages : function(){
            data.allItems.exp.forEach((cur)=>{
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentage : function(){
            let allPer = data.allItems.exp.map((cur)=>{
                return cur.getPercentage();
            })
            return allPer;
        },

        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                totalPer : data.percentage
            }
        },


        deleteItem : function(type, id){
            let ids, index;
            /* 
            id = 3
            so we need to delete the element with id three
            but we cannot do it in ismple way like
            data.allItems[type][id]
            because the the item with id = 3 may not be 
            in the index = 3 of the inc or exp array beacuse
            some of the items befor them we deleted
            so we need some new way of doing it*/
            /* here we will create a new array that holds the 
            ids that are in the inc or exp array and provide 
            us with the respective indexes*/

            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);//this indexOf method can return -1 if it doesnot finds the given index in the given array
            if(index !== -1){
                data.allItems[type].splice(index, 1)
            }

        },

        testing:function(){
            console.log(data);
        }
    }
})();

let UIController = (function(){
    domStrings = {//this is how we store the class name of the dom into object so that if we need to change it later, then we should do only in one palce 
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputButton:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel :'.budget__value',
        incomeLabel :'.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percenategeLabel : '.budget__expenses--percentage',
        container:'.container',
        expenses : '.item__percentage',
        dateLabel : '.budget__title--month'
    }


    let formatNumber = function(num, type){
        num = Math.abs(num);
        num = num.toFixed(2);//returns string so we can use the split method of string

        numSplit = num.split('.');
        int = numSplit[0];
        //***** my code for the placement of the ',' in the number
        let list, i;
        int = int.split('');
        i = 3;
        for(let j =int.length; j>3;j-=3){
            int.splice(int.length - i,0,',');
            i+=4;
        }
        int = int.join('')
        //***** 
        // if(int.length>3){
        //     int = int.substr(0, int.length -3) +','+int.substr(int.length -3, 3);
        // }
        dec = numSplit[1];
        return (type === 'exp' ? '-': '+') + int +'.'+ dec;
    };

    let nodeListForEach = function(list, callback){
        for(let i =0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput : function(){
            return {
                type : document.querySelector(domStrings.inputType).value,//will be either inc or epx
                description : document.querySelector(domStrings.inputDescription).value,
                value : parseFloat(document.querySelector(domStrings.inputValue).value)//converting the vlaue that is string into a float
            }
        },

        addListItem : function(obj, type){
            let html, newHtml, element;
            // create HTML string with palceholder text
            if(type==='inc'){
                element = domStrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //repalce palce holder text with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            //insert the HTMl into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId){
            let element;
            element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },

        clearFields : function(){
            let fields, fieldsArr;
            fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
            //the query selector all methods gives us the list not an array. so we need to first conert it into list using slice method of array, but we cannot do it directly because slice method accepts array not list. so here we need to call call_method on slice method and pass the list as the this keyword, then it will return the array
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach((currentVal, index, array) => {
                currentVal.value = "";
            });
            fieldsArr[0].focus();//this line of code sends the focus into the first element of the array
        },

        displyBudget: function(obj){
            let type;
            obj.budget > 0 ? type = 'inc':type = 'exp';
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            (obj.totalPer != -1 && !isNaN(obj.totalPer))
            ?document.querySelector(domStrings.percenategeLabel).textContent = obj.totalPer+'%'
            :document.querySelector(domStrings.percenategeLabel).textContent = '---'
        },

        displayPercentage : function(percentages){
            let fields = document.querySelectorAll(domStrings.expenses);

            nodeListForEach(fields, function(current, index){
                //Do stuff
                if(percentages[index]>0){

                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });

        },

        displayMonth : function(){
            var now, year, monthArr;
            monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            now = new Date();
            year = now.getFullYear();
            month = monthArr[now.getMonth()];
            document.querySelector(domStrings.dateLabel).textContent = month + ' '+year;
        },

        changeType : function(){
            let fields = document.querySelectorAll(
                domStrings.inputType+','+
                domStrings.inputDescription+','+
                domStrings.inputValue);

                nodeListForEach(fields, function(cur){
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(domStrings.inputButton).classList.toggle('red');
        } ,
       
        getDOMStrings: function(){
            return domStrings;
        }
    }
})();

/*the controller module below is mainly to make connection between the
two moduels because there is separation of conceren between the
two modules listed above*/
let controller = (function(budgetCtrl, UICtrl){

    let setUpEventListerner= function(){//here we created a function that handles all the event in the code
        let DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);//here we dont have access to the domString in the UICOntroller up there so we passed the domString from the UIController as a return object and called it down from the controller and used it here so that i dont need to haed code the class name in the modules

        document.addEventListener('keypress', function(event){
            if(event.keyCode===13|| event.which ===13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
    };

    let updateBudget = function(){//this function is created so that it can use while deleting the item from the app
        //calculate the budget
        budgetCtrl.calculateBudget();
        //return budget
        let budget = budgetCtrl.getBudget();
        //display the budget into the UI
        // console.log(budget);
        UICtrl.displyBudget(budget);
    }

    let updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read them from budgt controller 
        let percentages = budgetCtrl.getPercentage();
        //update the UI with new percentages
        // console.log(percentages);
        UICtrl.displayPercentage(percentages);

    }

    let ctrlAddItem = function(){
        let input, newItem;
        //get the field input data
        input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){// here we are testing the whether the input fields are wmpty or not
            //add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //add the item into the ui
            // budgetCtrl.testing();//adding myself for testing
            UICtrl.addListItem(newItem, input.type);
            //clear the fields
            UICtrl.clearFields();
            //calculate and update budget 
            updateBudget();
            //calculate and update percentages
            updatePercentages();
        }
        
    }

    let ctrlDeleteItem = function(event){
        let itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            //inc-0
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            //delete the item from data structure
            budgetCtrl.deleteItem(type, id);
            //delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //update and show the new budget
            updateBudget();
            //calculate and update percentages
            updatePercentages(); 
        }
    }

    return{
        init: function(){
            console.log('application started');
            UICtrl.displyBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                totalPer : -1
            });
            setUpEventListerner();
            UICtrl.displayMonth();
        }
    }
})(budgetController, UIController);

controller.init();

