var sharedData={
	pageToggle: [true,false,false,false,false],
	projectTagIndex: 1,
	projectTags:
	[
		{
			name: "Design",
			tag: "design",
			selected: false
		},
		{
			name: "Programming",
			tag: "programming",
			selected: true
		},
		{
			name: "Art",
			tag: "art",
			selected: false
		}
	],
	projects:
	[
		{
			name: "Ant Farm",
			description: "An evolutionary simulation based off langton's ant.",
			path: "",
			tags: ["programming"],
			highlighted: true,
			visible: false
		},
		{
			name: "Fire Simulation",
			description: "A visually plausible simulation for low resolution fire.",
			path: "",
			tags: ["programming"],
			highlighted: false,
			visible: false
		},
		{
			name: "Alchemy Circles",
			description: "An algorithmic approach to creating alchemy circle designs.",
			path: "",
			tags: ["programming", "art"],
			highlighted: false,
			visible: false
		},
		{
			name: "2048",
			description: "An AI to play the game 2048.",
			path: "",
			tags: ["programming"],
			highlighted: false,
			visible: false
		},
		{
			name: "Voxel Cathedral",
			description: "A gothic cathedral built in minecraft",
			path: "",
			tags: ["art"],
			highlighted: false,
			visible: false
		}
	]
};
sharedData=bind(sharedData,true);
setupPaging(sharedData.projectTags,sharedData.projectTagIndex);
//setup tag filters
for(let i=0;i<sharedData.projects.length;i++){
	let tagSub=(info)=>{
		let idx=sharedData.projectTagIndex.data;
		let selTag=sharedData.projectTags[idx].tag.data;
		let item=sharedData.projects[i];
		let itemTags=item.tags;
		let contained=false;
		for(let i=0;i<itemTags.length;i++){
			if(itemTags[i].data==selTag){
				contained=true;
				break;
			}
		}
		item.visible.data=contained;
	};
	sharedData.projectTagIndex.sub(bindType.SET,tagSub);
	tagSub();
}

var pageData={
	title: "Adrian Margel",
	categoryIndex: 0,
	categoriesDown: false,
	categories:
	[
		{
			name: "Home",
			selected: sharedData.pageToggle[0],
			isMid: false
		},
		{
			name: "Projects",
			selected: sharedData.pageToggle[1],
			isMid: true
		},
		{
			name: "About Me",
			selected: sharedData.pageToggle[2],
			isMid: false
		},
		{
			name: "Contact",
			selected: sharedData.pageToggle[3],
			isMid: false
		}
	],
	pages:
	[
		{
			type: "Home",
			selected: sharedData.pageToggle[0],
			projectTagIndex: sharedData.projectTagIndex,
			projectTags: sharedData.projectTags,
			projects: sharedData.projects
		},
		{
			type: "Projects",
			selected: sharedData.pageToggle[1],
			projectTags: sharedData.projectTags,
			projects: sharedData.projects
		},
		{
			type: "About",
			selected: sharedData.pageToggle[2]
		},
		{
			type: "Contact",
			selected: sharedData.pageToggle[3]
		},
		{
			type: "Project",
			selected: sharedData.pageToggle[4]
		}
	]
};
pageData=bind(pageData,true);

setupPaging(pageData.categories,pageData.categoryIndex);

// for(let i=0;i<pageData.categories.length;i++){
// 	//create sub to update index when a category is selected
// 	pageData.categories[i].selected.sub(bindType.SET,()=>{
// 		if(pageData.categories[i].selected.data){
// 			pageData.categoryIndex.data=i;
// 		}
// 	});
// 	//create sub to update each category when the index changes
// 	pageData.categoryIndex.sub(bindType.SET,()=>{
// 		pageData.categories[i].selected.data=pageData.categoryIndex.data===i;
// 	});
// }

//update nav based on scroll
document.addEventListener("scroll", checkStickyNav);
function checkStickyNav(){
	if(window.scrollY>400){
		if(!pageData.categoriesDown.data){
			newUpdate();
			pageData.categoriesDown.data=true;
		}
	}else{
		if(pageData.categoriesDown.data){
			newUpdate();
			pageData.categoriesDown.data=false;
		}
	}
}

//add elements
{
	let header=new Header();
	appElm(header,document.body);
	header.init(pageData.categories,pageData.title,pageData.categoriesDown);

	let body=new Body();
	appElm(body,document.body);
	body.init(pageData.pages);

	//let priceCalculator=new PriceCalculator();
	//appElm(priceCalculator,document.body);
	//priceCalculator.init(sharedData.priceList);
}