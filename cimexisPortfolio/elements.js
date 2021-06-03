//connected callback must be called before init, otherwise any elements created through innerHTML will not exist yet

class TextInput extends HTMLElement{
	constructor(){
		super();
		this.inputElm=newElm("input");
	}
	init(text){
		this.text=text;
		this.textChangeSub=()=>{this.update()};
		this.text.sub(bindType.SET,this.textChangeSub);
		this.update();

		this.inputElm.addEventListener('input', ()=>{this.set();});
	}
	connectedCallback(){
		appElm(this.inputElm,this);
		let afterElm=newElm("DIV","focused");
		appElm(afterElm,this);
	}
	update(){
		this.inputElm.value=this.text.data;
	}
	set(){
		newUpdate();
		this.text.data=this.inputElm.value;
	}
}
customElements.define('text-input', TextInput);

class TextDisplay extends HTMLElement{
	constructor(){
		super();
	}
	init(text){
		this.text=text;
		this.textChangeSub=()=>{this.update()};
		this.text.sub(bindType.SET,this.textChangeSub);
		this.update();
	}
	connectedCallback(){
	}
	update(){
		this.innerText=this.text.data;
	}
}
customElements.define('text-display', TextDisplay);

class NumberInput extends HTMLElement{
	constructor(){
		super();
		this.inputElm=newElm("input");
	}
	init(number){
		this.number=number;
		this.text=bind(this.number.data+"");
		this.textChangeSub=()=>{this.update()};
		this.text.sub(bindType.SET,this.textChangeSub);
		this.text.sub(bindType.SET,()=>{
			let num=parseFloat(this.text.data);
			if(!isNaN(num)){
				this.number.data=num;
			}else{
				this.number.data=0;
			}
		});
		this.number.sub(bindType.SET,()=>{
			let curr=parseFloat(this.text.data);
			if(isNaN(curr)){
				curr=0;
			}
			if(curr!==this.number.data){
				this.text.data=this.number.data+"";
			}
		});
		this.update();

		this.inputElm.addEventListener('input', ()=>{this.set();});
		this.inputElm.addEventListener('blur', ()=>{this.fullUpdate();});
	}
	connectedCallback(){
		appElm(this.inputElm,this);
		let afterElm=newElm("DIV","focused");
		appElm(afterElm,this);
	}
	update(){
		this.inputElm.value=this.text.data;
	}
	fullUpdate(){
		newUpdate();
		this.text.data=this.number.data+"";
		this.update();
	}
	set(){
		if(this.inputElm.value===""){
			newUpdate();
			this.text.data="";
		}else{
			if(isAlmostNumber(this.inputElm.value)){
				newUpdate();
				this.text.data=this.inputElm.value;
			}else{
				//if the number is definately wrong then reset the user input
				newUpdate();
				this.text.data=this.text.data;
			}
		}
	}
}
customElements.define('number-input', NumberInput);

class PriceInput extends HTMLElement{
	constructor(){
		super();
		this.inputElm=newElm("input");
	}
	init(number){
		this.number=number;
		this.text=bind(this.numToString(this.number.data));
		this.textChangeSub=()=>{this.update()};
		this.text.sub(bindType.SET,this.textChangeSub);
		this.text.sub(bindType.SET,()=>{
			let num=parseFloat(this.text.data.replace('$',''));
			if(!isNaN(num)){
				this.number.data=num;
			}else{
				this.number.data=0;
			}
		});
		this.number.sub(bindType.SET,()=>{
			let curr=parseFloat(this.text.data.replace('$',''));
			if(isNaN(curr)){
				curr=0;
			}
			if(curr!==this.number.data){
				this.text.data=this.numToString(this.number.data);
			}
		});
		this.fullUpdate();

		this.inputElm.addEventListener('input', ()=>{this.set();});
		this.inputElm.addEventListener('blur', ()=>{this.fullUpdate();});
	}
	numToString(num){
		let asString=num.toFixed(2);
		if(asString.includes("-")){
			asString=asString.replace("-","");
			asString="-$"+asString;
		}else{
			asString="$"+asString;
		}
		return asString;
	}
	connectedCallback(){
		appElm(this.inputElm,this);
		let afterElm=newElm("DIV","focused");
		appElm(afterElm,this);
	}
	update(){
		this.inputElm.value=this.text.data;
	}
	fullUpdate(){
		newUpdate();
		this.text.data=this.numToString(this.number.data);
		this.update();
	}
	set(){
		if(this.inputElm.value===""){
			newUpdate();
			this.text.data="";
		}else{
			if(isAlmostPrice(this.inputElm.value)){
				newUpdate();
				this.text.data=this.inputElm.value;
			}else{
				//if the number is definately wrong then reset the user input
				newUpdate();
				this.text.data=this.text.data;
			}
		}
	}
}
customElements.define('price-input', PriceInput);

class PriceDisplay extends HTMLElement{
	constructor(){
		super();
	}
	init(text){
		this.text=text;
		this.textChangeSub=()=>{this.update()};
		this.text.sub(bindType.SET,this.textChangeSub);
		this.update();
	}
	connectedCallback(){
	}
	update(){
		let cleanedVal="$"+(this.text.data.toFixed(2))
		this.innerText=cleanedVal;
	}
}
customElements.define('price-display', PriceDisplay);

class ListRepeater extends HTMLElement{
	constructor(){
		super();
	}

	//list is the bound list used
	//mappingFunc is the way to convert from a single item in the list to an element
	init(list,mappingFunc){
		this.list=list;
		this.addSub=(info)=>{this.addItem(info.bound,info.index)};
		this.removeSub=(info)=>{this.removeItem(info.index)};
		this.setSub=(info)=>{this.setItem(info.bound,info.prop)};
		this.list.sub(bindType.ADD,this.addSub);
		this.list.sub(bindType.REMOVE,this.removeSub);
		this.list.sub(bindType.SET,this.setSub);
		this.mappingFunc=mappingFunc;
		this.elmList=[];
		for(let i=0;i<this.list.length;i++){
			this.addItem(this.list[i],i);
		}
	}
	connectedCallback(){

	}
	setItem(item,index){
		this.removeItem(index);
		this.addItem(item,index);
	}
	addItem(item,index){
		let toAdd=this.mappingFunc(item);
		appElmAt(toAdd,index,this);
		toAdd.init(item);
		this.elmList.splice(index,0,toAdd);
	}
	removeItem(index){
		this.elmList[index].remove();
		this.elmList.splice(index,1);
	}
}
customElements.define('list-repeater', ListRepeater);

class Header extends HTMLElement{
	constructor(){
		super();
	}
	init(categories,title,isDown){
		this.introElm.init(title);
		this.navElm.init(categories,isDown);
	}
	connectedCallback(){
		this.introElm=new Intro();
		this.navElm=new Nav();
		appElm(this.introElm,this);
		appElm(this.navElm,this);
	}
}
customElements.define('header-control', Header);

class Intro extends HTMLElement{
	constructor(){
		super();
	}
	init(title){
		this.headElm.init(title);
	}
	connectedCallback(){
		this.headElm=new IntroHead();
		appElm(this.headElm,this);
	}
}
customElements.define('intro-control', Intro);

class IntroHead extends HTMLElement{
	constructor(){
		super();
	}
	init(title){
		this.titleElm.init(title);
	}
	connectedCallback(){
		this.innerHTML=`
			<div class="icon"></div>
			<div class="title">
				<h1><text-display class="titleText"></text-display></h1>
			</div>
		`;
		this.titleElm=getElm(".titleText",this);
	}
}
customElements.define('intro-head', IntroHead);

class Nav extends HTMLElement{
	constructor(){
		super();
	}
	init(categories,isDown){
		this.isDown=isDown;
		this.downSub=()=>{this.update()};
		this.isDown.sub(bindType.SET,this.downSub);
		this.categoriesElm.init(categories);
		this.update();
	}
	connectedCallback(){
		this.innerHTML=`
			<div class="mid">
				<div class="cover"><div></div></div>
				<div class="shadowHider"></div>
				<div class="icon"></div>
			</div>
		`;
		this.categoriesElm=new CategoryList();
		appElm(this.categoriesElm,this);
	}
	update(){
		if(this.isDown.data){
			this.classList.add("down");
		}else{
			this.classList.remove("down");
		}
	}
}
customElements.define('nav-control', Nav);

class CategoryList extends HTMLElement{
	constructor(){
		super();
	}
	init(categories){
		this.repeaterElm.init(categories,()=>{return new CategoryItem()});
	}
	connectedCallback(){
		this.repeaterElm=new ListRepeater();
		appElm(this.repeaterElm,this);
	}
}
customElements.define('category-list', CategoryList);

class CategoryItem extends HTMLElement{
	constructor(){
		super();
	}
	init(category){
		this.selected=category.selected;
		this.selSub=()=>{this.update()};
		this.selected.sub(bindType.SET,this.selSub);
		this.textDisp.init(category.name);
		this.update();
		this.btn.onclick=()=>{this.select()};
		if(category.isMid.data){
			this.classList.add("midGap");
		}
	}
	connectedCallback(){
		this.btn=newElm("button");
		this.textDisp=new TextDisplay();
		appElm(this.btn,this);
		appElm(this.textDisp,this.btn);
	}
	update(){
		if(this.selected.data){
			this.classList.add("selected");
		}else{
			this.classList.remove("selected");
		}
	}
	select(){
		newUpdate();
		this.selected.data=true;
	}
}
customElements.define('category-item', CategoryItem);

class Body extends HTMLElement{
	constructor(){
		super();
	}
	init(pages){
		this.repeaterElm.init(pages,()=>{return new Page()});
		this.decorative.init();
	}
	connectedCallback(){
		this.repeaterElm=new ListRepeater();
		appElm(this.repeaterElm,this);
		this.decorative=new Decoration();
		appElm(this.decorative,this);
	}
}
customElements.define('body-control', Body);

class Page extends HTMLElement{
	constructor(){
		super();
	}
	init(page){
		this.selected=page.selected;
		this.selSub=()=>{this.update()};
		this.selected.sub(bindType.SET,this.selSub);
		this.update();

		let type=page.type.data;
		let pageInner=null;
		switch (type){
			case "Home":
				pageInner=new HomePage();
				break;
			case "About":
				pageInner=new AboutPage();
				break;
			case "Projects":
				pageInner=new ProjectsPage();
				break;
			case "Contact":
				pageInner=new ContactPage();
				break;
		}
		if(pageInner!==null){
			appElm(pageInner,this);
			pageInner.init(page);
		}
	}
	connectedCallback(){
		let end=new EndSymbol();
		appElm(end,this);
	}
	update(){
		if(this.selected.data){
			this.classList.add("selected");
		}else{
			this.classList.remove("selected");
		}
	}
}
customElements.define('page-control', Page);

class HomePage extends HTMLElement{
	constructor(){
		super();
	}
	init(page){
		this.projectsElm.init(page.projects,page.projectTagIndex);
		this.btnList.init(page.projectTags);
	}
	addElementIntro(name){
		let titleElm=new SectionTitle();
		titleElm.init(name);
		appElm(titleElm,this);
	}
	connectedCallback(){
		this.innerHTML=`
			<div class="back"><div></div></div>
			<div class="intro">
				<h2>Mission</h2>
				<p>I am driven by deep love for programming. I aim to push the limits of what is possible with code, carving my own path as I go. Following the rules but always thinking outside the box - I'm an inherently creative person and I believe code is an art. I focus on results and strive to always improve my skills so that I can accomplish even greater things.</p>
				<p class="centered"><a href="" class="link">About Me</a></p>
			</div>
			<div class="flexBreak"></div>
			<div class="projects">
				<h2>Projects</h2>
				<toggle-button-list>
				</toggle-button-list>
			</div>
			<div class="flexBreak"></div>
			<div class="about">
				<h2>Contact</h2>
				<p></p>
			</div>
		`;
		this.btnList=getElm("toggle-button-list",this);
		let projectDiv=getElm(".projects",this);
		let link=newElm("P","centered");
		link.innerHTML=`<a href="" class="link">See More</a>`;
		this.projectsElm=new ProjectListShort();
		appElm(this.projectsElm,projectDiv);
		appElm(link,projectDiv);
	}
}
customElements.define('home-page', HomePage);

class AboutPage extends HTMLElement{
	constructor(){
		super();
	}
	init(){
	}
	connectedCallback(){
		this.innerHTML=`
			<div class="intro">
				<h2>Who I am</h2>
				<div class="split">
					<img src="img/image.png" class="framed"/>
					<p>I'm a person...</p>
				</div>
				
			</div>
			<div class="flexBreak"></div>
			<div class="story">
				<h2>My Story</h2>
				<div class="split">
					<story-bar></story-bar>
					<story-list></story-list>
				</div>
			</div>
			<div class="flexBreak"></div>
			<div class="about">
				<h2>My Skills</h2>
				<p></p>
				<h2>Philosophy</h2>
				<p></p>
			</div>
		`;
	}
}
customElements.define('about-page', AboutPage);

class ContactPage extends HTMLElement{
	constructor(){
		super();
	}
	init(){
	}
	connectedCallback(){
	}
}
customElements.define('contact-page', ContactPage);

class ProjectsPage extends HTMLElement{
	constructor(){
		super();
	}
	init(page){
		this.projectsElm.init(page.projects);
		this.btnList.init(page.projectTags);
	}
	connectedCallback(){
		let title=newElm("H2");
		title.innerText="Projects";
		appElm(title,this);
		this.btnList=new ToggleButtonList();
		this.projectsElm=new ProjectList();
		appElm(this.btnList,this);
		appElm(this.projectsElm,this);
	}
}
customElements.define('projects-page', ProjectsPage);

class ProjectListShort extends HTMLElement{
	constructor(){
		super();
	}
	init(projects,tagIndex){
		this.list=derive(projects,1);
		for(let i=0;i<this.list.length;i++){
			this.list[i].isSpacer=false;
			this.list[i].visible=bind(false);
			let visSub=()=>{this.list[i].visible.data=projects[i].visible.data};
			projects[i].visible.sub(bindType.SET,visSub);
			visSub();
		}
		for(let i=0;i<3;i++){
			this.list.add(bind({isSpacer: true}));
		}
		this.repeaterElm.init(this.list,
			(item)=>{
				if(item.isSpacer.data){
					return new ProjectCardSpacer();
				}else{
					return new ProjectCard();
				}
			}
		);
		let updateSub=()=>{this.update()};
		tagIndex.sub(bindType.SET,updateSub);
		updateSub();
	}
	update(){
		let count=0;
		pushUpdate();
		newUpdate();
		for(let i=0;i<this.list.length;i++){
			if(!this.list[i].isSpacer.data){
				if(this.list[i].visible.data&&count<3){
					count++;
				}else{
					this.list[i].visible.data=false;
				}
			}
		}
		popUpdate();
	}
	connectedCallback(){
		this.repeaterElm=new ListRepeater();
		appElm(this.repeaterElm,this);
	}

}
customElements.define('project-list-short', ProjectListShort);

class ProjectList extends HTMLElement{
	constructor(){
		super();
	}
	init(projects){
		let list=derive(projects,1);
		for(let i=0;i<list.length;i++){
			list[i].isSpacer=false;
		}
		for(let i=0;i<3;i++){
			list.add(bind({isSpacer: true}));
		}
		this.repeaterElm.init(list,
			(item)=>{
				if(item.isSpacer.data){
					return new ProjectCardSpacer();
				}else{
					return new ProjectCard();
				}
			}
		);
	}
	connectedCallback(){
		this.repeaterElm=new ListRepeater();
		appElm(this.repeaterElm,this);
	}

}
customElements.define('project-list', ProjectList);

class ProjectCard extends HTMLElement{
	constructor(){
		super();
	}
	init(projectSummary){
		this.visible=projectSummary.visible;
		this.visSub=()=>{this.updateVisible()};
		this.visible.sub(bindType.SET,this.visSub);
		this.visSub();
		let tags="";
		for(let i=0;i<projectSummary.tags.length;i++){
			if(i>0){
				tags+=" ";
			}
			tags+="#"+projectSummary.tags[i].data;
		}
		this.innerHTML=`
			<div class="background"></div>
			<div class="cover"></div>
			<div class="description">
				<h3>${projectSummary.name.data}</h3>
				<p>${projectSummary.description.data}</p>
				<p class="link">view project</p>
				<p class="tags">${tags}</p>
			</div>
			<div class="caption">
				<h3>${projectSummary.name.data}</h3>
			</div>
		`;

	}
	updateVisible(){
		if(this.visible.data){
			this.style.display="";
		}else{
			this.style.display="none";
		}
	}
	connectedCallback(){
	}
}
customElements.define('project-card', ProjectCard);

class ProjectCardSpacer extends HTMLElement{
	constructor(){
		super();
	}
	init(){
		
	}
	connectedCallback(){

	}
}
customElements.define('project-card-spacer', ProjectCardSpacer);

class StoryList extends HTMLElement{
	constructor(){
		super();
	}
	init(){
	}
	connectedCallback(){
		this.innerHTML=`
			<div class="cover"></div>
			<div class="inner">
				<story-timeline>
					<story-item style="left:450px; width:500px; bottom: 120px">
						<div class="inner">
							<div class="ribbon"></div>
							<div class="text">
								<p>Lawdepot</p>
								<div class="arrowTip"></div>
							</div>
							<div class="hollow">
								<div class="ribbon"></div>
							</div>
							<div class="mid"></div>
							<div class="diamond"></div>
						</div>
						<div class="line"></div>
					</story-item>
					<story-item style="left:150px; width:350px; bottom: 60px">
						<div class="inner">
							<div class="ribbon"></div>
							<div class="text">
								<p>Lawdepot</p>
								<div class="arrowTip"></div>
							</div>
							<div class="hollow">
								<div class="ribbon"></div>
							</div>
							<div class="mid"></div>
							<div class="diamond"></div>
						</div>
						<div class="line"></div>
					</story-item>
					<story-item style="left:50px; width:550px; bottom: 0px">
						<div class="inner">
							<div class="ribbon"></div>
							<div class="text">
								<p>Lawdepot</p>
								<div class="arrowTip"></div>
							</div>
							<div class="hollow">
								<div class="ribbon"></div>
							</div>
							<div class="mid"></div>
							<div class="diamond"></div>
						</div>
						<div class="line"></div>
					</story-item>
					<story-item style="left:700px; width:300px; bottom: 0px">
						<div class="inner">
							<div class="ribbon"></div>
							<div class="text">
								<p>Lawdepot</p>
								<div class="arrowTip"></div>
							</div>
							<div class="hollow">
								<div class="ribbon"></div>
							</div>
							<div class="mid"></div>
							<div class="diamond"></div>
						</div>
						<div class="line"></div>
					</story-item>
					<story-item style="left:1100px; width:1300px; bottom: 0px">
						<div class="inner">
							<div class="ribbon"></div>
							<div class="text">
								<p>Lawdepot</p>
								<div class="arrowTip"></div>
							</div>
							<div class="hollow">
								<div class="ribbon"></div>
							</div>
							<div class="mid"></div>
							<div class="diamond"></div>
						</div>
						<div class="line"></div>
					</story-item>
				</story-timeline>
				<story-dateline>
					<story-date><div>
						<p class="year">2015</p>
						<p class="month">JAN</p>
						<p class="month">FEB</p>
						<p class="month">MAR</p>
						<p class="month">APR</p>
						<p class="month">MAY</p>
						<p class="month">JUN</p>
						<p class="month">JUL</p>
						<p class="month">AUG</p>
						<p class="month">SEP</p>
						<p class="month">OCT</p>
						<p class="month">NOV</p>
						<p class="month">DEC</p>
					</div></story-date>
					<story-date><div>
						<p class="year">2016</p>
						<p class="month">JAN</p>
						<p class="month">FEB</p>
						<p class="month">MAR</p>
						<p class="month">APR</p>
						<p class="month">MAY</p>
						<p class="month">JUN</p>
						<p class="month">JUL</p>
						<p class="month">AUG</p>
						<p class="month">SEP</p>
						<p class="month">OCT</p>
						<p class="month">NOV</p>
						<p class="month">DEC</p>
					</div></story-date>
					<story-date><div>
						<p class="year">2017</p>
						<p class="month">JAN</p>
						<p class="month">FEB</p>
						<p class="month">MAR</p>
						<p class="month">APR</p>
						<p class="month">MAY</p>
						<p class="month">JUN</p>
						<p class="month">JUL</p>
						<p class="month">AUG</p>
						<p class="month">SEP</p>
						<p class="month">OCT</p>
						<p class="month">NOV</p>
						<p class="month">DEC</p>
					</div></story-date>
					<story-date><div>
						<p class="year">2018</p>
						<p class="month">JAN</p>
						<p class="month">FEB</p>
						<p class="month">MAR</p>
						<p class="month">APR</p>
						<p class="month">MAY</p>
						<p class="month">JUN</p>
						<p class="month">JUL</p>
						<p class="month">AUG</p>
						<p class="month">SEP</p>
						<p class="month">OCT</p>
						<p class="month">NOV</p>
						<p class="month">DEC</p>
					</div></story-date>
					<story-date><div>
						<p class="year">2019</p>
						<p class="month">JAN</p>
						<p class="month">FEB</p>
						<p class="month">MAR</p>
						<p class="month">APR</p>
						<p class="month">MAY</p>
						<p class="month">JUN</p>
						<p class="month">JUL</p>
						<p class="month">AUG</p>
						<p class="month">SEP</p>
						<p class="month">OCT</p>
						<p class="month">NOV</p>
						<p class="month">DEC</p>
					</div></story-date>
					<story-date><div>
						<p class="year">2020</p>
						<p class="month">JAN</p>
						<p class="month">FEB</p>
						<p class="month">MAR</p>
						<p class="month">APR</p>
						<p class="month">MAY</p>
						<p class="month">JUN</p>
						<p class="month">JUL</p>
						<p class="month">AUG</p>
						<p class="month">SEP</p>
						<p class="month">OCT</p>
						<p class="month">NOV</p>
						<p class="month">DEC</p>
					</div></story-date>
					<story-date><div>
						<p class="year">2021</p>
						<p class="month">JAN</p>
						<p class="month">FEB</p>
						<p class="month">MAR</p>
						<p class="month">APR</p>
						<p class="month">MAY</p>
						<p class="month">JUN</p>
						<p class="month">JUL</p>
						<p class="month">AUG</p>
						<p class="month">SEP</p>
						<p class="month">OCT</p>
						<p class="month">NOV</p>
						<p class="month">DEC</p>
					</div></story-date>
				</story-dateline>
				<story-skills-table>
					<story-skill>
						<div class="segment" style="width: 100px; left: 150px;">
							<div class="mid"></div>
							<div class="diamond"></div>
							<div class="diamond end"></div>
						</div>
						<div class="segment" style="width: 500px; left: 350px;">
							<div class="mid"></div>
							<div class="diamond"></div>
							<div class="diamond end"></div>
						</div>
					</story-skill>
					<story-skill>
						<div class="segment" style="width: 300px; left: 200px;">
							<div class="mid"></div>
							<div class="diamond"></div>
							<div class="diamond end"></div>
						</div>
					</story-skill>
					<story-skill>
						<div class="segment" style="width: 200px; left: 700px;">
							<div class="mid"></div>
							<div class="diamond"></div>
							<div class="diamond end"></div>
						</div>
					</story-skill>
					<story-skill>
						<div class="segment" style="width: 500px; left: 500px;">
							<div class="mid"></div>
							<div class="diamond"></div>
							<div class="diamond end"></div>
						</div>
					</story-skill>
					<story-skill>
						<div class="segment" style="width: 600px; left: 700px;">
							<div class="mid"></div>
							<div class="diamond"></div>
							<div class="diamond end"></div>
						</div>
					</story-skill>
					<story-skill>
						<div class="segment" style="width: 600px; left: 700px;">
							<div class="mid"></div>
							<div class="diamond"></div>
							<div class="diamond end"></div>
						</div>
					</story-skill>
				</story-skills-table>
			</div>
		`;
	}
}
customElements.define('story-list', StoryList);


class StoryBar extends HTMLElement{
	constructor(){
		super();
	}
	init(){
	}
	connectedCallback(){
		this.innerHTML=`
			<story-bar-item><p>Javascript</p></story-bar-item>
			<story-bar-item><p>JAVA</p></story-bar-item>
			<story-bar-item><p>C#</p></story-bar-item>
			<story-bar-item><p>PHP</p></story-bar-item>
		`;
	}
}
customElements.define('story-bar', StoryBar);



class ToggleButtonList extends HTMLElement{
	constructor(){
		super();
	}
	init(items){
		this.listElm.init(items,()=>{return new ToggleButton()});
	}
	connectedCallback(){
		this.listElm=new ListRepeater();
		appElm(this.listElm,this);
	}
}
customElements.define('toggle-button-list', ToggleButtonList);

class ToggleButton extends HTMLElement{
	constructor(){
		super();
	}
	init(toggleItem){
		this.selected=toggleItem.selected;
		this.togSub=()=>{this.updateToggle()};
		this.selected.sub(bindType.SET,this.togSub);
		this.innerHTML=`
			<button class="clickable">
				<div class="surface">${toggleItem.name.data}</div>
				<div class="selector"><div></div></div>
			</button>
		`;
		this.btnElm=getElm("button",this);
		this.btnElm.onclick=()=>{this.click()};
		this.togSub();
	}
	click(){
		newUpdate();
		this.selected.data=true;
	}
	updateToggle(){
		if(this.selected.data){
			addClass("selected",this.btnElm);
		}else{
			removeClass("selected",this.btnElm);
		}
	}
	connectedCallback(){
	}
}
customElements.define('toggle-button', ToggleButton);

class EndSymbol extends HTMLElement{
	constructor(){
		super();
	}
	init(){
		
	}
	connectedCallback(){
		this.innerHTML=`
			<div class="icon"></div>
			<div class="line"></div>
			<div class="cover"></div>
		`;
	}
}
customElements.define('end-symbol', EndSymbol);

class SectionTitle extends HTMLElement{
	constructor(){
		super();
		this.dispElm=new PriceInput();
	}
	init(textSimple){
		this.innerHTML=`
			<h3 class="">${textSimple}</h3>
			<div class="cover"></div> 	
		`;
	}
	connectedCallback(){
	}
}
customElements.define('section-title', SectionTitle);

class Decoration extends HTMLElement{
	constructor(){
		super();
	}
	init(){
		let resizeSub=()=>{this.resize()};
		window.addEventListener("resize", resizeSub);
		this.resize();
	}
	resize(){
		this.decorative.width=this.clientWidth;
		this.decorative.height=this.clientHeight;
	}
	connectedCallback(){
		this.decorative=newElm("CANVAS","decorative");
		appElm(this.decorative,this);
	}
}
customElements.define('decoration-control', Decoration);
