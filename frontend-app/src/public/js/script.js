var routes = [
	{
		name:"Home",
		route: "/",
		file: "home"
	},{
		name:"Settings",
		route: "/settings",
		file: "settings"
	}
]
// 404 page
var notFound = {
	name:"Not found",
	file:"404"
};
var intervalNumbers = [];

// Check if two routes are the same
function matchRoute(route1, route2) {
	var route1Pages = route1.split("/").filter(Boolean),
			route2Pages = route2.split("/").filter(Boolean);
	if(route1Pages.length == route2Pages.length){
		for(var i=0;i<route1Pages.length;i++){
			if(route1Pages[i] != "<>"){
				if(route1Pages[i] != route2Pages[i]){
					return false;
				}
			}
		}
	}else{
		return false;
	}
	return true;
}

// redirect to the desired page
function route(route,push = true){
	var page;
	for(var i=0;i<routes.length;i++){
		var path = routes[i].route;
		if(matchRoute(path, route)){
			page = routes[i];
			break;
		}
	}
	if(!page){
		page = notFound;
	}
	if(intervalNumbers.length > 0){
		for(var i=0;i<intervalNumbers.length;i++){
			clearInterval(intervalNumbers[i]);	
		}
		intervalNumber = [];
	}
	if(push)
		history.pushState(1,"Domore", route);
	else
		history.replaceState(1,"Domore", route);
	function afterLoadingHTML(html){

		document.querySelector("main").innerHTML = html;
		if(page.code){
			page.code();
		}else{
			axios.get(`/js/pages/${page.file}.js`).then(res => {
				page.code = Function(res.data);
				page.code();
			});
		}
	}
	if(page.html){
		afterLoadingHTML(page.html)

	}else{
		axios.get("/pages/" + page.file + ".html"). then((res) => {
			afterLoadingHTML(res.data);
			page.html = res.data;
		});	
	}
	
	
}



document.body.addEventListener("click", (e) => {
	if(e.target.tagName != "A") return;
	if(e.target.getAttribute("href")[0] === "/"){
		e.preventDefault();
		route(e.target.getAttribute("href"));
	}
});

window.onpopstate = function(e){
	console.log(location.pathname);
	route(location.pathname, false);
};

route(document.location.pathname);
