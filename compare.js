require('es6-promise').polyfill();
global.jQuery = require("jquery");
var $ = require("jquery");

var Compare = function(el,active,mainPakets,url){
	this.el = el;
	this.mainPakets = mainPakets;
	this.active = active; // Активные пакеты 
	this.transform = 0;
	this.compare = [].slice.call(el.find(".menu_level"));
	this.url = url;
	this.data = {};
	this.init();
	this.wrap_data_kanals = document.querySelector(".wrap_data_kanals")
}


Compare.prototype.init = function(){
	this.compareArr = [];
	var self = this;
	var obj = {
		buttonCompare: [].slice.call($(this.mainPakets).find(".compare_active"))
	}

	for(var i = 0; i < this.compare.length; i++){
		var compare = {
			menuEl: this.compare[i],
			items: [].slice.call($(this.compare[i]).find(".item")),

		}
		self.compareArr.push(compare)
	}

	self.compareArr.push(obj)

	for(var key in self.active){
		if(key == "deleteIndex"){
			$(self.compareArr[0]['items'][self.active[key]]).removeClass("active") 
		}
		
	}


	var activeArr = Object.keys(self.active['active'])
	for(var i = 0; i < activeArr.length; i++){
		$(self.compareArr[0]['items'][activeArr[i]]).addClass("active") 
	}

	var Mypromise = this.requests();
	// this.requests(); // запрашиваем данные 
	Mypromise
		.then(this.initEvents())
		.catch()
	// this.initEvents();
}



Compare.prototype.initEvents = function(){
	var self = this;
	this.tarifs()
	this.filters()
}

Compare.prototype.tarifs = function(){
	var self = this;
	var arr = $(self.compareArr[0]['items'])

	for(let i = 0; i < arr.length; i++){ // отменяем все обработчики
		$(arr[i]).off("click");
	}

	for(let i = 0; i < arr.length; i++){
		$(arr[i]).off("click"); // отменяем все обработчики
		$(arr[i]).on('click', function(){ // подключаем обработчики
			if($(this).hasClass("active")){
				$(this).removeClass("active")
				delete self.active['active'][i]
				$(self.compareArr[5]['buttonCompare'][i]).removeClass("active")
				$(self.compareArr[5]['buttonCompare'][i+i]).removeClass("active")
				self.render()
			}else{
				$(this).addClass("active")
				self.active['active'][i] = i;
				$(self.compareArr[5]['buttonCompare'][i]).addClass("active")
				$(self.compareArr[5]['buttonCompare'][i+i]).addClass("active") 
				self.render()
			}
		})
	}
}

Compare.prototype.filters = function(){
	var self = this,
	    filters = [...this.compareArr[1]['items']],
	    checkbox = [...this.compareArr[2]['items']],
	    index = "";

	$(filters[0]).addClass("active")
	

	for(var i = 0; i < checkbox.length; i++){
		$(checkbox[i]).off("change")
	}


	for(var i = 0; i < filters.length; i++){
		$(filters[i]).off('click')
		if(filters[i].nodeName == "INPUT"){
			$(filters[i]).on("change", function(){
				if($(this).prop("checked") == true){
					self.active[`${$(this).attr("name")}`] = true;
					self.render()
				}else{
					self.active[`${$(this).attr("name")}`] = false;
					self.render() 
				}
			})
		}else{
			$(filters[i]).on("click", function(){
				$(this).siblings().removeClass("active")
				$(this).addClass("active")
				index = $(this).attr("data-index")
				self.active['filter'] = index * 1;
				self.render()
				console.log(self.active)
			})
		}
		
	}

	var $_select = $(this.compareArr[1]['menuEl']).find('select');
		$_select.on("change", function(){
			index = $(this).val();
			self.active['filter'] = index * 1;
			self.render()
		})
}

Compare.prototype.clear = function(obj){
	var self = this;
	$(".HD input").prop("checked",false)
	obj['filter'] = 0;
	this.active['HD'] = false;
	$.each(self.compareArr[1]['items'], function(i,el){
		$(el).removeClass("active")
	})
	$(self.compareArr[1]['items'][0]).addClass("active")
	$.each($(self.compareArr[3]['items']),function(i,el){
		$(el).css("display","none")
	})
	$(self.compareArr[3]['items'][4]).css("display","flex")
}

Compare.prototype.render = function(){
	var self = this,
	    obj = this.active,
	    arr = Object.keys(obj['active']);

	if(!arr.length){
		this.clear(obj)
		return
	}

	for(var i = 0; i < self.compareArr[3]['items'].length; i++){
		$(self.compareArr[3]['items'][i]).css("display","none")
		$(self.compareArr[4]['items']).css("display","none")
	}

	for(var i = 0; i < arr.length; i++){
		$(self.compareArr[3]['items'][arr[i]]).css("display","flex")
		$(self.compareArr[4]['items'][arr[i]]).css("display","flex")
	}
	this.renderKanals(arr)
	

}

Compare.prototype.HTML = function(arr,senior,names,channelsOlder){
	var html = "",
		plusMin = "",
		obj = {};

	for(var i = 0; i < arr.length; i++){
		obj[arr[i]] = ""
	}

	for(var i = 0; i < arr.length; i++){
		for(var j = 0; j < senior.length; j++){
			if(names[arr[i]*1].indexOf(senior[j]) != -1){
				obj[arr[i]] += `<div class="i">
					<img src="img/DigitalTV/kanals/plus.jpg" alt="">
				</div>`
			}else{
				obj[arr[i]] += `<div class="i"></div>`;
			}
		}
	}

	for(var i = 0; i < arr.length; i++){
		$(`.col_${arr[i]*1}`).append(obj[arr[i]]);
	}

	$.each(this.isFunction(channelsOlder) ? channelsOlder() : channelsOlder, function(key,val){ // отображаем все каналы 
			html+=`<div class="i">
			     <img src="https://www.wifire.ru/${val['img']}" width="70" height="43" alt="">
			     <span class="mb_hidden tb_hidden">${val['name']}</span>
			   </div>`			
			})
		$(this.wrap_data_kanals).append(html);
	}



Compare.prototype.filterRender = function(older,channelsOlder,names,filter,arr,senior){
	var self = this;
	if(filter == 0){
		$.each(older[0]['channels'], function(key,val){ // Сделали выборку 
				$.each(val, function(i,elem){
					channelsOlder.push({
						name: elem['name'],
						img: elem['img']
					})
				})
			})

		$.each(arr, function(key,val){
			$.each(self.data[val*1]['channels'], function(i,elem){
				$.each(elem, function(j,el){
					names[val*1].push(el['name'])
				})
			})
		})

	}else{

		$.each(older[0]['channels'][filter], function(key, val){
				channelsOlder.push({
					name: val['name'],
					img: val['img']
				})
			})
		$.each(arr, function(key,val){
			$.each(self.data[val*1]['channels'][filter], function(i,elem){
					names[val*1].push(elem['name'])

			})
		})

	}
	$.each(channelsOlder, function(key,val){ // заполняем обхект данные по фильтру
		senior.push(val['name'])
	})
}

Compare.prototype.isFunction = function(functionToCheck) {
      return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

Compare.prototype.renderKanals = function(arr){

	var channelsOlder = [],
	    count = [],
	    tarifs = [],
	    self = this,
	    filter = this.active.filter,
	    names = {},
	    senior = [],
	    older;


	$(this.wrap_data_kanals).children().remove() // Очищаем

	for(var i = 0; i < arr.length; i++){
		$(`.col_${arr[i]*1}`).children().remove()
	}

	for(var i = 0; i < arr.length; i++){
		count.push(this.data[arr[i]]['count']) // количество каналов
		tarifs.push(this.data[arr[i]]) // Выбранные тарифв
	}


	count.sort(function(a,b){return b - a})  // сортировка по возрастающей 

	older = tarifs.filter(function(t){ // определили страшего 
		return t['count'] == count[0]
	})

	$.each(arr, function(key,val){
		$.each(self.data[val*1]['channels'], function(i,elem){
			names[val*1] = []
		})
	})

	// Выборка по филтру
	this.filterRender(older,channelsOlder,names,filter,arr,senior)
	
	if(this.active['HD']){

		var hdFilter = function(){
			return channelsOlder.filter(function(item){ 
				const reqex = new RegExp("HD",'gi');
				return item.name.match(reqex)
			})
		}

		var newSenior = [];

		$.each(names, function(i,el){
			names[i] = el.filter(function(item){
				const reqex = new RegExp("HD",'gi');
				return item.match(reqex)
			})
		})
		
		newSenior = senior.filter(function(item){ // определяем новго старшего 
			const reqex = new RegExp("HD",'gi');
			return item.match(reqex)
		})

		$.each(arr, function(i,el){
			$($(`.col_${el*1}`)).children().remove() 
		})


		self.HTML(arr,newSenior,names,hdFilter)

	}else{
		self.HTML(arr,senior, names, channelsOlder)
	}
}	

Compare.prototype.close = function(){ // cбрасываем все параметры
	var self = this;
	var activeDom = [...this.compareArr[5]['buttonCompare'],
					 ...this.compareArr[0]['items'],
					 ...this.compareArr[1]['items']
					];
	for(var i = 0; i < activeDom.length; i++){
		$(activeDom[i]).removeClass("active");
	}
	this.active['active'] = {};
	this.active['filter'] = "";
	this.active['deleteIndex'] = "";
	this.active['HD'] = false;
	$(".HD input").prop("checked",false)

}

Compare.prototype.requests= function(){
	var self = this;
	return new Promise(function(resolve, reject){
// по клику
	fetch(self.url[0]["url"]["2"])
		.then(blob => blob.json())
		.then(response => self.data["0"] = response.packages["2"])

	fetch(self.url[0]['url']["3"])
		.then(blob => blob.json())
		.then(response => self.data["1"] = response.packages["3"])

	fetch(self.url[0]["url"]["4"])
		.then(blob => blob.json())
		.then(response => self.data["2"] = response.packages["4"])

	fetch(self.url[0]["url"]["5"])
		.then(blob => blob.json())
		.then(response => self.data["3"] = response.packages["5"])
	})
}

module.exports = Compare;